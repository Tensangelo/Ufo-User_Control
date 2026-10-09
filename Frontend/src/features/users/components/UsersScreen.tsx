"use client";

import { useCallback, useEffect, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { buttonClass } from "@/shared/lib/ButtonClass";
import { useUserList } from "../hooks/UseUserList";
import { userErrorMessage } from "../lib/UserErrorMessage";
import { userRangeLabel } from "../lib/UserRangeLabel";
import {
  isAllowedPageSize,
  readPage,
  readPageSize,
  readSearch,
  usersPath,
} from "../lib/UsersPath";
import { useUserDialogStore } from "../store/UserDialogStore";
import type { UserListResponse } from "../types/User";
import { UserDeleteDialog } from "./UserDeleteDialog";
import { UserFormDialog } from "./UserFormDialog";
import { UserListControls } from "./UserListControls";
import { UserPagination } from "./UserPagination";
import { UserTable } from "./UserTable";
import { UsersHeader } from "./UsersHeader";

export function UsersScreen(): ReactNode {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawPage = searchParams.get("page");
  const rawPageSize = searchParams.get("pageSize");
  const page = readPage(rawPage);
  const pageSize = readPageSize(rawPageSize);
  const search = readSearch(searchParams.get("search"));
  const list = useUserList({ page, pageSize, search });
  const openCreate = useUserDialogStore((state) => state.openCreate);
  const handleSearchCommit = useCallback(
    (nextSearch: string): void => {
      router.replace(usersPath({ page: 1, pageSize, search: nextSearch }), {
        scroll: false,
      });
    },
    [pageSize, router],
  );
  const handlePageSizeChange = useCallback(
    (nextPageSize: number): void => {
      router.replace(usersPath({ page: 1, pageSize: nextPageSize, search }), {
        scroll: false,
      });
    },
    [router, search],
  );
  useEffect(() => {
    if (!list.data || list.isPlaceholderData) return;
    const rawPageValid = rawPage === null || /^[1-9]\d*$/.test(rawPage);
    let nextPage = rawPageValid ? page : 1;
    if (list.data.totalPages === 0 && nextPage > 1) nextPage = 1;
    if (list.data.totalPages > 0 && nextPage > list.data.totalPages)
      nextPage = list.data.totalPages;
    const nextPath = usersPath({
      page: nextPage,
      pageSize: isAllowedPageSize(rawPageSize) ? pageSize : readPageSize(null),
      search,
    });
    const currentQuery = searchParams.toString();
    const currentPath = currentQuery ? `/users?${currentQuery}` : "/users";
    if (nextPath !== currentPath) router.replace(nextPath, { scroll: false });
  }, [
    list.data,
    list.isPlaceholderData,
    page,
    pageSize,
    rawPage,
    rawPageSize,
    router,
    search,
    searchParams,
  ]);
  const handlePageChange = (nextPage: number): void => {
    router.push(usersPath({ page: nextPage, pageSize, search }), {
      scroll: false,
    });
  };
  return (
    <div>
      <UsersHeader />
      <main
        id="contenido"
        className="mx-auto w-full max-w-[97%] px-4 py-8 sm:px-6 sm:py-10"
      >
        <section aria-labelledby="users-heading" aria-busy={list.isFetching}>
          <div className="max-w-2xl">
            <h1
              id="users-heading"
              className="text-3xl font-semibold tracking-tight text-pine sm:text-4xl"
            >
              Usuarios
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted sm:text-base">
              Busca por nombre o correo y elige cuántas filas ver.
            </p>
          </div>
          <UserListControls
            search={search}
            pageSize={pageSize}
            onSearchCommit={handleSearchCommit}
            onPageSizeChange={handlePageSizeChange}
          />
          <div className="mt-6">
            <UserListBody
              page={page}
              search={search}
              list={list.data}
              isPending={list.isPending}
              isError={list.isError}
              isRefreshing={list.isPlaceholderData}
              error={list.error}
              onRetry={() => void list.refetch()}
              onCreate={openCreate}
              onClearSearch={() => handleSearchCommit("")}
              onPageChange={handlePageChange}
            />
          </div>
        </section>
      </main>
      <UserFormDialog />
      <UserDeleteDialog />
    </div>
  );
}

interface UserListBodyProps {
  readonly page: number;
  readonly search: string;
  readonly list: UserListResponse | undefined;
  readonly isPending: boolean;
  readonly isError: boolean;
  readonly isRefreshing: boolean;
  readonly error: unknown;
  readonly onRetry: () => void;
  readonly onCreate: () => void;
  readonly onClearSearch: () => void;
  readonly onPageChange: (page: number) => void;
}

function UserListBody({
  page,
  search,
  list,
  isPending,
  isError,
  isRefreshing,
  error,
  onRetry,
  onCreate,
  onClearSearch,
  onPageChange,
}: UserListBodyProps): ReactNode {
  if (!list && isError)
    return (
      <UserListError message={userErrorMessage(error)} onRetry={onRetry} />
    );
  if (isPending || !list) return <UserListSkeleton />;
  if (list.total === 0 && search)
    return <UserSearchEmpty onClear={onClearSearch} />;
  if (list.total === 0) return <UserListEmpty onCreate={onCreate} />;
  return (
    <div>
      {isError ? (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger"
        >
          {userErrorMessage(error)}
        </p>
      ) : null}
      <UserTable users={list.data} isRefreshing={isRefreshing} />
      <UserPagination
        page={page}
        totalPages={list.totalPages}
        rangeLabel={userRangeLabel(list.page, list.pageSize, list.total)}
        onPageChange={onPageChange}
      />
    </div>
  );
}

function UserListSkeleton(): ReactNode {
  return (
    <div>
      <div className="space-y-3" aria-hidden>
        <div className="h-14 animate-pulse rounded-xl bg-line motion-reduce:animate-none" />
        <div className="h-14 animate-pulse rounded-xl bg-line motion-reduce:animate-none" />
        <div className="h-14 animate-pulse rounded-xl bg-line motion-reduce:animate-none" />
        <div className="h-14 animate-pulse rounded-xl bg-line motion-reduce:animate-none" />
      </div>
      <p className="sr-only">Cargando usuarios</p>
    </div>
  );
}

function UserListEmpty({
  onCreate,
}: {
  readonly onCreate: () => void;
}): ReactNode {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-panel px-6 py-16 text-center">
      <h2 className="text-lg font-semibold text-ink">
        No hay usuarios todavía
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
        Crea el primero para verlo en esta lista.
      </p>
      <button
        type="button"
        className={`${buttonClass("primary")} mt-6`}
        onClick={onCreate}
      >
        Nuevo usuario
      </button>
    </div>
  );
}

function UserSearchEmpty({
  onClear,
}: {
  readonly onClear: () => void;
}): ReactNode {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-panel px-6 py-16 text-center">
      <h2 className="text-lg font-semibold text-ink">
        Ningún usuario coincide
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
        Prueba con otro nombre o correo.
      </p>
      <button
        type="button"
        className={`${buttonClass("secondary")} mt-6`}
        onClick={onClear}
      >
        Limpiar búsqueda
      </button>
    </div>
  );
}

function UserListError({
  message,
  onRetry,
}: {
  readonly message: string;
  readonly onRetry: () => void;
}): ReactNode {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-line bg-panel px-6 py-12 text-center"
    >
      <h2 className="text-lg font-semibold text-ink">
        No se pudo cargar la lista
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
        {message}
      </p>
      <button
        type="button"
        className={`${buttonClass("primary")} mt-6`}
        onClick={onRetry}
      >
        Reintentar
      </button>
    </div>
  );
}
