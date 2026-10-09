import { ExportUsersUseCase } from "../../src/application/useCases/ExportUsersUseCase";
import { ExportBatchQuery } from "../../src/domain/ports/UserRepository";
import { User } from "../../src/domain/entities/User";
import { buildUser } from "../support/UserFixture";
import { createUserRepositoryMock } from "../support/UserRepositoryMock";

describe("ExportUsersUseCase", () => {
	it("writes a csv from successive batches using the last row as cursor", async () => {
		const repository = createUserRepositoryMock();
		const useCase = new ExportUsersUseCase(repository);
		const first = buildUser({
			id: "11111111-1111-4111-8111-111111111111",
			email: "a@example.com",
			createdAt: new Date("2026-01-01T00:00:00.000Z"),
		});
		const second = buildUser({
			id: "22222222-2222-4222-8222-222222222222",
			email: "b@example.com",
			createdAt: new Date("2026-01-01T00:00:01.000Z"),
		});
		const third = buildUser({
			id: "33333333-3333-4333-8333-333333333333",
			email: "c@example.com",
			createdAt: new Date("2026-01-01T00:00:02.000Z"),
		});
		repository.findExportBatch.mockImplementation(async (query: ExportBatchQuery): Promise<readonly User[]> => {
			if (!query.after) {
				return [first, second];
			}
			return [third];
		});
		const chunks: string[] = [];
		await useCase.execute(
			{
				write: (chunk: string): void => {
					chunks.push(chunk);
				},
			},
			2,
		);
		const csv = chunks.join("");
		const lines = csv.replace(/^\uFEFF/, "").trim().split("\n");
		expect(repository.findExportBatch).toHaveBeenNthCalledWith(1, { batchSize: 2, after: undefined });
		expect(repository.findExportBatch).toHaveBeenNthCalledWith(2, {
			batchSize: 2,
			after: { createdAt: second.createdAt, id: second.id },
		});
		expect(repository.findExportBatch).toHaveBeenCalledTimes(2);
		expect(lines[0]).toBe("id,name,email,createdAt,updatedAt");
		expect(lines).toHaveLength(4);
		expect(csv).toContain("a@example.com");
		expect(csv).toContain("b@example.com");
		expect(csv).toContain("c@example.com");
		expect(csv.startsWith("\uFEFF")).toBe(true);
	});
});
