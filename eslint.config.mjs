import js from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import globals from 'globals'
import { FlatCompat } from '@eslint/eslintrc'
import prettier from 'eslint-plugin-prettier'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  recommendedConfig: js.configs.recommended,
})

const eslintconfig = [
  // Global ignores
  {
    ignores: [
      '**/.eslintrc.json',
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.output/**',
      '**/.svelte-kit/**',
      '**/.nuxt/**',
      '**/.angular/**',
      '**/coverage/**',
      '**/playwright-report/**',
      '**/test-results/**',
      'tests/framework/**/*.tgz',
      // Generated 490KB worker bundle (see scripts/build-worker.mjs)
      'src/worker-bundle.generated.ts',
      // Generated README-example manifest (see scripts/extract-readme-examples.mjs)
      'tests/e2e/app/readme-examples.js',
      '**/*.generated.ts',
      '**/*.config.js',
      '**/*.config.cjs',
      '**/rollup.config.js',
      'eslint.config.mjs',
      // Phase 1 throwaway smoke harness — deleted when the Phase 3 e2e host lands
      'scratch/**',
      'check_exports.js',
    ],
  },

  // Base JS configuration
  js.configs.recommended,

  // Prettier integration
  {
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },

  // TypeScript and Prettier configs using compat
  ...compat.extends(
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ),

  // Main configuration for all files
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    rules: {
      // General rules
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-bitwise': 'off',
      'no-underscore-dangle': 'off',
      'no-nested-ternary': 'off',
      'no-restricted-syntax': 'off',
      'no-unused-vars': 'off',
      'no-return-await': 'off',
    },
  },

  // TypeScript-specific configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        ecmaFeatures: {
          jsx: false,
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // Original rules from .eslintrc.json
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // Additional TypeScript rules
      '@typescript-eslint/return-await': 'error',
      '@typescript-eslint/restrict-plus-operands': 'error',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: false,
        },
      ],
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-expressions': 'warn',
      '@typescript-eslint/prefer-as-const': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-use-before-define': 'off',

      // Disable stylistic TypeScript rules (handled by Prettier)
      '@typescript-eslint/semi': 'off',
      '@typescript-eslint/comma-dangle': 'off',
      '@typescript-eslint/quotes': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },

  // Test files configuration (Jest tests)
  {
    files: ['test/**/*.js', '**/*.spec.js', '**/*.test.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-console': 'off',
    },
  },

  // Harness scripts print progress to stdout by design.
  {
    files: ['tests/framework/**/*.{js,mjs,ts}', 'scripts/**/*.mjs'],
    rules: {
      'no-console': 'off',
    },
  },
]

export default eslintconfig
