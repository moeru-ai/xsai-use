import type { UIMessageToolCallPart } from '@xsai-use/react'
import classNames from 'classnames'
import './ui-message-part.css'

const styles = {
  collapse: {
    paddingTop: '.5rem',
    paddingBottom: '.5rem',
    minHeight: '2.75rem',
  },
}

export function UIMessageTextPart({ text }: { text: string }) {
  return (
    <div>
      {text}
    </div>
  )
}

export function UIMessageUnknownPart({ type }: { type: string }) {
  return (
    <div>
      Unknown message part type:
      {' '}
      {type}
    </div>
  )
}

export function UIMessageToolPart({ part }: { part: UIMessageToolCallPart }) {
  const hasResult = part.status === 'complete' || part.status === 'error'
  const isLoading = part.status === 'loading' || part.status === 'partial'

  const renderToolResult = () => {
    if (part.status === 'error' && part.error !== undefined) {
      return (
        <pre>
          {String(part.error)}
        </pre>
      )
    }

    if (part.status === 'complete' && part.result !== undefined) {
      const result = part.result
      if (typeof result === 'string') {
        return (
          <pre>
            {result}
          </pre>
        )
      }

      if (Array.isArray(result)) {
        return (
          <div>
            {result.map((item, index) => {
              if (item.type === 'text') {
                return (
                  <div key={`${item.type + index}`}>
                    {String(item)}
                  </div>
                )
              }
              if (item.type === 'image_url') {
                return (
                  <img key={`${item.type + index}`} src={String(item.image_url)} alt="Tool Result" style={{ maxWidth: '100%', borderRadius: '4px' }} />
                )
              }
              if (item.type === 'input_audio') {
                return (
                  <audio key={`${item.type + index}`} controls>
                    <source src={item.input_audio.data} type={`audio/${item.input_audio.format}`} />
                    Your browser does not support the audio element.
                  </audio>
                )
              }

              return null
            })}
          </div>
        )
      }

      // Handle primitive results
      return <div>{String(part.result)}</div>
    }

    return null
  }

  return (
    <div
      className={
        classNames('collapse', 'collapse-arrow', 'border', part.status === 'error' ? 'bg-red-100' : 'bg-base-100')
      }
    >
      <input type="checkbox" style={{ ...styles.collapse }} />
      <div className="collapse-title font-semibold tweak-collapse-title-arrow" style={{ ...styles.collapse }}>{part.toolCall.function.name}</div>
      <div className="collapse-content">
        {isLoading && (
          <div className="skeleton h-4 w-full"></div>
        )}

        {hasResult && (
          <div>
            {renderToolResult()}
          </div>
        )}
      </div>
    </div>
  )
}
