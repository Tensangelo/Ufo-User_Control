"use client";

import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { ApiRequestError } from "@/shared/lib/ApiError";
import { deleteUser } from "../api/DeleteUser";
import { useUserDialogStore } from "../store/UserDialogStore";

export function useDeleteUser(): UseMutationResult<void, ApiRequestError, string> {
	const queryClient = useQueryClient();
	const close = useUserDialogStore((state) => state.close);
	return useMutation({
		mutationFn: deleteUser,
		onSuccess: async () => {
			close();
			await queryClient.invalidateQueries({ queryKey: ["users"] });
		},
	});
}
