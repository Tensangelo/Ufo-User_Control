import { Sequelize } from "sequelize-typescript";
import { InfrastructureError } from "../infrastructure/errors/InfrastructureError";
import { UserModel } from "../infrastructure/db/sequelize/models/UserModel";
import { ENVS_APP, ENVS_DB } from "./Envs";

const CONNECTION_ATTEMPTS = 10;
const CONNECTION_DELAY_MS = 2000;

export const sequelize = new Sequelize({
	dialect: "mysql",
	host: ENVS_DB.DB_HOST,
	port: ENVS_DB.DB_PORT,
	username: ENVS_DB.DB_USER,
	password: ENVS_DB.DB_PASSWORD,
	database: ENVS_DB.DB_NAME,
	models: [UserModel],
	timezone: "+00:00",
	logging: ENVS_APP.IS_PRODUCTION
		? false
		: (sql: string): void => {
				console.log(sql);
			},
	dialectOptions: {
		charset: "utf8mb4",
		connectTimeout: 10000,
	},
	pool: {
		max: 10,
		min: 0,
		acquire: 30000,
		idle: 10000,
	},
	define: {
		charset: "utf8mb4",
		collate: "utf8mb4_unicode_ci",
	},
});

/**
 * Opens the pool, retrying so a container can start while MySQL is still coming up.
 */
export async function connectDatabase(): Promise<void> {
	let lastError: unknown;
	for (let attempt = 1; attempt <= CONNECTION_ATTEMPTS; attempt += 1) {
		try {
			await sequelize.authenticate();
			console.log(`[DB] Connected to ${ENVS_DB.DB_NAME} at ${ENVS_DB.DB_HOST}:${ENVS_DB.DB_PORT}`);
			return;
		} catch (error: unknown) {
			lastError = error;
			if (attempt < CONNECTION_ATTEMPTS) {
				await wait(CONNECTION_DELAY_MS);
			}
		}
	}
	throw new InfrastructureError("Could not connect to the database", lastError);
}

function wait(delayMs: number): Promise<void> {
	return new Promise((resolve) => {
		setTimeout(resolve, delayMs);
	});
}
