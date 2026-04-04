module.exports = {
    extends: ['@goparrot/eslint-config/recommended', '@goparrot/eslint-config/less-strict'],
    parserOptions: {
        project: './tsconfig.eslint.json',
    },
    rules: {
        'import/no-restricted-paths': [
            'error',
            {
                zones: [{ target: './lib', from: './src' }],
            },
        ],
        'import/no-extraneous-dependencies': 'error',
    },
};
