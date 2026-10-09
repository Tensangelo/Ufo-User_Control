import { inject, injectable } from "tsyringe";
import { User } from "../../domain/entities/User";
import { InvalidPaginationError } from "../../domain/errors/InvalidPaginationError";
import { InvalidUserInputError } from "../../domain/errors/InvalidUserInputError";
import { UserRepository } from "../../domain/ports/UserRepository";
import { USER_LIMITS } from "../constants/UserConstants";
import { USER_REPOSITORY_TOKEN } from "../tokens/UserRepositoryToken";

interface ListUsersInput {
	readonly page?: number;
	readonly pageSize?: number;
	readonly search?: string;
}

interface ListUsersResult {
	readonly items: readonly User[];
	readonly page: number;
	readonly pageSize: number;
	readonly total: number;
	readonly totalPages: number;
}

@injectable()
export class ListUsersUseCase {
	public constructor(
		@inject(USER_REPOSITORY_TOKEN)
		private readonly userRepository: UserRepository,
	) {}

	public async execute(input: ListUsersInput): Promise<ListUsersResult> {
		const page = input.page ?? USER_LIMITS.DEFAULT_PAGE;
		const pageSize = input.pageSize ?? USER_LIMITS.DEFAULT_PAGE_SIZE;
		const search = this.normalizeSearch(input.search);
		if (!this.isValidPagination(page, pageSize)) {
			throw new InvalidPaginationError();
		}
		const found = await this.userRepository.findPage({ page, pageSize, search });
		const totalPages = found.total === 0 ? 0 : Math.ceil(found.total / pageSize);
		return {
			items: found.items,
			page,
			pageSize,
			total: found.total,
			totalPages,
		};
	}

	private normalizeSearch(search: string | undefined): string | undefined {
		if (search === undefined) return undefined;
		const trimmed = search.trim();
		if (!trimmed) return undefined;
		if (trimmed.length > 255) {
			throw new InvalidUserInputError("Search must be at most 255 characters");
		}
		return trimmed;
	}

	private isValidPagination(page: number, pageSize: number): boolean {
		const isPageValid = Number.isInteger(page) && page >= 1;
		const isPageSizeValid =
			Number.isInteger(pageSize) && pageSize >= 1 && pageSize <= USER_LIMITS.MAX_PAGE_SIZE;
		return isPageValid && isPageSizeValid;
	}
}
