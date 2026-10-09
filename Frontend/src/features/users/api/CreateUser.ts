import { requestJson } from "@/shared/lib/ApiClient";
import type { User, UserWriteInput } from "../types/User";
import { parseUserEnvelope } from "./ParseUser";

export async function createUser(input: UserWriteInput): Promise<User> {
  const body = await requestJson({
    path: "/api/v1/users",
    method: "POST",
    body: { name: input.name, email: input.email },
  });
  return parseUserEnvelope(body);
}
