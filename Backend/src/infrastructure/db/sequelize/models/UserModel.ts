import { Column, CreatedAt, DataType, Model, Table, UpdatedAt } from "sequelize-typescript";

@Table({
	tableName: "users",
	timestamps: true,
	indexes: [{ name: "users_created_at_id_idx", fields: ["createdAt", "id"] }],
})
export class UserModel extends Model {
	@Column({
		primaryKey: true,
		type: DataType.UUID,
		allowNull: false,
	})
	declare id: string;

	@Column({
		type: DataType.STRING(100),
		allowNull: false,
	})
	declare name: string;

	@Column({
		type: DataType.STRING(255),
		allowNull: false,
		unique: true,
	})
	declare email: string;

	@CreatedAt
	@Column({
		type: DataType.DATE(3),
		allowNull: false,
	})
	declare createdAt: Date;

	@UpdatedAt
	@Column({
		type: DataType.DATE(3),
		allowNull: false,
	})
	declare updatedAt: Date;
}
