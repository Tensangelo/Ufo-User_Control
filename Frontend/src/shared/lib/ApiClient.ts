import { ApiRequestError } from "./ApiError";
import { getApiUrl } from "./ApiUrl";

interface RequestJsonInput {
	readonly path: string;
	readonly method?: "GET" | "POST" | "PATCH" | "DELETE";
	readonly body?: unknown;
}

export async function requestJson(input: RequestJsonInput): Promise<unknown> {
	const response = await readResponse(input);
	if (response.status === 204) return null;
	const body = await readBody(response);
	if (!response.ok) {
		throw new ApiRequestError(response.status, readErrorCode(body), readErrorMessage(body));
	}
	return body;
}

async function readResponse(input: RequestJsonInput): Promise<Response> {
	try {
		return await fetch(`${getApiUrl()}${input.path}`, {
			method: input.method ?? "GET",
			cache: "no-store",
			headers: {
				Accept: "application/json",
				...(input.body === undefined ? {} : { "Content-Type": "application/json" }),
			},
			body: input.body === undefined ? undefined : JSON.stringify(input.body),
		});
	} catch {
		throw new ApiRequestError(0, "NETWORK", "Network request failed");
	}
}

async function readBody(response: Response): Promise<unknown> {
	try {
		return await response.json();
	} catch {
		return null;
	}
}

function readErrorCode(body: unknown): string {
	if (!isRecord(body) || !isRecord(body.error)) return "INTERNAL_ERROR";
	return typeof body.error.code === "string" ? body.error.code : "INTERNAL_ERROR";
}

function readErrorMessage(body: unknown): string {
	if (!isRecord(body) || !isRecord(body.error)) return "Request failed";
	return typeof body.error.message === "string" ? body.error.message : "Request failed";
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}
