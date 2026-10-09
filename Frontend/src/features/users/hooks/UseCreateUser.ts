"use client";

import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { ApiRequestError } from "@/shared/lib/ApiError";
import { createUser } from "../api/CreateUser";
import { readPageSize, usersPath } from "../lib/UsersPath";
import { useUserDialogStore } from "../store/UserDialogStore";
import type { User, UserListResponse, UserWriteInput } from "../types/User";

export function useCreateUser(): UseMutationResult<User, ApiRequestError, UserWriteInput> {
	const queryClient = useQueryClient();
	const router = useRouter();
	const searchParams = useSearchParams();
	const close = useUserDialogStore((state) => state.close);
	const pageSize = readPageSize(searchParams.get("pageSize"));
	return useMutation({
		mutationFn: createUser,
		onSuccess: async () => {
			const lastPage = lastPageAfterCreate(queryClient, pageSize);
			close();
			router.push(usersPath({ page: lastPage, pageSize, search: "" }), { scroll: false });
			await queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
}

function lastPageAfterCreate(queryClient: ReturnType<typeof useQueryClient>, pageSize: number): number {
	let knownTotal = 0;
	queryClient.getQueriesData<UserListResponse>({ queryKey: ["users"] }).forEach(([key, data]) => {
		const search = key[3];
		if (typeof search === "string" && search.length > 0) return;
		if (data && data.total > knownTotal) knownTotal = data.total;
	});
	return Math.max(1, Math.ceil((knownTotal + 1) / pageSize));
}
