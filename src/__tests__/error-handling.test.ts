import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the entire torn-api module since it's generated
vi.mock("../torn-api.ts", () => ({
	// Mock the paths type - this will be overridden by the actual types in tests
}));

// Mock openapi-fetch before importing our module
const mockGet = vi.fn();
vi.mock("openapi-fetch", () => ({
	default: vi.fn(() => ({
		GET: mockGet,
	})),
}));

// Import after mocking
const { useTornFetch } = await import("../index.js");

describe("useTornFetch error detection", () => {
	beforeEach(() => {
		vi.clearAllMocks();
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
			useTornFetch("test-key", "/user/basic" as any),
		).rejects.toThrow("Invalid API key");
	});

	it("should not throw for valid data that happens to have an error property", async () => {
		// Test case where response data legitimately contains "error" but isn't an error
		const validResponseWithErrorProperty = {
			attacks: [],
			errors: [], // This is different from the Torn error structure
			someOtherData: "value",
		};

		mockGet.mockResolvedValue({
			data: validResponseWithErrorProperty,
			error: undefined,
		});

		const result = await useTornFetch("test-key", "/faction/attacks" as any);
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
				error: errorCase,
			};

			mockGet.mockResolvedValue({
				data: errorResponse,
				error: undefined,
			});

			await expect(
				useTornFetch("test-key", "/faction/basic" as any),
			).rejects.toThrow(errorCase.error);
		}
	});
});
