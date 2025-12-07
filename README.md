# Torn Fetch

A TypeScript wrapper around `openapi-fetch` that provides a better developer experience when working with the Torn API. This library automatically handles authentication and error checking, throwing JavaScript errors when the API returns error responses.

## Features

- **Type-safe API calls**: Full TypeScript support with generated types from Torn's OpenAPI schema
- **Automatic error handling**: Throws JavaScript errors when the API returns error responses
- **Higher-order function pattern**: Create specialized fetchers for specific API endpoints
- **Clean API**: Simple and intuitive interface for making API calls

## Installation

```bash
npm install @nuxx/torn-fetch
```

## Migration from v0.x

If you're upgrading from v0.x, the main export has been renamed from `useTornFetch` to `tornFetch`. The old name still works in v1.x with a deprecation warning, but will be removed in v2.0.0.

**Migration:**
```typescript
// Old (v0.x)
import { useTornFetch } from '@nuxx/torn-fetch'
const data = await useTornFetch(apiKey, path)

// New (v1.0+)
import { tornFetch } from '@nuxx/torn-fetch'
const data = await tornFetch(apiKey, path)
```

The function signature and behavior are identical.

## Usage

### Basic Usage

```typescript
import { tornFetch } from '@nuxx/torn-fetch'

try {
  const userAttacks = await tornFetch( 
    'your-api-key',
    '/user/attacks'
  )
  console.log(userAttacks)
} catch (error) {
  console.error('API Error:', error.message)
}
```

```typescript
import { tornFetch } from '@nuxx/torn-fetch'

// Use with path parameters
const attacks = await tornFetch(
  'your-api-key',
  '/faction/{id}/chain',
  {
    path: {
      id: 33458
    }
  }
)
```

```typescript
import { tornFetch } from '@nuxx/torn-fetch'

// Use with query parameters
const attacks = await tornFetch(
  'your-api-key',
  '/user/attacks',
  {
    query: {
      limit: 25,
      from: 1753037683
    }
  }
)
```

### Error Handling

The library automatically throws JavaScript errors when the Torn API returns error responses:

```typescript
import { tornFetch } from '@nuxx/torn-fetch'

try {
  const userAttacks = await tornFetch( 
    'invalid-key-abc123',
    '/user/attacks'
  )
  console.log(userAttacks)
} catch (error) {
  console.error('API Error:', error.message)
}
```

## API Reference

### `tornFetch<TPath>(apiKey: string, path: TPath, options?: TParams<TPath>): Promise<TResponse<TPath>>`

Makes a type-safe call to the Torn API with automatic error handling.

**Parameters:**
- `apiKey`: Your Torn API key
- `path`: The API endpoint path (e.g., `/user`, `/faction/{id}/chain`)
- `options` (optional): An object conforming to the values expected by the Torn API, including:
  - `query`: Query parameters to include in the request
  - `path`: Path parameters to replace in the endpoint path

**Returns:** Promise resolving to the API response data

**Throws:** JavaScript error if the API returns an error response

## Development

### Prerequisites

- Node.js 18+
- Bun

### Setup

```bash
# Install dependencies
bun install

# Get the latest Torn API schema and build
bun run build
```

### Scripts

- `bun run get-schema` - Downloads the latest Torn API OpenAPI schema and generates TypeScript types
- `bun run build` - Builds the project using tsup
- `bun run lint` - Runs ESLint on the codebase
- `bun run type-check` - Runs TypeScript type checking
- `bun test` - Runs the test suite
- `bun run test:watch` - Runs tests in watch mode
- `bun run test:coverage` - Runs tests with coverage reporting
- `bun run ci` - Runs the complete CI pipeline (schema, lint, type-check, test, build)

## Testing

This package includes comprehensive tests with 100% code coverage. The test suite covers:

- **Core functionality**: API calls, parameter handling, authentication
- **Error handling**: Torn API error detection and JavaScript error throwing  
- **Edge cases**: Null values, undefined responses, non-object data
- **Type safety**: Proper TypeScript type checking

Run tests with:
```bash
bun run test              # Run tests once
bun run test:watch        # Run tests in watch mode
bun run test:coverage     # Run tests with coverage report
```

See [TESTING.md](./TESTING.md) for detailed testing documentation.

## Project Structure

```
torn-fetch/
├── coverage/                 # Test coverage reports
├── dist/                     # Compiled output
├── src/
│   ├── __tests__/           # Test files
│   │   ├── index.test.ts    # Main functionality tests
│   │   ├── error-detection.test.ts # Error detection logic tests
│   │   └── error-handling.test.ts  # Error handling tests
│   ├── index.ts             # Main export (useTornFetch)
│   ├── openapi.json         # Torn API OpenAPI schema
│   └── torn-api.ts          # Generated TypeScript types
├── eslint.config.js         # ESLint configuration
├── package.json
├── tsconfig.json            # TypeScript configuration
├── tsup.config.ts           # Build configuration
├── bun.lock                 # Bun lock file
├── TESTING.md               # Testing documentation
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run the full CI pipeline: `bun run ci`
5. Submit a pull request

All contributions should include appropriate tests and maintain 100% code coverage.

## License

Unlicense

## Author

nuxx [3054747] 
nuxx@nuxx.lol

