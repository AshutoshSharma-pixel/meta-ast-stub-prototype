# Contributing to meta-ast-stub-prototype

Thank you for your interest in contributing to this architectural prototype!

## Exploratory Nature

Please remember that this project is an **experimental proof-of-concept**. It is designed to validate ideas around metadata-driven stub generation for MetaCall IntelliSense.

## Code Style & Principles

- **Maintain Modularity**: Keep generators separated.
- **Simplicity over Completeness**: We do not aim to map every edge case of the TypeScript or Python type systems here. Aim for clean demonstrations.
- **No Runtime Dependencies**: The prototype should remain a static analysis tool. Do not add dependencies that require running the actual user code.

## How to Contribute

1. **Open an Issue**: For any major changes or discussions.
2. **Submit a PR**: Ensure that `npm run generate` works and produces valid stubs.
3. **Expand Examples**: Adding more complex edge cases to `input/metaast.json` is a great way to contribute.

## Areas for Exploration

- Adding support for more complex types (unions, generics).
- Implementing a new generator for a different language (e.g., Ruby `.rbi`).
- Improving the parser to simulate streaming metadata.
