"use strict";

const { randomUUID } = require("crypto");

const DEFAULT_SEED_USERS = 25;
const MAX_SEED_USERS = 20000;
const INSERT_BATCH_SIZE = 500;
const SEED_BASE_TIME = Date.parse("2026-01-01T00:00:00.000Z");

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface) {
		const [rows] = await queryInterface.sequelize.query("SELECT COUNT(*) AS total FROM users");
		const existing = Number(rows[0].total);
		if (existing > 0) {
			return;
		}
		const total = resolveSeedCount();
		const now = new Date();
		const users = [];
		for (let index = 1; index <= total; index += 1) {
			users.push({
				id: randomUUID(),
				name: `User ${index}`,
				email: `user.${index}@example.com`,
				// One second apart so ordering stays stable if the driver drops fractional seconds.
				createdAt: new Date(SEED_BASE_TIME + index * 1000),
				updatedAt: now,
			});
		}
		for (let offset = 0; offset < users.length; offset += INSERT_BATCH_SIZE) {
			await queryInterface.bulkInsert("users", users.slice(offset, offset + INSERT_BATCH_SIZE));
		}
	},

	async down(queryInterface) {
		await queryInterface.bulkDelete("users", null, {});
	},
};

function resolveSeedCount() {
	const raw = process.env.SEED_USERS;
	if (!raw) {
		return DEFAULT_SEED_USERS;
	}
	const parsed = Number(raw);
	if (!Number.isInteger(parsed) || parsed < 1 || parsed > MAX_SEED_USERS) {
		throw new Error(`SEED_USERS must be an integer between 1 and ${MAX_SEED_USERS}`);
	}
	return parsed;
}
