// mixed from
// https://github.com/vercel/ai/blob/26e70676e17e84a3e6d3054722365325a14cdc00/packages/vue/src/use-chat.ts#L464-L476
// https://github.com/vuejs/core/issues/5303#issuecomment-1543596383
import {
  isProxy,
  isReactive,
  isRef,
  toRaw,
} from 'vue'

export function deepToRaw<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map(deepToRaw) as T
  }

  if (isRef(input) || isReactive(input) || isProxy(input)) {
    return deepToRaw(toRaw(input))
  }

  if (input != null && typeof input === 'object') {
    return Object.keys(input).reduce((acc, key) => {
      (acc as Record<string, unknown>)[key] = deepToRaw(input[key as keyof T])
      return acc
    }, {} as T)
  }
  return input
}
