# Future Directions: MetaCall IntelliSense & `meta-ast`

This document outlines the long-term vision for scaling the architecture validated by this prototype.

## 1. Integration with `meta-ast` APIs

While this prototype consumes a flat JSON file, the real `meta-ast` implementation builds a rich **Semantic Graph**. Future iterations of this generator will:
- Consume serialized graph formats or interact directly via IPC/FSI.
- Resolve cross-file dependencies and imports natively.
- Utilize the `SymbolNode` and `Edge` structures to handle complex visibility and scoping.

## 2. LSP Workflows

Generating files to disk is a great intermediate step, but the ultimate goal is a fully-featured **Language Server Protocol (LSP)** implementation.

- **In-Memory Stubs**: Instead of writing to the file system, the LSP server can generate these stubs in-memory and serve them to the editor via `textDocument/didOpen` or virtual file systems.
- **Dynamic Capabilities**: Support for autocomplete, go-to-definition, and find-references across language boundaries by querying the central `meta-ast` graph.

## 3. Incremental Generation

Re-generating the entire stub set on every file change is inefficient for large codebases.
- **Diff-Based Updates**: `meta-ast` supports incremental parsing. The generators should be updated to only overwrite the stubs of files or modules that have actually changed.
- **Debouncing**: Editor workflows should debounce generation requests to prevent CPU spikes during heavy typing.

## 4. Multi-Language Expansion

The type mapping system in this prototype is minimal. To support MetaCall's polyglot nature, we need:
- Mapping generators for Ruby (`.rbi`), Go, C/C++, and others.
- A more robust intermediate type representation that can handle complex generics, union types, and structural typing.

## 5. Semantic Graph-Driven Tooling

Beyond IntelliSense, the normalized symbol model can power:
- **Dependency visualizers**: Showing how code flows across languages.
- **Dead code detectors**: Finding unused functions even if they are only called from another language.
- **Refactoring tools**: Renaming a function in Python and having it automatically update usages in TypeScript.
