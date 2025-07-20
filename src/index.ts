import createClient from "openapi-fetch";
import type { paths } from "./torn-api.ts";

type TParams<T extends keyof paths> = Partial<
	paths[T]["get"]["parameters"]
>;
type TResponse<T extends keyof paths> =
	paths[T]["get"]["responses"][200]["content"]["application/json"];
type TError = { error: { error: string; code: number } };

const apiClient = createClient<paths>({
	baseUrl: "https://api.torn.com/v2",
});

async function fetchOrThrowError<T extends keyof paths>(
	apiKey: string,
	path: keyof paths,
	params?: Record<string, unknown>,
): Promise<TResponse<T>> {
	const init = {
		params,
		headers: {
			Authorization: `ApiKey ${apiKey}`,
		},
	} as TParams<T>;

	const data = await apiClient.GET(path, init);

	if (data.data !== undefined && data.data !== null && typeof data.data === 'object' && "error" in data.data) {
		throw new Error((data.data as TError).error.error);
	}

	return data.data as Promise<TResponse<T>>;
}

export async function useTornFetch<T extends keyof paths>(apiKey: string, path: T, params?: TParams<T>) {
	return await fetchOrThrowError(
		apiKey,
		path,
		params,
	) as TResponse<T>;
}
