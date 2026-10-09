/** @type {import("jest").Config} */
module.exports = {
	preset: "ts-jest",
	testEnvironment: "node",
	roots: ["<rootDir>/test"],
	testMatch: ["**/*.spec.ts"],
	clearMocks: true,
	setupFiles: ["reflect-metadata"],
	testTimeout: 10000,
	transform: {
		"^.+\\.ts$": [
			"ts-jest",
			{
				tsconfig: {
					target: "ES2022",
					module: "commonjs",
					strict: true,
					esModuleInterop: true,
					experimentalDecorators: true,
					emitDecoratorMetadata: true,
					isolatedModules: true,
					types: ["jest", "node"],
				},
			},
		],
	},
};
