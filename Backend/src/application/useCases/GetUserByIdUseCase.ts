import { inject, injectable } from "tsyringe";
import { User } from "../../domain/entities/User";
import { UserNotFoundError } from "../../domain/errors/UserNotFoundError";
import { UserRepository } from "../../domain/ports/UserRepository";
import { assertUserId } from "../../domain/validation/AssertUserId";
import { USER_REPOSITORY_TOKEN } from "../tokens/UserRepositoryToken";

@injectable()
export class GetUserByIdUseCase {
	public constructor(
		@inject(USER_REPOSITORY_TOKEN)
		private readonly userRepository: UserRepository,
	) {}

	public async execute(id: string): Promise<User> {
		assertUserId(id);
		const user = await this.userRepository.findById(id);
		if (!user) {
			throw new UserNotFoundError();
		}
		return user;
	}
}
