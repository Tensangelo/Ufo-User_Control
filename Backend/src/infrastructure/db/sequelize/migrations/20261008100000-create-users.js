"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable(
			"users",
			{
				id: {
					type: Sequelize.UUID,
					allowNull: false,
					primaryKey: true,
				},
				name: {
					type: Sequelize.STRING(100),
					allowNull: false,
				},
				email: {
					type: Sequelize.STRING(255),
					allowNull: false,
					unique: true,
				},
				createdAt: {
					type: Sequelize.DATE(3),
					allowNull: false,
				},
				updatedAt: {
					type: Sequelize.DATE(3),
					allowNull: false,
				},
			},
			{
				charset: "utf8mb4",
				collate: "utf8mb4_unicode_ci",
			},
		);
		await queryInterface.addIndex("users", ["createdAt", "id"], {
			name: "users_created_at_id_idx",
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable("users");
	},
};
