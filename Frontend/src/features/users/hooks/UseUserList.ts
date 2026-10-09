"use client";

import { keepPreviousData, useQuery, type UseQueryResult } from "@tanstack/react-query";
import { listUsers } from "../api/ListUsers";
import { userListKey } from "../lib/UserListKey";
import type { UsersRoute } from "../lib/UsersPath";
import type { UserListResponse } from "../types/User";

export function useUserList(route: UsersRoute): UseQueryResult<UserListResponse, Error> {
	return useQuery({
		queryKey: userListKey(route),
		queryFn: () => listUsers(route),
		placeholderData: keepPreviousData,
	});
}
