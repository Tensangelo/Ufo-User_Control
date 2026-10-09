import type { ReactNode } from "react";

export function UsersScreenFallback(): ReactNode {
  return (
    <div>
      <div className="border-b border-line">
        <div className="mx-auto h-19 max-w-5xl px-4 sm:px-6" />
      </div>
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <div className="h-9 w-40 animate-pulse rounded-lg bg-line motion-reduce:animate-none" />
        <div className="mt-3 h-5 w-72 max-w-full animate-pulse rounded-lg bg-line motion-reduce:animate-none" />
        <div className="mt-8 space-y-3" aria-hidden>
          <div className="h-14 animate-pulse rounded-xl bg-line/80 motion-reduce:animate-none" />
          <div className="h-14 animate-pulse rounded-xl bg-line/80 motion-reduce:animate-none" />
          <div className="h-14 animate-pulse rounded-xl bg-line/80 motion-reduce:animate-none" />
        </div>
        <p className="sr-only">Cargando usuarios</p>
      </main>
    </div>
  );
}
