import createClient from "openapi-fetch";
import type { paths } from "./torn-api.ts";

/**
 * Extracts parameter types for a given API path.
 * Includes both query and path parameters expected by the Torn API.
 */
type TParams<T extends keyof paths> = Partial<paths[T]["get"]["parameters"]>;

/**
 * Extracts the response type for a given API path.
 * Represents the data returned by a successful API call (200 response).
 */
type TResponse<T extends keyof paths> =
  paths[T]["get"]["responses"][200]["content"]["application/json"];

/**
 * Represents the structure of a Torn API error response.
 */
type TError = { error: { error: string; code: number } };

const apiClient = createClient<paths>({
  baseUrl: "https://api.torn.com/v2",
});

/**
 * Internal helper that performs the API call and throws an error if the Torn API returns an error response.
 * @internal
 */
async function fetchOrThrowError<T extends keyof paths>(
  apiKey: string,
  path: T,
  params?: TParams<T>,
): Promise<TResponse<T>> {
  // Type assertion needed due to openapi-fetch's complex conditional types
  // that don't properly infer when params and headers are combined
  const data = await apiClient.GET(path, {
    params,
    headers: {
      Authorization: `ApiKey ${apiKey}`,
    },
    /* oxlint-disable no-explicit-any */
  } as any);

  // Handle transport/network errors from openapi-fetch
  if (data.error) {
    throw data.error;
  }

  // Check for Torn API error responses
  if (
    data.data !== undefined &&
    data.data !== null &&
    typeof data.data === "object" &&
    "error" in data.data &&
    typeof data.data.error === "object" &&
    data.data.error !== null &&
    "error" in data.data.error
  ) {
    throw new Error((data.data as TError).error.error);
  }

  return data.data as TResponse<T>;
}

/**
 * Makes a type-safe call to the Torn API with automatic error handling.
 *
 * This function wraps `openapi-fetch` to provide a cleaner API experience by:
 * - Automatically adding API key authentication
 * - Throwing JavaScript errors when the Torn API returns error responses
 * - Providing full TypeScript type safety based on the OpenAPI schema
 *
 * @template T - The API path from the Torn API schema
 * @param apiKey - Your Torn API key
 * @param path - The API endpoint path (e.g., `/user/attacks`, `/faction/{id}/chain`)
 * @param params - Optional parameters object with `query` and `path` properties
 * @returns Promise resolving to the API response data
 * @throws {Error} When the Torn API returns an error response
 *
 * @example
 * ```typescript
 * // Basic usage
 * const attacks = await tornFetch('your-api-key', '/user/attacks')
 * ```
 *
 * @example
 * ```typescript
 * // With path parameters
 * const chain = await tornFetch(
 *   'your-api-key',
 *   '/faction/{id}/chain',
 *   { path: { id: 33458 } }
 * )
 * ```
 *
 * @example
 * ```typescript
 * // With query parameters
 * const attacks = await tornFetch(
 *   'your-api-key',
 *   '/user/attacks',
 *   { query: { limit: 25, from: 1753037683 } }
 * )
 * ```
 *
 * @example
 * ```typescript
 * // Error handling
 * try {
 *   const data = await tornFetch('invalid-key', '/user/attacks')
 * } catch (error) {
 *   console.error('API Error:', error.message) // "Invalid API key"
 * }
 * ```
 */
export async function tornFetch<T extends keyof paths>(
  apiKey: string,
  path: T,
  params?: TParams<T>,
): Promise<TResponse<T>> {
  return fetchOrThrowError<T>(apiKey, path, params);
}

let deprecationWarningShown = false;

/**
 * @deprecated Use `tornFetch` instead. This alias will be removed in v2.0.0.
 *
 * The `use` prefix conventionally indicates React hooks, but this is a plain
 * async function. It has been renamed to `tornFetch` for clarity.
 *
 * Migration: Replace `useTornFetch` with `tornFetch` - the signature is identical.
 */
export async function useTornFetch<T extends keyof paths>(
  apiKey: string,
  path: T,
  params?: TParams<T>,
): Promise<TResponse<T>> {
  if (!deprecationWarningShown) {
    console.warn(
      "[@nuxx/torn-fetch] useTornFetch is deprecated and will be removed in v2.0.0. Please use tornFetch instead.",
    );
    deprecationWarningShown = true;
  }
  return tornFetch(apiKey, path, params);
}
