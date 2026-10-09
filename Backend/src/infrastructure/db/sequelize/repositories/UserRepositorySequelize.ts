import { Op, WhereOptions, literal } from "sequelize";
import { injectable } from "tsyringe";
import { sequelize } from "../../../../config/Database";
import { User } from "../../../../domain/entities/User";
import { UserNotFoundError } from "../../../../domain/errors/UserNotFoundError";
import {
	ExportBatchQuery,
	ExportCursor,
	UserPage,
	UserPageQuery,
	UserRepository,
} from "../../../../domain/ports/UserRepository";
import { mapDatabaseError } from "../MapDatabaseError";
import { UserModel } from "../models/UserModel";

/**
 * MySQL adapter. Listing uses offset because the API is page-based and pageSize is capped.
 * Export uses a keyset on (createdAt, id) so large downloads do not degrade with OFFSET.
 */
@injectable()
export class UserRepositorySequelize implements UserRepository {
	public async findById(id: string): Promise<User | null> {
		return this.run(async (): Promise<User | null> => {
			const found = await UserModel.findByPk(id);
			if (!found) {
				return null;
			}
			return this.toUser(found);
		});
	}

	public async findByEmail(email: string): Promise<User | null> {
		return this.run(async (): Promise<User | null> => {
			const found = await UserModel.findOne({ where: { email } });
			if (!found) {
				return null;
			}
			return this.toUser(found);
		});
	}

	public async create(user: User): Promise<User> {
		return this.run(async (): Promise<User> => {
			const created = await UserModel.create({
				id: user.id,
				name: user.name,
				email: user.email,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			});
			return this.toUser(created);
		});
	}

	public async update(user: User): Promise<User> {
		return this.run(async (): Promise<User> => {
			const [updatedCount] = await UserModel.update(
				{ name: user.name, email: user.email, updatedAt: user.updatedAt },
				{ where: { id: user.id } },
			);
			if (updatedCount === 0) {
				throw new UserNotFoundError();
			}
			const updated = await UserModel.findByPk(user.id);
			if (!updated) {
				throw new UserNotFoundError();
			}
			return this.toUser(updated);
		});
	}

	public async delete(id: string): Promise<void> {
		return this.run(async (): Promise<void> => {
			const removed = await UserModel.destroy({ where: { id } });
			if (removed === 0) {
				throw new UserNotFoundError();
			}
		});
	}

	public async findPage(query: UserPageQuery): Promise<UserPage> {
		return this.run(async (): Promise<UserPage> => {
			const offset = (query.page - 1) * query.pageSize;
			const found = await UserModel.findAndCountAll({
				where: this.buildPageWhere(query.search),
				limit: query.pageSize,
				offset,
				order: [
					["createdAt", "ASC"],
					["id", "ASC"],
				],
			});
			if (typeof found.count !== "number") {
				throw new Error("Unexpected grouped count");
			}
			return {
				items: found.rows.map((row) => this.toUser(row)),
				total: found.count,
			};
		});
	}

	public async findExportBatch(query: ExportBatchQuery): Promise<readonly User[]> {
		return this.run(async (): Promise<readonly User[]> => {
			const rows = await UserModel.findAll({
				where: this.buildExportWhere(query.after),
				order: [
					["createdAt", "ASC"],
					["id", "ASC"],
				],
				limit: query.batchSize,
			});
			return rows.map((row) => this.toUser(row));
		});
	}

	private buildPageWhere(search: string | undefined): WhereOptions<UserModel> | undefined {
		if (!search) return undefined;
		const pattern = `%${escapeLike(search)}%`;
		return {
			[Op.or]: [{ name: { [Op.like]: pattern } }, { email: { [Op.like]: pattern } }],
		};
	}

	private buildExportWhere(after: ExportCursor | undefined): WhereOptions<UserModel> | undefined {
		if (!after) {
			return undefined;
		}
		const createdAt = sequelize.escape(formatUtcDate(after.createdAt));
		const id = sequelize.escape(after.id);
		return literal(`(\`createdAt\`, \`id\`) > (${createdAt}, ${id})`) as WhereOptions<UserModel>;
	}

	private toUser(model: UserModel): User {
		return User.create({
			id: model.getDataValue("id"),
			name: model.getDataValue("name"),
			email: model.getDataValue("email"),
			createdAt: model.getDataValue("createdAt"),
			updatedAt: model.getDataValue("updatedAt"),
		});
	}

	private async run<T>(operation: () => Promise<T>): Promise<T> {
		try {
			return await operation();
		} catch (error: unknown) {
			throw mapDatabaseError(error);
		}
	}
}

function escapeLike(value: string): string {
	return value.replace(/[\\%_]/g, (character) => `\\${character}`);
}

function formatUtcDate(value: Date): string {
	return value.toISOString().slice(0, 23).replace("T", " ");
}
