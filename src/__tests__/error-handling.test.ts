import { beforeEach, describe, expect, it } from "bun:test";
import { mockGet } from "./setup";

// Import after mocking
const { tornFetch } = await import("../index.js");

describe("tornFetch error detection", () => {
	beforeEach(() => {
		mockGet.mockReset();
	});

	it("should correctly identify Torn API error responses", async () => {
		// Test the exact error structure that Torn API returns
		const tornErrorResponse = {
			error: {
				error: "Invalid API key",
				code: 2,
			},
		};

		mockGet.mockResolvedValue({
			data: tornErrorResponse,
			error: undefined,
		});

		await expect(
			tornFetch("test-key", "/user/basic" as any),
		).rejects.toThrow("Invalid API key");
	});

	it("should not throw for valid data that happens to have an error property", async () => {
		// Test case where response data legitimately contains "error" but isn't an error
		const validResponseWithErrorProperty = {
			attacks: [],
			errors: [], // This is different from the Torn error structure
			someOtherData: "value",
			_metadata: {
				links: {
					next: null,
					prev: null,
				}
			}
		};

		mockGet.mockResolvedValue({
			data: validResponseWithErrorProperty,
			error: undefined,
		});

		const result = await tornFetch("test-key", "/faction/attacks" as any);
		expect(result).toEqual(validResponseWithErrorProperty);
	});

	it("should handle the specific error structure format", async () => {
		// Test with different error messages and codes
		const testCases = [
			{ error: "API rate limit exceeded", code: 5 },
			{ error: "Faction not found", code: 6 },
			{ error: "Access denied", code: 7 },
		];

		for (const errorCase of testCases) {
			const errorResponse = {
				error: {
					error: errorCase.error,
					code: errorCase.code,
				},
			};

			mockGet.mockResolvedValue({
				data: errorResponse,
				error: undefined,
			});

			await expect(
				tornFetch("test-key", "/faction/basic" as any),
			).rejects.toThrow(errorCase.error);
		}
	});
});
