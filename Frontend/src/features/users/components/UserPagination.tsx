"use client";

import { Fragment, type ReactNode } from "react";
import { ArrowIcon } from "@/shared/assets/icons/arrow";
import { buttonClass } from "@/shared/lib/ButtonClass";
import { visiblePages } from "../lib/VisiblePages";

interface UserPaginationProps {
  readonly page: number;
  readonly totalPages: number;
  readonly rangeLabel: string;
  readonly onPageChange: (page: number) => void;
}

export function UserPagination({
  page,
  totalPages,
  rangeLabel,
  onPageChange,
}: UserPaginationProps): ReactNode {
  const pages = visiblePages(page, totalPages);
  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-center text-muted">{rangeLabel}</p>
      {totalPages > 1 ? (
        <nav
          aria-label="Paginación de usuarios"
          className="flex flex-wrap justify-center items-center gap-2"
        >
          <PagerStep
            label="Anterior"
            direction="previous"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          />
          {pages.map((pageNumber, index) => {
            const previousPage = pages[index - 1];
            const hasGap =
              previousPage !== undefined && pageNumber - previousPage > 1;
            return (
              <Fragment key={pageNumber}>
                {hasGap ? (
                  <span className="px-1 text-muted" aria-hidden>
                    …
                  </span>
                ) : null}
                <PageButton
                  pageNumber={pageNumber}
                  isCurrent={pageNumber === page}
                  onPageChange={onPageChange}
                />
              </Fragment>
            );
          })}
          <PagerStep
            label="Siguiente"
            direction="next"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          />
        </nav>
      ) : null}
    </div>
  );
}

interface PageButtonProps {
  readonly pageNumber: number;
  readonly isCurrent: boolean;
  readonly onPageChange: (page: number) => void;
}

interface PagerStepProps {
  readonly label: string;
  readonly direction: "previous" | "next";
  readonly disabled: boolean;
  readonly onClick: () => void;
}

function PagerStep({
  label,
  direction,
  disabled,
  onClick,
}: PagerStepProps): ReactNode {
  const iconClass =
    direction === "next" ? "size-6 rotate-180 md:hidden" : "size-6 md:hidden";
  return (
    <button
      type="button"
      className={`${buttonClass("secondary")} max-md:size-11 max-md:px-0`}
      aria-label={`Página ${label.toLowerCase()}`}
      onClick={onClick}
      disabled={disabled}
    >
      <ArrowIcon className={iconClass} />
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}

function PageButton({
  pageNumber,
  isCurrent,
  onPageChange,
}: PageButtonProps): ReactNode {
  const tone = isCurrent
    ? "bg-pine text-on-accent"
    : "border border-line bg-panel text-ink hover:bg-lift";
  return (
    <button
      type="button"
      className={`inline-flex size-11 items-center justify-center rounded-lg text-sm font-semibold focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-pine ${tone}`}
      aria-label={`Página ${pageNumber}`}
      aria-current={isCurrent ? "page" : undefined}
      onClick={() => onPageChange(pageNumber)}
    >
      {pageNumber}
    </button>
  );
}
