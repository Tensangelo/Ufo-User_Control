export interface User {
	readonly id: string;
	readonly name: string;
	readonly email: string;
	readonly createdAt: string;
	readonly updatedAt: string;
}

export interface UserListResponse {
	readonly data: readonly User[];
	readonly page: number;
	readonly pageSize: number;
	readonly total: number;
	readonly totalPages: number;
}

export interface UserWriteInput {
	readonly name: string;
	readonly email: string;
}

export interface UserSnapshot {
	readonly id: string;
	readonly name: string;
	readonly email: string;
}
