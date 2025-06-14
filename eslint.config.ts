import antfu from '@antfu/eslint-config'

export default antfu(
  {
    jsx: true,
    react: true,
    svelte: true,
    vue: true,
    typescript: { tsconfigPath: './tsconfig.json' },
  },
  {
    ignores: [
      'cspell.config.yaml',
      'cspell.config.yml',
    ],
  },
  // {
  //   ...await svelte({ typescript: true }),
  //   files: ['**/*.svelte.ts', '**/*.svelte.js'],
  // },
)
