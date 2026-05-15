# This file demonstrates how the generated stubs provide IntelliSense in Python.
# Pyright/Pylance will read the .pyi file if it is in the search path.

from metacall import sum

result = sum(5, 10)
print(f"Result: {result}")

# Pyright will flag this:
# result_bad = sum("5", 10) # Argument of type 'str' cannot be assigned to parameter of type 'int'
