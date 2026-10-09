interface UserListKeyInput {
	readonly page: number;
	readonly pageSize: number;
	readonly search: string;
}

export function userListKey(input: UserListKeyInput): readonly ["users", number, number, string] {
	return ["users", input.page, input.pageSize, input.search];
}
