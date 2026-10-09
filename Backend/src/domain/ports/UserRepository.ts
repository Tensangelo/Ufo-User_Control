import { User } from "../entities/User";

export interface UserPageQuery {
	readonly page: number;
	readonly pageSize: number;
	readonly search?: string;
}

export interface UserPage {
	readonly items: readonly User[];
	readonly total: number;
}

/** Position of the last row already exported. The next batch starts after this pair. */
export interface ExportCursor {
	readonly createdAt: Date;
	readonly id: string;
}

export interface ExportBatchQuery {
	readonly batchSize: number;
	readonly after?: ExportCursor;
}

/**
 * Persistence port for users.
 * Implementations must keep list order and export order identical: createdAt ASC, id ASC.
 */
export interface UserRepository {
	findById(id: string): Promise<User | null>;
	findByEmail(email: string): Promise<User | null>;
	create(user: User): Promise<User>;
	update(user: User): Promise<User>;
	delete(id: string): Promise<void>;
	findPage(query: UserPageQuery): Promise<UserPage>;
	findExportBatch(query: ExportBatchQuery): Promise<readonly User[]>;
}
