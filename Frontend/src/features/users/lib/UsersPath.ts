import { DEFAULT_USER_PAGE_SIZE, USER_PAGE_SIZES } from "../constants/UserPageSize";

export interface UsersRoute {
	readonly page: number;
	readonly pageSize: number;
	readonly search: string;
}

export function usersPath(route: UsersRoute): string {
	const params = new URLSearchParams();
	if (route.page > 1) params.set("page", String(route.page));
	if (route.pageSize !== DEFAULT_USER_PAGE_SIZE) params.set("pageSize", String(route.pageSize));
	const search = route.search.trim();
	if (search) params.set("search", search);
	const query = params.toString();
	if (!query) return "/users";
	return `/users?${query}`;
}

export function readPage(value: string | null): number {
	if (value === null || !/^[1-9]\d*$/.test(value)) return 1;
	return Number(value);
}

export function readPageSize(value: string | null): number {
	if (value === "10" || value === "25" || value === "50") return Number(value);
	return DEFAULT_USER_PAGE_SIZE;
}

export function readSearch(value: string | null): string {
	return value?.trim() ?? "";
}

export function isAllowedPageSize(value: string | null): boolean {
	if (value === null) return true;
	return USER_PAGE_SIZES.some((size) => String(size) === value);
}
