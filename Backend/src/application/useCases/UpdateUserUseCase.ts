import { inject, injectable } from "tsyringe";
import { User } from "../../domain/entities/User";
import { EmailAlreadyInUseError } from "../../domain/errors/EmailAlreadyInUseError";
import { InvalidUserInputError } from "../../domain/errors/InvalidUserInputError";
import { UserNotFoundError } from "../../domain/errors/UserNotFoundError";
import { UserRepository } from "../../domain/ports/UserRepository";
import { assertUserId } from "../../domain/validation/AssertUserId";
import { USER_REPOSITORY_TOKEN } from "../tokens/UserRepositoryToken";

interface UpdateUserInput {
	readonly name?: string;
	readonly email?: string;
}

@injectable()
export class UpdateUserUseCase {
	public constructor(
		@inject(USER_REPOSITORY_TOKEN)
		private readonly userRepository: UserRepository,
	) {}

	public async execute(id: string, input: UpdateUserInput): Promise<User> {
		assertUserId(id);
		if (input.name === undefined && input.email === undefined) {
			throw new InvalidUserInputError("At least one field is required");
		}
		const current = await this.userRepository.findById(id);
		if (!current) {
			throw new UserNotFoundError();
		}
		const next = current.update(input);
		if (next.email !== current.email) {
			const existing = await this.userRepository.findByEmail(next.email);
			if (existing && existing.id !== current.id) {
				throw new EmailAlreadyInUseError();
			}
		}
		return this.userRepository.update(next);
	}
}
