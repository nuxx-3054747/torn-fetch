import { beforeEach, describe, expect, it } from "bun:test";
import { mockGet } from "./setup";

// Import after mocking
const { tornFetch } = await import("../index.js");

describe("tornFetch", () => {
	const mockApiKey = "test-api-key-123";

	beforeEach(() => {
		mockGet.mockReset();
	});

	describe("successful API calls", () => {
		it("should return data when API call is successful", async () => {
			const mockResponseData = {
				ID: 12345,
				name: "Test Faction",
				tag: "TEST",
				members: [],
			};

			mockGet.mockResolvedValue({
				data: mockResponseData,
				error: undefined,
			});

			const result = await tornFetch(mockApiKey, "/faction/basic" as any);

			expect(result).toEqual(mockResponseData);
			expect(mockGet).toHaveBeenCalledWith("/faction/basic", {
				params: undefined,
				headers: {
					Authorization: `ApiKey ${mockApiKey}`,
				},
			});
		});

		it("should pass parameters correctly", async () => {
			const mockParams = { selections: "basic,members" };
			const mockResponseData = { ID: 12345, name: "Test Faction" };

			mockGet.mockResolvedValue({
				data: mockResponseData,
				error: undefined,
			});

			const result = (await tornFetch(
				mockApiKey,
				"/faction/basic" as any,
				mockParams,
			)) as any;

			expect(result).toEqual(mockResponseData);
			expect(mockGet).toHaveBeenCalledWith("/faction/basic", {
				params: mockParams,
				headers: {
					Authorization: `ApiKey ${mockApiKey}`,
				},
			});
		});
	});

	describe("error handling", () => {
		it("should throw an error when API returns an error response", async () => {
			const mockErrorResponse = {
				error: {
					error: "Invalid API key",
					code: 2,
				},
			};

			mockGet.mockResolvedValue({
				data: mockErrorResponse,
				error: undefined,
			});

			await expect(
				tornFetch(mockApiKey, "/faction/basic" as any),
			).rejects.toThrow("Invalid API key");
		});

		it("should throw an error for different error codes", async () => {
			const mockErrorResponse = {
				error: {
					error: "Faction not found",
					code: 6,
				},
			};

			mockGet.mockResolvedValue({
				data: mockErrorResponse,
				error: undefined,
			});

			await expect(
				tornFetch(mockApiKey, "/faction/basic" as any),
			).rejects.toThrow("Faction not found");
		});

		it("should handle network errors from openapi-fetch", async () => {
			mockGet.mockRejectedValue(new Error("Network error"));

			await expect(
				tornFetch(mockApiKey, "/faction/basic" as any),
			).rejects.toThrow("Network error");
		});
	});

	describe("edge cases", () => {
		it("should handle undefined data response", async () => {
			mockGet.mockResolvedValue({
				data: undefined,
				error: undefined,
			});

			const result = await tornFetch(mockApiKey, "/faction/basic" as any);
			expect(result).toBeUndefined();
		});

		it("should handle non-object data response", async () => {
			const primitiveResponse = "string response";
			mockGet.mockResolvedValue({
				data: primitiveResponse,
				error: undefined,
			});

			const result = (await tornFetch(mockApiKey, "/faction/basic" as any)) as any;
			expect(result).toBe(primitiveResponse);
		});

		it("should handle object without error property", async () => {
			const validResponse = { someData: "value", noError: true };
			mockGet.mockResolvedValue({
				data: validResponse,
				error: undefined,
			});

			const result = (await tornFetch(mockApiKey, "/faction/basic" as any)) as any;
			expect(result).toEqual(validResponse);
		});
	});

	describe("API key handling", () => {
		it("should use the provided API key in authorization header", async () => {
			const customApiKey = "custom-key-xyz";
			mockGet.mockResolvedValue({ data: {}, error: undefined });

			await tornFetch(customApiKey, "/faction/basic" as any);

			expect(mockGet).toHaveBeenCalledWith("/faction/basic", {
				params: undefined,
				headers: {
					Authorization: `ApiKey ${customApiKey}`,
				},
			});
		});
	});
});
