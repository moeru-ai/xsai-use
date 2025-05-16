import antfu from '@antfu/eslint-config'
import js from '@eslint/js'
import svelte from 'eslint-plugin-svelte'
import ts from 'typescript-eslint'
import svelteConfig from './svelte.config.js'

export default ts.config(
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  ...await antfu({
    typescript: {
      tsconfigPath: './tsconfig.json',
    },
    svelte: true,
  }),
  {
    files: ['**/*.svelte.ts', '**/*.svelte.js'],
    ignores: ['eslint.config.ts', 'svelte.config.js'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
        svelteConfig,
      },
    },
  },
)
