import { requestJson } from "@/shared/lib/ApiClient";

export async function deleteUser(id: string): Promise<void> {
  await requestJson({
    path: `/api/v1/users/${encodeURIComponent(id)}`,
    method: "DELETE",
  });
}
