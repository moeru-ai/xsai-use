import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { useStableValue } from './use-stable-value'

describe('useStableValue', () => {
  it('should return the same reference for primitive values', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useStableValue(value),
      { initialProps: { value: 'test' } },
    )

    const firstRender = result.current
    rerender({ value: 'test' })
    expect(result.current).toBe(firstRender)
  })

  it('should return a new reference when the value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useStableValue(value),
      { initialProps: { value: 'test1' } },
    )

    const firstRender = result.current
    rerender({ value: 'test2' })
    expect(result.current).not.toBe(firstRender)
  })

  it('should maintain reference equality for object values with same content', () => {
    const obj1 = { name: 'John', age: 30 }
    const obj2 = { name: 'John', age: 30 }

    const { result, rerender } = renderHook(
      ({ value }: { value: Record<string, any> }) => useStableValue(value),
      { initialProps: { value: obj1 } },
    )

    const firstRender = result.current
    rerender({ value: obj2 })
    // Objects with same content but different references should be considered the same
    expect(result.current).toBe(firstRender)
  })

  it('should return a new reference when object content changes', () => {
    const obj1 = { name: 'John', age: 30 }
    const obj2 = { name: 'John', age: 31 }

    const { result, rerender } = renderHook(
      ({ value }: { value: Record<string, any> }) => useStableValue(value),
      { initialProps: { value: obj1 } },
    )

    const firstRender = result.current
    rerender({ value: obj2 })
    expect(result.current).not.toBe(firstRender)
  })

  it('should handle arrays properly', () => {
    const array1 = [1, 2, 3]
    const array2 = [1, 2, 3]
    const array3 = [1, 2, 4]

    const { result, rerender } = renderHook(
      ({ value }: { value: number[] }) => useStableValue(value),
      { initialProps: { value: array1 } },
    )

    const firstRender = result.current
    rerender({ value: array2 })
    expect(result.current).toBe(firstRender)

    rerender({ value: array3 })
    expect(result.current).not.toBe(firstRender)
  })
})
