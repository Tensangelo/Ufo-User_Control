import { ApiRequestError } from "@/shared/lib/ApiError";
import type { User, UserListResponse } from "../types/User";

export function parseUserEnvelope(body: unknown): User {
  if (!isRecord(body)) throw unexpectedResponse();
  return parseUser(body.data);
}

export function parseUserList(body: unknown): UserListResponse {
  if (!isRecord(body) || !Array.isArray(body.data)) throw unexpectedResponse();
  const page = readNumber(body.page);
  const pageSize = readNumber(body.pageSize);
  const total = readNumber(body.total);
  const totalPages = readNumber(body.totalPages);
  if (
    page === null ||
    pageSize === null ||
    total === null ||
    totalPages === null
  )
    throw unexpectedResponse();
  return {
    data: body.data.map((item) => parseUser(item)),
    page,
    pageSize,
    total,
    totalPages,
  };
}

function parseUser(value: unknown): User {
  if (!isRecord(value)) throw unexpectedResponse();
  if (
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    typeof value.email !== "string" ||
    typeof value.createdAt !== "string" ||
    typeof value.updatedAt !== "string"
  ) {
    throw unexpectedResponse();
  }
  return {
    id: value.id,
    name: value.name,
    email: value.email,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

function readNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function unexpectedResponse(): ApiRequestError {
  return new ApiRequestError(500, "UNEXPECTED_RESPONSE", "Unexpected response");
}
