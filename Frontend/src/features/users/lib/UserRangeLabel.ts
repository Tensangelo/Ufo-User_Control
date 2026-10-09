export function userRangeLabel(page: number, pageSize: number, total: number): string {
	if (total <= 0) return "0 usuarios";
	const start = (page - 1) * pageSize + 1;
	const end = Math.min(page * pageSize, total);
	return `${start}–${end} de ${total}`;
}
