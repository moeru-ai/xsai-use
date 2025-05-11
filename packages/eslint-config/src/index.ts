import antfu from '@antfu/eslint-config'

export function config(): ReturnType<typeof antfu> {
  return antfu()
}
