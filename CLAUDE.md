# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`@nuxx/torn-fetch` is a TypeScript wrapper around `openapi-fetch` for the Torn API (a game API). It provides type-safe API calls with automatic error handling that throws JavaScript errors when the Torn API returns error responses.

## Commands

### Development Workflow
```bash
bun install              # Install dependencies
bun run get-schema       # Download latest Torn API schema and generate TypeScript types
bun run build            # Build using tsup (outputs to dist/)
bun run lint             # Run ESLint
bun run type-check       # Run TypeScript type checking
bun test                 # Run test suite once
bun run test:watch       # Run tests in watch mode
bun run test:coverage    # Run tests with coverage report
bun run ci               # Full CI pipeline: get-schema, lint, type-check, test, build
```

### Key Workflow Notes
- Always run `bun run get-schema` before building if you need the latest API types
- The `get-schema` script downloads `openapi.json` and generates `torn-api.ts` using `openapi-typescript`
- Tests require 100% code coverage - this is a project standard

## Architecture

### Core Structure
The library consists of a single main export (`tornFetch`) that wraps `openapi-fetch`:

1. **Type Generation Flow**: `openapi.json` → `openapi-typescript` → `torn-api.ts` (generated types)
2. **API Client**: Single shared `apiClient` instance created with `openapi-fetch` pointing to `https://api.torn.com/v2`
3. **Error Detection**: Response data is checked for Torn API error structure (`{ error: { error: string, code: number } }`)

### Key Files
- `src/index.ts` - Main library export with `tornFetch` function and `fetchOrThrowError` helper
- `src/torn-api.ts` - **Generated file** (do not edit manually), created by `openapi-typescript`
- `src/openapi.json` - **Downloaded schema** from Torn API

### Type System
The library uses TypeScript path-based generics:
- `TParams<T>` - Extracts parameter types for a given path
- `TResponse<T>` - Extracts response types for a given path
- `TError` - Represents Torn API error structure

Parameters are passed as a single object with `query` and `path` properties that match the Torn API expectations.

### Error Handling Logic
The error detection (in `fetchOrThrowError`) handles two types of errors:
1. **Transport/network errors**: Checks `data.error` from openapi-fetch and throws it
2. **Torn API errors**: Validates the full nested structure `{ error: { error: string, code: number } }`

```typescript
// Handle transport/network errors
if (data.error) {
  throw data.error;
}

// Check for Torn API error responses
if (data.data !== undefined && data.data !== null && typeof data.data === 'object' && 
    "error" in data.data && typeof data.data.error === 'object' && 
    data.data.error !== null && "error" in data.data.error) {
  throw new Error((data.data as TError).error.error);
}
```
This ensures we only throw errors for actual Torn API errors, not for null/undefined/primitive responses.

## Testing Philosophy

- **100% code coverage** is required and enforced
- Tests are organized into three files:
  - `index.test.ts` - Core functionality and parameter handling
  - `error-detection.test.ts` - Edge cases for error detection logic
  - `error-handling.test.ts` - Torn API error scenarios
- Generated files (`torn-api.ts`, `openapi.json`) are excluded from coverage
- Uses Bun's built-in test runner with mocking via `mock` from `bun:test`
- Shared mock setup in `src/__tests__/setup.ts` to avoid module cache conflicts

## Build System

- **tsup** is used for building
- Output: ESM format only, minified with Terser
- Generates both `.js` and `.d.ts` files in `dist/`
- Build config: `tsup.config.ts`

## Type Narrowing

The library provides full type narrowing based on the path parameter:
- When you call `tornFetch('/user/basic', ...)`, TypeScript knows the return type is specifically the `/user/basic` response
- This is achieved by using the generic `T extends keyof paths` and ensuring it flows through `fetchOrThrowError<T>`
- The `as any` cast on the openapi-fetch call is necessary due to complex conditional types but doesn't affect external type safety
