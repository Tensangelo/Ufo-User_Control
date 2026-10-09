export function fieldClass(hasError: boolean): string {
	const border = hasError ? "border-danger" : "border-line";
	return `min-h-11 w-full rounded-lg border ${border} bg-panel px-3 text-base text-ink outline-none placeholder:text-muted/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine sm:text-sm`;
}
