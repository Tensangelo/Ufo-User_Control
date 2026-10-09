"use client";

import type { ReactNode } from "react";
import { UfoIcon } from "@/shared/assets/icons/ufo";
import { buttonClass } from "@/shared/lib/ButtonClass";
import { exportUsersUrl } from "../api/ExportUsersUrl";
import { useUserDialogStore } from "../store/UserDialogStore";

export function UsersHeader(): ReactNode {
  const openCreate = useUserDialogStore((state) => state.openCreate);
  return (
    <header className="sticky top-0 z-20 border-b border-pine/35 bg-paper/90 shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-md">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-panel focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-ink"
      >
        Saltar al contenido
      </a>
      <div className="mx-auto flex w-full flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <span
            className="flex size-11 items-center justify-center rounded-lg bg-pine text-on-accent"
            aria-hidden
          >
            <UfoIcon className="size-7" />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              User Control
            </p>
            <p className="text-sm font-medium text-ink">Directorio</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <a
            className={`${buttonClass("secondary")} w-full sm:w-auto`}
            href={exportUsersUrl()}
          >
            Exportar CSV
          </a>
          <button
            type="button"
            className={`${buttonClass("primary")} w-full sm:w-auto`}
            onClick={openCreate}
          >
            Nuevo usuario
          </button>
        </div>
      </div>
    </header>
  );
}
