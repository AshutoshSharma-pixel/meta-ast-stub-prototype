# VS Code Validation Example

This directory demonstrates how the generated stubs provide a premium IntelliSense experience in modern editors like VS Code.

## Files
- `metacall.d.ts`: Copied from `output/`
- `metacall.pyi`: Copied from `output/`
- `test.ts`: TypeScript usage example
- `test.py`: Python usage example

## IntelliSense Features Validated

### 1. Autocomplete for Nested Objects
When calling `getUser(1).profile.`, VS Code correctly suggests `name`, `verified`, and `tags`.

### 2. Type Inference
The return type of `getUser` is correctly inferred as `GetUserResult`.

### 3. Hover Support
Hovering over `getUser` shows the docstring: "Retrieves a user profile with nested structures."

## Screenshot Simulation (Markdown)

**TypeScript:**
```typescript
import { getUser } from './metacall';

const user = getUser(123);
user.profile.name; // Autocomplete works!
//           ^ suggestions: name, verified, tags
```

**Python:**
```python
from metacall import getUser

user = getUser(123)
print(user['profile']['name']) # TypedDict validation works!
```

## Limitations Identified
- **Circular Dependencies**: Currently not handled in graph or type generation.
- **Union Types**: Only `Optional` (via `| undefined` or `Optional[]`) is partially supported through the internal normalizer.
- **Python TypedDict vs Object**: Accessing via `user['profile']` is required for TypedDict, which is different from TS dot notation.
