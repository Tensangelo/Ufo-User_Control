import { create } from "zustand";
import type { UserSnapshot } from "../types/User";

type UserDialogMode = "closed" | "create" | "edit" | "delete";

interface UserDialogState {
	readonly mode: UserDialogMode;
	readonly user: UserSnapshot | null;
	readonly openCreate: () => void;
	readonly openEdit: (user: UserSnapshot) => void;
	readonly openDelete: (user: UserSnapshot) => void;
	readonly close: () => void;
}

export const useUserDialogStore = create<UserDialogState>((set) => ({
	mode: "closed",
	user: null,
	openCreate: () => set({ mode: "create", user: null }),
	openEdit: (user: UserSnapshot) => set({ mode: "edit", user }),
	openDelete: (user: UserSnapshot) => set({ mode: "delete", user }),
	close: () => set({ mode: "closed", user: null }),
}));
