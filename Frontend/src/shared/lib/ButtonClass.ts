type ButtonVariant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost"
  | "accentGhost"
  | "dangerGhost";

const BUTTON_BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine disabled:cursor-not-allowed disabled:opacity-50";

const BUTTON_VARIANTS: Readonly<Record<ButtonVariant, string>> = {
  primary: "bg-pine text-on-accent hover:bg-pine-strong",
  secondary: "border border-line bg-transparent text-ink hover:bg-lift",
  danger: "bg-danger-fill text-ink hover:bg-danger-fill-strong",
  ghost: "text-ink border border-muted/40 hover:bg-lift",
  accentGhost:
    "border border-pine/35 bg-transparent text-pine hover:bg-pine/10",
  dangerGhost:
    "border border-danger/45 bg-danger/15 text-danger hover:bg-danger/25",
};

export function buttonClass(variant: ButtonVariant): string {
  return `${BUTTON_BASE} ${BUTTON_VARIANTS[variant]}`;
}
