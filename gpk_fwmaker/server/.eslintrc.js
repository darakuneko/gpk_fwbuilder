module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: ['eslint:recommended'],
    parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
    },
    env: {
        node: true,
        es2021: true,
    },
    rules: {
        'no-unused-vars': 'warn',
        'no-console': 'off',
    },
};