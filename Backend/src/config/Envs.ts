import dotenv from "dotenv";

dotenv.config();

function readRequired(name: string): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
}

function readNumber(name: string, fallback: number): number {
	const raw = process.env[name];
	if (raw === undefined || raw === "") {
		return fallback;
	}
	const parsed = Number(raw);
	if (!Number.isInteger(parsed) || parsed <= 0) {
		throw new Error(`Environment variable ${name} must be a positive integer`);
	}
	return parsed;
}

console.log(`[ENV] NODE_ENV=${process.env.NODE_ENV ?? "development"}`);

export const ENVS_APP = {
	PORT: readNumber("PORT", 3000),
	IS_PRODUCTION: process.env.NODE_ENV === "production",
	CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:3001",
} as const;

export const ENVS_DB = {
	DB_HOST: readRequired("DB_HOST"),
	DB_PORT: readNumber("DB_PORT", 3306),
	DB_USER: readRequired("DB_USER"),
	DB_PASSWORD: readRequired("DB_PASSWORD"),
	DB_NAME: readRequired("DB_NAME"),
} as const;
