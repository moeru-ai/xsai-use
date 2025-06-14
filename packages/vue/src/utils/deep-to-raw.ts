import {
  isProxy,
  isReactive,
  isRef,
  toRaw,
} from 'vue'

export function deepToRaw<T>(input: T): T {
  if (Array.isArray(input)) {
    return [...input.map(deepToRaw) as unknown[]] as T
  }

  if (isRef(input)
    || isReactive(input)
    || isProxy(input)) {
    return deepToRaw(toRaw(input))
  }

  if (input !== null && typeof input === 'object') {
    const clone = {}
    for (const [key, value] of Object.entries(input)) {
      (clone as Record<string, unknown>)[key] = deepToRaw(value)
    }
    return clone as T
  }
  return input
}
