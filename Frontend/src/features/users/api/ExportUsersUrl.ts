import { getApiUrl } from "@/shared/lib/ApiUrl";

export function exportUsersUrl(): string {
  return `${getApiUrl()}/api/v1/users/export`;
}
