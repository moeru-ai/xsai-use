import antfu from '@antfu/eslint-config'

export async function config(): Promise<ReturnType<typeof antfu>> {
  const rules = await antfu(
    {
      typescript: { tsconfigPath: './tsconfig.json' },
    },
  )

  return rules
}
