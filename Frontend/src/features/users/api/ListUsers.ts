import { requestJson } from "@/shared/lib/ApiClient";
import type { UserListResponse } from "../types/User";
import { parseUserList } from "./ParseUser";

interface ListUsersInput {
  readonly page: number;
  readonly pageSize: number;
  readonly search: string;
}

export async function listUsers(
  input: ListUsersInput,
): Promise<UserListResponse> {
  const params = new URLSearchParams({
    page: String(input.page),
    pageSize: String(input.pageSize),
  });
  const search = input.search.trim();
  if (search) params.set("search", search);
  const body = await requestJson({
    path: `/api/v1/users?${params.toString()}`,
  });
  return parseUserList(body);
}
