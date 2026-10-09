module.exports = {
	root: true,
	ignorePatterns: ["dist/", "node_modules/", "coverage/"],
	overrides: [
		{
			files: ["**/*.ts"],
			parser: "@typescript-eslint/parser",
			parserOptions: {
				ecmaVersion: 2022,
				sourceType: "module",
			},
			plugins: ["@typescript-eslint"],
			extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
			env: {
				node: true,
				es2022: true,
				jest: true,
			},
			rules: {
				"@typescript-eslint/no-explicit-any": "error",
				"@typescript-eslint/no-unused-vars": [
					"error",
					{ argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
				],
			},
		},
		{
			files: ["**/*.js", "**/*.cjs"],
			env: {
				node: true,
				es2022: true,
			},
			parserOptions: {
				ecmaVersion: 2022,
			},
			rules: {
				"@typescript-eslint/no-require-imports": "off",
			},
		},
	],
};
