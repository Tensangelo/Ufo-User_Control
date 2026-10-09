"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Dialog } from "@/shared/components/Dialog";
import { buttonClass } from "@/shared/lib/ButtonClass";
import { useDeleteUser } from "../hooks/UseDeleteUser";
import { userErrorMessage } from "../lib/UserErrorMessage";
import { useUserDialogStore } from "../store/UserDialogStore";

export function UserDeleteDialog(): ReactNode {
  const mode = useUserDialogStore((state) => state.mode);
  const user = useUserDialogStore((state) => state.user);
  const close = useUserDialogStore((state) => state.close);
  const deleteUser = useDeleteUser();
  const isOpen = mode === "delete" && user !== null;
  const resetDelete = deleteUser.reset;
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !isOpen) resetDelete();
    wasOpen.current = isOpen;
  }, [isOpen, resetDelete]);
  const handleConfirm = (): void => {
    if (!user) return;
    void deleteUser.mutateAsync(user.id).catch(() => undefined);
  };
  return (
    <Dialog
      isOpen={isOpen}
      title={user ? `¿Eliminar a ${user.name}?` : "Eliminar usuario"}
      description="Esta acción no se puede deshacer."
      onClose={close}
    >
      {user ? <p className="text-sm text-muted">{user.email}</p> : null}
      {deleteUser.isError ? (
        <p
          role="alert"
          className="mt-3 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger"
        >
          {userErrorMessage(deleteUser.error)}
        </p>
      ) : null}
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          className={buttonClass("ghost")}
          onClick={close}
          disabled={deleteUser.isPending}
        >
          Cancelar
        </button>
        <button
          type="button"
          className={buttonClass("danger")}
          onClick={handleConfirm}
          disabled={deleteUser.isPending}
        >
          {deleteUser.isPending ? "Eliminando…" : "Eliminar"}
        </button>
      </div>
    </Dialog>
  );
}
