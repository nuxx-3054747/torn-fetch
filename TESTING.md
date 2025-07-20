# Testing Documentation

This project includes comprehensive tests to ensure reliability and catch potential bugs.

## Test Structure

The test suite includes:

### 1. **Unit Tests** (`src/__tests__/index.test.ts`)
- Tests core functionality of `useTornFetch`
- API key handling
- Parameter passing
- Success scenarios
- Network error handling

### 2. **Error Detection Tests** (`src/__tests__/error-detection.test.ts`)
- Comprehensive testing of the error detection logic
- Edge cases for different data types (null, undefined, primitives, objects)
- Torn API error structure validation
- False positive prevention

### 3. **Error Handling Tests** (`src/__tests__/error-handling.test.ts`)
- Specific Torn API error scenarios
- Error message extraction
- Different error codes and messages

## Running Tests

```bash
# Run tests once
pnpm test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage report
pnpm run test:coverage
```

## Coverage

The test suite achieves **100% code coverage** for the main functionality:

- **Statements**: 100%
- **Branches**: 100% 
- **Functions**: 100%
- **Lines**: 100%
