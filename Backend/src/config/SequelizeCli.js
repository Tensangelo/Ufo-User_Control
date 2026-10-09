require("dotenv").config();

/**
 * Shared Sequelize CLI settings. Schema changes go through migrations, not sync().
 * @returns {import("sequelize").Options}
 */
function buildConfig() {
	const required = (name) => {
		const value = process.env[name];
		if (!value) {
			throw new Error(`Missing required environment variable: ${name}`);
		}
		return value;
	};
	return {
		username: required("DB_USER"),
		password: required("DB_PASSWORD"),
		database: required("DB_NAME"),
		host: required("DB_HOST"),
		port: Number(process.env.DB_PORT || 3306),
		dialect: "mysql",
		timezone: "+00:00",
		logging: false,
		dialectOptions: {
			charset: "utf8mb4",
		},
	};
}

module.exports = {
	development: buildConfig(),
	test: buildConfig(),
	production: buildConfig(),
};
