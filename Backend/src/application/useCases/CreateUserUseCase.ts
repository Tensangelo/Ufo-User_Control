import { randomUUID } from "crypto";
import { inject, injectable } from "tsyringe";
import { User } from "../../domain/entities/User";
import { EmailAlreadyInUseError } from "../../domain/errors/EmailAlreadyInUseError";
import { UserRepository } from "../../domain/ports/UserRepository";
import { USER_REPOSITORY_TOKEN } from "../tokens/UserRepositoryToken";

interface CreateUserInput {
	readonly name: string;
	readonly email: string;
}

@injectable()
export class CreateUserUseCase {
	public constructor(
		@inject(USER_REPOSITORY_TOKEN)
		private readonly userRepository: UserRepository,
	) {}

	public async execute(input: CreateUserInput): Promise<User> {
		const now = new Date();
		const user = User.create({
			id: randomUUID(),
			name: input.name,
			email: input.email,
			createdAt: now,
			updatedAt: now,
		});
		const existing = await this.userRepository.findByEmail(user.email);
		if (existing) {
			throw new EmailAlreadyInUseError();
		}
		return this.userRepository.create(user);
	}
}
