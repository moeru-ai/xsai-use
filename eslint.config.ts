import antfu, { svelte } from '@antfu/eslint-config'

export default antfu(
  {
    jsx: true,
    react: true,
    svelte: true,
    typescript: { tsconfigPath: './tsconfig.json' },
  },
  // {
  //   ...await svelte({ typescript: true }),
  //   files: ['**/*.svelte.ts', '**/*.svelte.js'],
  // },
)
