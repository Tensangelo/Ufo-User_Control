import { CreateUserUseCase } from "../../src/application/useCases/CreateUserUseCase";
import { EmailAlreadyInUseError } from "../../src/domain/errors/EmailAlreadyInUseError";
import { User } from "../../src/domain/entities/User";
import { buildUser } from "../support/UserFixture";
import { createUserRepositoryMock } from "../support/UserRepositoryMock";

describe("CreateUserUseCase", () => {
	it("creates a user when the email is available", async () => {
		const repository = createUserRepositoryMock();
		const useCase = new CreateUserUseCase(repository);
		repository.findByEmail.mockResolvedValue(null);
		repository.create.mockImplementation(async (user: User) => user);
		const actual = await useCase.execute({ name: "  Ada Lovelace  ", email: "Ada@Example.com" });
		expect(actual.name).toBe("Ada Lovelace");
		expect(actual.email).toBe("ada@example.com");
		expect(repository.create).toHaveBeenCalledTimes(1);
	});

	it("rejects a duplicated email", async () => {
		const repository = createUserRepositoryMock();
		const useCase = new CreateUserUseCase(repository);
		repository.findByEmail.mockResolvedValue(buildUser());
		await expect(useCase.execute({ name: "Ada Lovelace", email: "ada@example.com" })).rejects.toBeInstanceOf(
			EmailAlreadyInUseError,
		);
		expect(repository.create).not.toHaveBeenCalled();
	});
});
