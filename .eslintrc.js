module.exports = {
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
	],
	ignorePatterns: [
		'dist/*',
	],
	env: {
		browser: true,
		es2022: true,
	},
	parser: '@typescript-eslint/parser',
	plugins: [ '@typescript-eslint' ],
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		sourceType: 'module',
	},
	rules: {
		'comma-dangle': [ 'error', 'always-multiline' ],
	},
};
