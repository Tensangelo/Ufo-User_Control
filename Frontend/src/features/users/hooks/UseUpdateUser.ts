"use client";

import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { ApiRequestError } from "@/shared/lib/ApiError";
import { updateUser } from "../api/UpdateUser";
import { useUserDialogStore } from "../store/UserDialogStore";
import type { User, UserWriteInput } from "../types/User";

interface UpdateUserVariables extends UserWriteInput {
	readonly id: string;
}

export function useUpdateUser(): UseMutationResult<User, ApiRequestError, UpdateUserVariables> {
	const queryClient = useQueryClient();
	const close = useUserDialogStore((state) => state.close);
	return useMutation({
		mutationFn: updateUser,
		onSuccess: async () => {
			close();
			await queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
}
