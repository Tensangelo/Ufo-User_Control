import { UserRepository } from "../../src/domain/ports/UserRepository";

export function createUserRepositoryMock(): jest.Mocked<UserRepository> {
	return {
		findById: jest.fn(),
		findByEmail: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
		findPage: jest.fn(),
		findExportBatch: jest.fn(),
	};
}
