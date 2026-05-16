# Research Notes: Semantic Metadata & Stub Generation

This document captures exploratory thoughts and research findings related to `meta-ast` and the stub generation pipeline.

## 1. Tree-sitter for Semantic Extraction

### Observations
- Tree-sitter provides high-speed, incremental parsing which is ideal for real-time semantic extraction.
- However, Tree-sitter is a concrete syntax tree (CST) parser. Converting CST to a meaningful Semantic Graph requires language-specific heuristics.

### Challenges
- **Dynamic Typing**: In Python/JS, types are often missing. `meta-ast` must either:
    - Perform basic type inference.
    - Rely on JSDoc/Type hints.
    - Use a "Dynamic" or "Any" type fallback.

## 2. The Case for TypedDict in Python Stubs

### Why TypedDict?
- Python's `dict` is the default return for many FFI calls (like MetaCall).
- A standard `dict` has no IntelliSense for keys.
- `TypedDict` (from `typing`) allows us to define the *structure* of a dictionary, enabling autocomplete for keys in VS Code (Pylance).

### Comparison
| Approach | IntelliSense | Implementation Complexity |
| :--- | :--- | :--- |
| **Simple `dict`** | None | Low |
| **`TypedDict`** | Key autocomplete | Medium |
| **`NamedTuple`** | Dot notation | Medium |
| **`Dataclass`** | Full object support | High (requires instantiation) |

For stubs, `TypedDict` is the best compromise as it matches the runtime reality of `dict` returns while providing editor benefits.

## 3. LSP vs Disk-based Stubs

### Disk-based (Current Prototype)
- **Pros**: Easy to debug, works with any editor.
- **Cons**: Requires filesystem synchronization, can clutter the project.

### LSP-based (Target Architecture)
- **Pros**: Seamless, no clutter, real-time updates.
- **Cons**: High complexity, requires custom editor plugins or a heavy LSP proxy.

## 4. Normalization Challenges

- **Numeric Types**: Mapping `i32`, `u64`, `float`, and `double` to a single `Numeric` semantic type simplifies generators but loses precision information that might be needed for C/C++ or Rust stubs.
- **Optionality**: How do we represent "Optional" in a language-agnostic way? Currently using a wrapper type, but many languages use union types (`T | null`).
