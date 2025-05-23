// copied from: https://github.com/vercel/ai/blob/main/packages/react/src/util/use-stable-value.ts

import { isDeepEqualData } from '@xsai-use/shared'
import { useEffect, useState } from 'react'

/**
 * Returns a stable value that only updates the stored value (and triggers a re-render)
 * when the value's contents differ by deep-compare.
 */
export function useStableValue<T>(latestValue: T): T {
  const [value, setValue] = useState<T>(latestValue)

  useEffect(() => {
    if (!isDeepEqualData(latestValue, value)) {
      // trigger re-render on purpose
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setValue(latestValue)
    }
  }, [latestValue, value])

  return value
}
