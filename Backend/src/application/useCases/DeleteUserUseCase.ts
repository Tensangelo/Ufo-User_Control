import { inject, injectable } from "tsyringe";
import { UserNotFoundError } from "../../domain/errors/UserNotFoundError";
import { UserRepository } from "../../domain/ports/UserRepository";
import { assertUserId } from "../../domain/validation/AssertUserId";
import { USER_REPOSITORY_TOKEN } from "../tokens/UserRepositoryToken";

@injectable()
export class DeleteUserUseCase {
	public constructor(
		@inject(USER_REPOSITORY_TOKEN)
		private readonly userRepository: UserRepository,
	) {}

	public async execute(id: string): Promise<void> {
		assertUserId(id);
		const current = await this.userRepository.findById(id);
		if (!current) {
			throw new UserNotFoundError();
		}
		await this.userRepository.delete(id);
	}
}
