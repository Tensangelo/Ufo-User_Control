import { inject, injectable } from "tsyringe";
import { User } from "../../domain/entities/User";
import { ExportCursor, UserRepository } from "../../domain/ports/UserRepository";
import { USER_LIMITS } from "../constants/UserConstants";
import { TextWriter } from "../ports/TextWriter";
import { USER_REPOSITORY_TOKEN } from "../tokens/UserRepositoryToken";

const CSV_HEADER = "id,name,email,createdAt,updatedAt";

@injectable()
export class ExportUsersUseCase {
	public constructor(
		@inject(USER_REPOSITORY_TOKEN)
		private readonly userRepository: UserRepository,
	) {}

	public async execute(
		writer: TextWriter,
		batchSize: number = USER_LIMITS.EXPORT_BATCH_SIZE,
	): Promise<void> {
		let after: ExportCursor | undefined;
		let hasWrittenHeader = false;
		let hasMore = true;
		while (hasMore) {
			const batch = await this.userRepository.findExportBatch({ batchSize, after });
			if (!hasWrittenHeader) {
				await writer.write(`\uFEFF${CSV_HEADER}\n`);
				hasWrittenHeader = true;
			}
			for (const user of batch) {
				await writer.write(`${toCsvRow(user)}\n`);
			}
			const last = batch[batch.length - 1];
			hasMore = batch.length === batchSize && last !== undefined;
			if (hasMore && last) {
				after = { createdAt: last.createdAt, id: last.id };
			}
		}
	}
}

function toCsvRow(user: User): string {
	const fields = [user.id, user.name, user.email, user.createdAt.toISOString(), user.updatedAt.toISOString()];
	return fields.map((field: string): string => toCsvField(field)).join(",");
}

function toCsvField(value: string): string {
	const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
	return `"${safe.replace(/"/g, '""')}"`;
}
