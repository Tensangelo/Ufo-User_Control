export function visiblePages(current: number, total: number): readonly number[] {
	if (total <= 7) return range(1, total);
	const candidates = [1, total, current - 1, current, current + 1].filter((page) => page >= 1 && page <= total);
	return [...new Set(candidates)].sort((left, right) => left - right);
}

function range(start: number, end: number): readonly number[] {
	return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}
