"use client";

import type { ReactNode } from "react";
import { DeleteIcon } from "@/shared/assets/icons/delete";
import { EditIcon } from "@/shared/assets/icons/edit";
import { buttonClass } from "@/shared/lib/ButtonClass";
import { formatUserDate } from "../lib/FormatUserDate";
import { useUserDialogStore } from "../store/UserDialogStore";
import type { User } from "../types/User";

interface UserTableProps {
  readonly users: readonly User[];
  readonly isRefreshing: boolean;
}

export function UserTable({ users, isRefreshing }: UserTableProps): ReactNode {
  return (
    <div
      className={
        isRefreshing ? "opacity-60 transition-opacity" : "transition-opacity"
      }
      aria-busy={isRefreshing}
    >
      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-panel md:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Usuarios</caption>
          <thead>
            <tr className="border-b border-line bg-paper text-xs font-semibold uppercase tracking-[0.12em] text-white">
              <th scope="col" className="px-4 py-3 font-semibold">
                Nombre
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Correo
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Registro
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Actualización
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-line transition-colors last:border-b-0 hover:bg-lift"
              >
                <td className="px-4 py-3 font-medium text-ink">{user.name}</td>
                <td className="max-w-64 truncate px-4 py-3 text-sm text-white/80">
                  {user.email}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-white/80">
                  <time dateTime={user.createdAt}>
                    {formatUserDate(user.createdAt)}
                  </time>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-white/80">
                  <time dateTime={user.updatedAt}>
                    {formatUserDate(user.updatedAt)}
                  </time>
                </td>
                <td className="px-4 py-2 text-right">
                  <UserActions user={user} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-panel md:hidden">
        {users.map((user) => (
          <li
            key={user.id}
            className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-lift"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-semibold text-pine">
                {user.name}
              </p>
              <p className="mt-0.5 truncate text-base text-white/90">
                {user.email}
              </p>
              <p className="mt-2 text-sm text-muted">
                Registro:{" "}
                <time className="text-white/90" dateTime={user.createdAt}>
                  {formatUserDate(user.createdAt)}
                </time>
              </p>
              <p className="mt-0.5 text-sm text-muted">
                Actualización:{" "}
                <time className="text-white/90" dateTime={user.updatedAt}>
                  {formatUserDate(user.updatedAt)}
                </time>
              </p>
            </div>
            <UserActions user={user} />
          </li>
        ))}
      </ul>
    </div>
  );
}

interface UserActionsProps {
  readonly user: User;
}

function UserActions({ user }: UserActionsProps): ReactNode {
  const openEdit = useUserDialogStore((state) => state.openEdit);
  const openDelete = useUserDialogStore((state) => state.openDelete);
  const compact = "max-md:size-11 max-md:px-0";
  return (
    <div className="flex shrink-0 items-center flex-col lg:flex-row justify-end gap-2">
      <button
        type="button"
        className={`${buttonClass("accentGhost")} ${compact}`}
        aria-label={`Editar a ${user.name}`}
        onClick={() => openEdit(user)}
      >
        <EditIcon className="size-5 md:hidden" />
        <span className="hidden md:inline">Editar</span>
      </button>
      <button
        type="button"
        className={`${buttonClass("dangerGhost")} ${compact}`}
        aria-label={`Eliminar a ${user.name}`}
        onClick={() => openDelete(user)}
      >
        <DeleteIcon className="size-5 md:hidden" />
        <span className="hidden md:inline">Eliminar</span>
      </button>
    </div>
  );
}
