# MetaCall Loader Type Mapping Research

This document details findings from investigating how data types are mapped between native programming languages (Python, JavaScript/Node.js, TypeScript) and the MetaCall universal runtime core, and how we can represent these mappings as structured metadata.

---

## 1. Actual Loader Mapping Implementations

MetaCall uses a core C library (`metacall/core`) that coordinates value exchange via the `metacall_value` interface (defined in `source/metacall/include/metacall/metacall_value.h` with type codes in `enum metacall_value_id`). Each language loader bridges its native runtime object model with these core values.

### A. Python Loader (`py_loader`)
*   **Source File:** `source/loaders/py_loader/source/py_loader_impl.c`
*   **Mechanism:** Converts between `PyObject *` (Python C API) and `metacall_value`.
*   **Implementation Location:** Inside functions like `py_loader_impl_to_metacall_value` and `metacall_value_to_py_loader_impl`.
*   **Conversion Rules (Python → MetaCall Core):**
    *   `PyBool_Check` → `METACALL_BOOL`
    *   `PyLong_Check` → `METACALL_LONG` (or `METACALL_INT` if it fits)
    *   `PyFloat_Check` → `METACALL_DOUBLE`
    *   `PyUnicode_Check` → `METACALL_STRING`
    *   `PyBytes_Check` / `PyByteArray_Check` → `METACALL_BUFFER`
    *   `PyList_Check` / `PyTuple_Check` / `PySet_Check` → `METACALL_ARRAY`
    *   `PyDict_Check` → `METACALL_MAP`
    *   `PyCallable_Check` → `METACALL_FUNCTION`
    *   `Py_None` → `METACALL_NULL`

### B. Node.js Loader (`node_loader`)
*   **Source File:** `source/loaders/node_loader/source/node_loader_impl.cpp`
*   **Mechanism:** Conversions between V8 Engine API wrappers `v8::Local<v8::Value>` and `metacall_value`.
*   **Implementation Location:** Inside functions like `node_loader_impl_to_metacall_value` and `metacall_value_to_node_loader_impl` (which use V8 isolates).
*   **Conversion Rules (JavaScript/Node.js → MetaCall Core):**
    *   `val->IsBoolean()` → `METACALL_BOOL`
    *   `val->IsNumber()` → `METACALL_DOUBLE` (V8 defaults all JS numbers to 64-bit float doubles)
    *   `val->IsString()` → `METACALL_STRING`
    *   `val->IsArrayBuffer()` / `val->IsTypedArray()` → `METACALL_BUFFER`
    *   `val->IsArray()` → `METACALL_ARRAY`
    *   `val->IsObject()` (and not Array/Function) → `METACALL_MAP`
    *   `val->IsFunction()` → `METACALL_FUNCTION`
    *   `val->IsPromise()` → `METACALL_FUTURE`
    *   `val->IsNull()` / `val->IsUndefined()` → `METACALL_NULL`

### C. TypeScript Loader (`ts_loader`)
*   **Source File:** `source/loaders/ts_loader/source/ts_loader_impl.cpp` and JS/TS side signature parsers.
*   **Mechanism:** TypeScript compiles to JavaScript and uses the underlying Node.js loader for runtime values. However, `ts_loader` parses typescript source code at load time to construct type declarations.
*   **Implementation Location:** Uses the TypeScript Compiler API (`ts.createProgram`, `checker.getTypeAtLocation`) to build functions' signatures.
*   **Conversion Rules (TypeScript Annotation → MetaCall Type Identification):**
    *   `ts.TypeFlags.Boolean` / `boolean` → `METACALL_BOOL`
    *   `ts.TypeFlags.Number` / `number` → `METACALL_DOUBLE`
    *   `ts.TypeFlags.String` / `string` → `METACALL_STRING`
    *   `ts.TypeFlags.Object` / `any object` → `METACALL_MAP`
    *   `Array` / `T[]` → `METACALL_ARRAY`
    *   `Promise<T>` → `METACALL_FUTURE`
    *   `any` → `METACALL_PTR` / `METACALL_NULL` (depends on fallback)

---

## 2. Analysis of the Mapping Problem

### Explicit vs. Implicit Mappings
Currently, all loader type conversions are **implicit**. There is no centralized registry, struct, or configuration file (e.g. JSON or YAML) that dictates these mappings. Instead:
- Conversions are hardcoded as **imperative logic** inside C/C++ files utilizing conditional statement blocks (`if/else` checks).
- Tooling (such as `meta-ast`, LSP servers, stub generators) cannot programmatically query a loader to ask "how do you represent Python `float`?" or "what does V8 `number` map to?".
- The only way to find out is to read the C/C++ source code manually, which is highly prone to drift if a loader is updated.

### Type Collapse and Information Loss
Cross-language interoperability suffers from "resolution mismatch." When transferring data from a language with richer type distinctions to one with fewer, information is collapsed:

#### 1. Numeric Type Collapse (MetaCall Core → JavaScript)
MetaCall core defines various numeric types:
*   `METACALL_CHAR`
*   `METACALL_SHORT`
*   `METACALL_INT`
*   `METACALL_LONG`
*   `METACALL_FLOAT`
*   `METACALL_DOUBLE`

In JavaScript, all of these collapse into V8 `number` (which is a double-precision float):
$$\text{METACALL\_SHORT} \cup \text{METACALL\_INT} \cup \text{METACALL\_LONG} \cup \text{METACALL\_FLOAT} \cup \text{METACALL\_DOUBLE} \longrightarrow \text{number}$$

#### 2. Sequence Type Collapse (Python → MetaCall Core)
Python defines `list`, `tuple`, and `set`.
*   Both `list` and `tuple` are mapped to `METACALL_ARRAY`.
*   When a Python tuple is passed through MetaCall to a Python host, it is received as a `list` rather than a `tuple`, meaning the immutability constraint is lost.
$$\text{tuple} \cup \text{list} \cup \text{set} \longrightarrow \text{METACALL\_ARRAY} \longrightarrow \text{list}$$

#### 3. High-Precision Ints Loss (Python → Node.js)
Python supports arbitrary-precision integers. When passing a very large integer to Node.js via MetaCall:
*   If converted to `METACALL_LONG`, V8 will read it as a standard double-precision float (which has only 53 bits of safe integer representation).
*   Unless explicitly marshaled into `BigInt` (which is not standard for `METACALL_LONG`), precision is lost silently.

---

## 3. Investigated Approaches

To address these limitations, we analyze three potential architectural solutions:

### Approach A: Exposing Mappings through MetaCall APIs
Each loader can export a metadata function alongside its load/execute functions.
*   **Implementation:** Add a `const char *loader_get_type_mappings(void)` API to the loader interface. The loader would return a serialized JSON string detailing its explicit bidirectional mapping rules.
*   **Pros:**
    - Single source of truth: the loader binary itself.
    - Runtime-queryable by external orchestrators and tools.
    - Zero drift between loader behavior and tooling declarations.
*   **Cons:**
    - Requires modifying the loader plugin specification in MetaCall Core.
    - Adding JSON serialization to low-level C loaders adds runtime bloat/dependencies (unless manually formatted).

### Approach B: Static Parsing of Loader Code
A static analyzer runs during CI/CD to scan loader source code for specific markers or macros and extract type mapping metadata automatically.
*   **Implementation:** We search for C macros or specific function signatures (e.g., `PyFloat_Check`, `val->IsNumber()`) to construct the mapping database.
*   **Pros:**
    - Non-invasive; doesn't require modifying MetaCall Core code.
    - Easy to generate JSON/Markdown documentation in CI.
*   **Cons:**
    - High fragility: minor variations in code style or refactoring inside the loaders will break parser regular expressions or AST patterns.
    - Only captures the syntax, not actual runtime quirks.

### Approach C: Compile-Time Consistency Guarantees
Incorporate static asserts or build-time checks in each loader that ensure its internal serialization tables match a shared JSON specification.
*   **Implementation:** A central JSON schema defining mappings is placed in the core repository. Loader code uses compilation hooks or tests to verify that every ID in the schema maps to the correct C-level case statement.
*   **Pros:**
    - Strong safety: the build fails if code and metadata drift.
    - Documentations are guaranteed to match the actual executable.
*   **Cons:**
    - High initial engineering effort.
    - Tight coupling between the core and individual loader plugin packages.
