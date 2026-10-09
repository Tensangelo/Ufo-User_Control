import { requestJson } from "@/shared/lib/ApiClient";
import type { User, UserWriteInput } from "../types/User";
import { parseUserEnvelope } from "./ParseUser";

interface UpdateUserInput extends UserWriteInput {
  readonly id: string;
}

export async function updateUser(input: UpdateUserInput): Promise<User> {
  const body = await requestJson({
    path: `/api/v1/users/${encodeURIComponent(input.id)}`,
    method: "PATCH",
    body: { name: input.name, email: input.email },
  });
  return parseUserEnvelope(body);
}
