import { InvalidUserInputError } from "../errors/InvalidUserInputError";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;

interface UserProps {
	readonly id: string;
	readonly name: string;
	readonly email: string;
	readonly createdAt: Date;
	readonly updatedAt: Date;
}

interface UserUpdate {
	readonly name?: string;
	readonly email?: string;
}

export class User {
	private constructor(
		public readonly id: string,
		public readonly name: string,
		public readonly email: string,
		public readonly createdAt: Date,
		public readonly updatedAt: Date,
	) {}

	public static create(props: UserProps): User {
		const name = typeof props.name === "string" ? props.name.trim() : "";
		const email = typeof props.email === "string" ? props.email.trim().toLowerCase() : "";
		if (name.length === 0 || name.length > MAX_NAME_LENGTH) {
			throw new InvalidUserInputError("Name is required and must be at most 100 characters");
		}
		if (email.length === 0 || email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
			throw new InvalidUserInputError("Email is invalid");
		}
		return new User(props.id, name, email, props.createdAt, props.updatedAt);
	}

	public update(input: UserUpdate): User {
		return User.create({
			id: this.id,
			name: input.name ?? this.name,
			email: input.email ?? this.email,
			createdAt: this.createdAt,
			updatedAt: new Date(),
		});
	}
}
