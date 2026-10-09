import { ListUsersUseCase } from "../../src/application/useCases/ListUsersUseCase";
import { InvalidPaginationError } from "../../src/domain/errors/InvalidPaginationError";
import { buildUser } from "../support/UserFixture";
import { createUserRepositoryMock } from "../support/UserRepositoryMock";

describe("ListUsersUseCase", () => {
	it("returns a deterministic page", async () => {
		const repository = createUserRepositoryMock();
		const useCase = new ListUsersUseCase(repository);
		const user = buildUser();
		repository.findPage.mockResolvedValue({ items: [user], total: 25 });
		const actual = await useCase.execute({ page: 1, pageSize: 10 });
		expect(actual).toEqual({
			items: [user],
			page: 1,
			pageSize: 10,
			total: 25,
			totalPages: 3,
		});
		expect(repository.findPage).toHaveBeenCalledWith({ page: 1, pageSize: 10, search: undefined });
	});

	it("forwards a trimmed search to the repository", async () => {
		const repository = createUserRepositoryMock();
		const useCase = new ListUsersUseCase(repository);
		repository.findPage.mockResolvedValue({ items: [], total: 0 });
		await useCase.execute({ page: 1, pageSize: 25, search: "  Ada  " });
		expect(repository.findPage).toHaveBeenCalledWith({ page: 1, pageSize: 25, search: "Ada" });
	});

	it("rejects invalid pagination", async () => {
		const repository = createUserRepositoryMock();
		const useCase = new ListUsersUseCase(repository);
		await expect(useCase.execute({ page: 0, pageSize: 10 })).rejects.toBeInstanceOf(InvalidPaginationError);
		await expect(useCase.execute({ page: 1, pageSize: 101 })).rejects.toBeInstanceOf(InvalidPaginationError);
		expect(repository.findPage).not.toHaveBeenCalled();
	});
});
