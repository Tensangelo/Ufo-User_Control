"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { fieldClass } from "@/shared/lib/FieldClass";
import { SEARCH_DEBOUNCE_MS, USER_PAGE_SIZES } from "../constants/UserPageSize";
import { useDebouncedValue } from "../hooks/UseDebouncedValue";

interface UserListControlsProps {
  readonly search: string;
  readonly pageSize: number;
  readonly onSearchCommit: (search: string) => void;
  readonly onPageSizeChange: (pageSize: number) => void;
}

export function UserListControls({
  search,
  pageSize,
  onSearchCommit,
  onPageSizeChange,
}: UserListControlsProps): ReactNode {
  const searchId = useId();
  const pageSizeId = useId();
  const [draft, setDraft] = useState(search);
  const debounced = useDebouncedValue(draft, SEARCH_DEBOUNCE_MS);
  const lastCommitted = useRef(search);
  useEffect(() => {
    if (search === lastCommitted.current) return;
    lastCommitted.current = search;
    setDraft(search);
  }, [search]);
  useEffect(() => {
    const nextSearch = debounced.trim();
    if (nextSearch === lastCommitted.current) return;
    lastCommitted.current = nextSearch;
    onSearchCommit(nextSearch);
  }, [debounced, onSearchCommit]);
  return (
    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
      <label
        htmlFor={searchId}
        className="flex min-w-0 flex-1 flex-col gap-1.5"
      >
        <span className="text-sm font-medium text-ink">Buscar</span>
        <input
          id={searchId}
          type="search"
          value={draft}
          placeholder="Nombre o correo"
          autoComplete="off"
          className={fieldClass(false)}
          onChange={(event) => setDraft(event.target.value)}
        />
      </label>
      <label
        htmlFor={pageSizeId}
        className="flex w-full flex-col gap-1.5 sm:w-36"
      >
        <span className="text-sm font-medium text-ink">Filas</span>
        <select
          id={pageSizeId}
          value={pageSize}
          className={fieldClass(false)}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          {USER_PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
