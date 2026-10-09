import type { ReactNode } from "react";
import { GitHubIcon } from "@/shared/assets/icons/github";
import { SourceIcon } from "@/shared/assets/icons/source";

const GITHUB_PROFILE_URL = "https://github.com/Tensangelo";
const SOURCE_REPOSITORY_URL = "https://github.com/Tensangelo/Ufo-User_Control";

export function SiteFooter(): ReactNode {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="mx-auto flex w-full max-w-[97%] flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-sm text-muted text-center">
          Desarrollado por{" "}
          <span className="font-medium text-pine">Angelo Gaona</span>
        </p>
        <div className="flex items-center justify-center gap-2">
          <a
            className="hover:text-pine px-1.5"
            href={GITHUB_PROFILE_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub de Angelo Gaona"
          >
            <GitHubIcon className="size-7" />
          </a>
          <a
            className="hover:text-pine px-1.5"
            href={SOURCE_REPOSITORY_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Código fuente del proyecto"
          >
            <SourceIcon className="size-7" />
          </a>
        </div>
      </div>
    </footer>
  );
}
