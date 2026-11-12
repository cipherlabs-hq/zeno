import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import vue from 'eslint-plugin-vue';
import vueA11y from 'eslint-plugin-vuejs-accessibility';
import vueParser from 'vue-eslint-parser';
import { configs as litConfigs } from 'eslint-plugin-lit';
import { configs as wcConfigs } from 'eslint-plugin-wc';
import prettier from 'eslint-config-prettier';

const unusedVars = [
  'error',
  {
    argsIgnorePattern: '^_',
    varsIgnorePattern: '^_',
    caughtErrorsIgnorePattern: '^_',
  },
];

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/storybook-static/**',
      '**/.docusaurus/**',
      '**/.nx/**',
      '**/custom-elements.json',
      // Written by apps/zeno-docs/scripts/generate.mjs
      'apps/zeno-docs/src/generated/**',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.es2022 },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': unusedVars,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'inline-type-imports' },
      ],
    },
  },

  // Node scripts and tool configuration
  {
    files: [
      '**/*.config.{js,mjs,ts}',
      '**/scripts/**/*.{js,mjs,ts}',
      '**/.storybook/*.{js,ts}',
      'apps/zeno-docs/*.{js,ts}',
    ],
    languageOptions: { globals: { ...globals.node } },
  },

  // Lit elements
  {
    files: ['packages/core/src/**/*.ts'],
    ...litConfigs['flat/recommended'],
  },
  {
    files: ['packages/core/src/**/*.ts'],
    ...wcConfigs['flat/recommended'],
  },

  // Vue single-file components
  ...vue.configs['flat/recommended'].map(config => ({
    ...config,
    files: ['**/*.vue'],
  })),
  ...vueA11y.configs['flat/recommended'].map(config => ({
    ...config,
    files: ['**/*.vue'],
  })),
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
  },

  // The Vue single-file components are the 2025 parallel implementation and
  // are kept only until the Lit elements replace them (see
  // docs/vue-sfc-retirement.md). These rules report known problems in them
  // (39 accessibility findings, 15 uses of `any`, 12 prop-default findings on
  // 2026-11-10, listed per component in that file). They are switched off
  // here so lint stays a useful gate for the code that will ship, not as a
  // claim that the SFCs pass.
  {
    files: ['packages/vue/src/components/**/*.vue'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/require-default-prop': 'off',
      'vue/no-required-prop-with-default': 'off',
      'vuejs-accessibility/label-has-for': 'off',
      'vuejs-accessibility/mouse-events-have-key-events': 'off',
      'vuejs-accessibility/no-static-element-interactions': 'off',
      'vuejs-accessibility/interactive-supports-focus': 'off',
      'vuejs-accessibility/no-redundant-roles': 'off',
      'vuejs-accessibility/click-events-have-key-events': 'off',
    },
  },

  // In the example app `slot` is the HTML attribute that places a node in a
  // custom element's slot, not Vue 2's slot syntax.
  {
    files: ['examples/**/*.vue'],
    rules: { 'vue/no-deprecated-slot-attribute': 'off' },
  },

  // Tests
  {
    files: ['**/*.{spec,test}.{ts,tsx}', '**/test/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  prettier
);
