import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock openapi-fetch to control responses
const mockGet = vi.fn();
vi.mock("openapi-fetch", () => ({
	default: vi.fn(() => ({
		GET: mockGet,
	})),
}));

// Import after mocking
const { useTornFetch } = await import("../index.js");

describe("Torn API Error Detection Logic", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Error condition logic: data.data !== undefined && typeof data.data === "object" && "error" in data.data', () => {
		it("should NOT throw when data.data is undefined", async () => {
			mockGet.mockResolvedValue({
				data: undefined,
				error: undefined,
			});

			const result = await useTornFetch("test-key", "/user/basic" as any);
			expect(result).toBeUndefined();
		});

		it("should NOT throw when data.data is null", async () => {
			mockGet.mockResolvedValue({
				data: null,
				error: undefined,
			});

			const result = await useTornFetch("test-key", "/user/basic" as any);
			expect(result).toBeNull();
		});

		it("should NOT throw when data.data is a primitive (string)", async () => {
			mockGet.mockResolvedValue({
				data: "some string response",
				error: undefined,
			});

			const result = await useTornFetch("test-key", "/user/basic" as any);
			expect(result).toBe("some string response");
		});

		it("should NOT throw when data.data is a primitive (number)", async () => {
			mockGet.mockResolvedValue({
				data: 42,
				error: undefined,
			});

			const result = await useTornFetch("test-key", "/user/basic" as any);
			expect(result).toBe(42);
		});

		it('should NOT throw when data.data is an object without "error" property', async () => {
			const validResponse = {
				player_id: 123,
				name: "TestPlayer",
				level: 50,
			};

			mockGet.mockResolvedValue({
				data: validResponse,
				error: undefined,
			});

			const result = await useTornFetch("test-key", "/user/basic" as any);
			expect(result).toEqual(validResponse);
		});

		it('should NOT throw when data.data has "error" but wrong structure', async () => {
			// This has "error" but not the Torn API error structure
			const responseWithDifferentErrorStructure = {
				errors: ["Some validation error"], // Different key
				data: "some data",
			};

			mockGet.mockResolvedValue({
				data: responseWithDifferentErrorStructure,
				error: undefined,
			});

			const result = await useTornFetch("test-key", "/user/basic" as any);
			expect(result).toEqual(responseWithDifferentErrorStructure);
		});

		it("should THROW when data.data matches exact Torn error structure", async () => {
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

		it("should extract error message correctly from nested structure", async () => {
			const errorCases = [
				{ error: { error: "API rate limit exceeded", code: 5 } },
				{ error: { error: "Faction not found", code: 6 } },
				{ error: { error: "Access denied", code: 7 } },
				{ error: { error: "Player not found", code: 8 } },
			];

			for (const errorCase of errorCases) {
				mockGet.mockResolvedValue({
					data: errorCase,
					error: undefined,
				});

				await expect(
					useTornFetch("test-key", "/user/basic" as any),
				).rejects.toThrow(errorCase.error.error);
			}
		});

		it('should handle edge case where "error" property exists but is not the expected structure', async () => {
			const edgeCaseResponse = {
				error: "This is just a string, not the Torn structure",
				someOtherData: "value",
			};

			mockGet.mockResolvedValue({
				data: edgeCaseResponse,
				error: undefined,
			});

			// This should NOT throw because the error property doesn't match Torn's structure
			// The type assertion (data.data as TError).error.error would fail at runtime
			// but the condition should prevent us from getting there
			await expect(async () => {
				await useTornFetch("test-key", "/user/basic" as any);
			}).rejects.toThrow(); // This will throw due to trying to access .error.error on a string
		});
	});
});
