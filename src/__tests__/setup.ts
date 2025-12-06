import { mock } from "bun:test";

// Create a single shared mock for openapi-fetch GET method
export const mockGet = mock();

// Mock the openapi-fetch module once, globally
mock.module("openapi-fetch", () => ({
	default: mock(() => ({
		GET: mockGet,
	})),
}));
