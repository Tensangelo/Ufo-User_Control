import { Request, Response } from "express";
import { CreateUserUseCase } from "../../src/application/useCases/CreateUserUseCase";
import { DeleteUserUseCase } from "../../src/application/useCases/DeleteUserUseCase";
import { ExportUsersUseCase } from "../../src/application/useCases/ExportUsersUseCase";
import { GetUserByIdUseCase } from "../../src/application/useCases/GetUserByIdUseCase";
import { ListUsersUseCase } from "../../src/application/useCases/ListUsersUseCase";
import { UpdateUserUseCase } from "../../src/application/useCases/UpdateUserUseCase";
import { UserController } from "../../src/infrastructure/http/controllers/UserController";
import { buildUser } from "../support/UserFixture";

describe("UserController", () => {
	it("responds 201 with the created user", async () => {
		const user = buildUser();
		const createUserUseCase = {
			execute: jest.fn().mockResolvedValue(user),
		} as unknown as CreateUserUseCase;
		const controller = new UserController(
			createUserUseCase,
			{ execute: jest.fn() } as unknown as GetUserByIdUseCase,
			{ execute: jest.fn() } as unknown as UpdateUserUseCase,
			{ execute: jest.fn() } as unknown as DeleteUserUseCase,
			{ execute: jest.fn() } as unknown as ListUsersUseCase,
			{ execute: jest.fn() } as unknown as ExportUsersUseCase,
		);
		const response = createResponse();
		await controller.create(
			{ body: { name: "Ada Lovelace", email: "ada@example.com" } } as Request,
			response as unknown as Response,
		);
		expect(response.status).toHaveBeenCalledWith(201);
		expect(response.json).toHaveBeenCalledWith({
			data: {
				id: user.id,
				name: user.name,
				email: user.email,
				createdAt: user.createdAt.toISOString(),
				updatedAt: user.updatedAt.toISOString(),
			},
		});
	});
});

function createResponse(): { status: jest.Mock; json: jest.Mock } {
	const response = {
		status: jest.fn(),
		json: jest.fn(),
	};
	response.status.mockReturnValue(response);
	return response;
}
