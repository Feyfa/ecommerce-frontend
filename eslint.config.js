import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import vue from 'eslint-plugin-vue';
import globals from 'globals';

export default [
    {
        name: 'frontend/ignores',
        ignores: ['coverage/**', 'dist/**'],
    },
    {
        name: 'frontend/javascript-recommended',
        files: ['**/*.{js,vue}'],
        rules: eslint.configs.recommended.rules,
    },
    ...vue.configs['flat/recommended'],
    {
        name: 'frontend/browser',
        files: ['src/**/*.{js,vue}'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.browser,
        },
    },
    {
        name: 'frontend/tests',
        files: ['tests/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
    },
    {
        name: 'frontend/configuration',
        files: ['*.config.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.node,
        },
    },
    eslintConfigPrettier,
];
