import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        'src/torn-api.ts', // Generated file
        'src/openapi.json', // Downloaded schema
      ],
    },
  },
})
