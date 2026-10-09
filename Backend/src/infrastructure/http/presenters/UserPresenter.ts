import { User } from "../../../domain/entities/User";

interface UserResponse {
	readonly id: string;
	readonly name: string;
	readonly email: string;
	readonly createdAt: string;
	readonly updatedAt: string;
}

export function presentUser(user: User): UserResponse {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		createdAt: user.createdAt.toISOString(),
		updatedAt: user.updatedAt.toISOString(),
	};
}
