import { User } from "../../src/domain/entities/User";

interface UserFixtureInput {
	readonly id?: string;
	readonly name?: string;
	readonly email?: string;
	readonly createdAt?: Date;
	readonly updatedAt?: Date;
}

const DEFAULT_USER_ID = "11111111-1111-4111-8111-111111111111";

export function buildUser(overrides: UserFixtureInput = {}): User {
	return User.create({
		id: overrides.id ?? DEFAULT_USER_ID,
		name: overrides.name ?? "Ada Lovelace",
		email: overrides.email ?? "ada@example.com",
		createdAt: overrides.createdAt ?? new Date("2026-01-01T00:00:00.000Z"),
		updatedAt: overrides.updatedAt ?? overrides.createdAt ?? new Date("2026-01-01T00:00:00.000Z"),
	});
}
