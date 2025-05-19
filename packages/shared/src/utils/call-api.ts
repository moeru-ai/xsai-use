import type { StreamTextOptions } from '@xsai/stream-text'
import type { UIMessage, UIMessageToolCallPart } from '../types'
import { streamText } from '@xsai/stream-text'
import { generateWeakID } from './generate-weak-id'

export async function callApi(streamTextOptions: Omit<StreamTextOptions, 'onEvent'>, {
  onUpdate,
  updatingMessage,
  generateID = generateWeakID,
}: {
  onUpdate: (message: UIMessage) => void
  updatingMessage?: UIMessage
  generateID?: () => string
}) {
  const message = updatingMessage ?? {
    id: generateID(),
    parts: [],
    role: 'assistant',
  }

  const { chunkStream } = await streamText({
    ...streamTextOptions as StreamTextOptions,
    onEvent: (event) => {
      const parts = message.parts

      switch (event.type) {
        case 'reasoning': {
          const part = parts.find(part => part.type === 'reasoning')
          if (part) {
            part.reasoning += event.reasoning
          }
          else {
            parts.push({ reasoning: event.reasoning, type: 'reasoning' })
          }
          // TODO: add reasoning to the message for next time submit
          // message.reasoning += event.reasoning
          break
        }
        case 'text-delta': {
          const part = parts.find(part => part.type === 'text')
          if (part) {
            part.text += event.text
          }
          else {
            parts.push({ text: event.text, type: 'text' })
          }
          message.content = (message.content as string ?? '') + event.text
          break
        }
        case 'tool-call': {
          const part = parts.find((part): part is UIMessageToolCallPart => part.type === 'tool-call' && part.status === 'partial' && part.toolCall.index === event.toolCall.index)
          if (part) {
            part.status = 'loading'
          }
          break
        }
        case 'tool-call-delta': {
          const part = parts.find((part): part is UIMessageToolCallPart => part.type === 'tool-call' && part.status === 'partial' && part.toolCall.index === event.toolCall.index)
          if (part) {
            part.toolCall.function.arguments += event.toolCall.function.arguments
          }
          else {
            parts.push({
              status: 'partial',
              toolCall: {
                ...event.toolCall,
              },
              type: 'tool-call',
            })
          }
          break
        }
        case 'tool-call-result': {
          const part = parts.find((part): part is UIMessageToolCallPart => part.type === 'tool-call' && part.status === 'loading' && part.toolCall.id === event.id)
          if (part) {
            if (event.error !== undefined) {
              part.status = 'error'
              part.error = event.error
              break
            }
            if (event.result !== undefined) {
              part.status = 'complete'
              part.result = event.result
              break
            }
          }
          break
        }
        case 'error':
        case 'finish':
        case 'refusal':
        default:
      }

      onUpdate(message)
    },
  })

  await chunkStream.pipeTo(new WritableStream({ write() { } }))
}
