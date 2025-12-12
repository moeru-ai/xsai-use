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

  let shouldNewTextNext = true
  let shouldNewReasoningNext = true

  const { fullStream } = await streamText({
    ...streamTextOptions as StreamTextOptions,
    onEvent: (event) => {
      const parts = message.parts

      switch (event.type) {
        case 'text-delta': {
          shouldNewReasoningNext = true
          const part = parts.findLast(part => part.type === 'text')
          if (part && !shouldNewTextNext) {
            part.text += event.text
          }
          else {
            parts.push({ text: event.text, type: 'text' })
          }

          message.content = (message.content as string ?? '') + event.text

          shouldNewTextNext = false
          break
        }
        case 'reasoning-delta': {
          shouldNewTextNext = true
          const part = parts.findLast(part => part.type === 'reasoning')
          if (part && !shouldNewReasoningNext) {
            part.reasoning += event.text
          }
          else {
            parts.push({ reasoning: event.text, type: 'reasoning' })
          }

          message.content = (message.content ?? '') + event.text

          shouldNewReasoningNext = false
          break
        }
        case 'tool-call-streaming-start': {
          shouldNewTextNext = true
          shouldNewReasoningNext = true
          parts.push({
            status: 'partial',
            toolCall: {
              id: event.toolCallId,
              type: 'function',
              function: {
                name: event.toolName,
                arguments: '',
              },
            },
            type: 'tool-call',
          })
          break
        }
        case 'tool-call-delta': {
          const part = parts.find((part): part is UIMessageToolCallPart => part.type === 'tool-call' && part.toolCall.id === event.toolCallId)
          if (part) {
            part.status = 'loading'
            part.toolCall.function.arguments += event.argsTextDelta
          }
          break
        }
        case 'tool-call': {
          const part = parts.find((part): part is UIMessageToolCallPart => part.type === 'tool-call' && part.toolCall.id === event.toolCallId)
          if (part) {
            part.status = 'complete'
            part.toolCall.function.arguments = event.args
          }
          break
        }
        case 'tool-result': {
          const part = parts.find((part): part is UIMessageToolCallPart => part.type === 'tool-call' && part.toolCall.id === event.toolCallId)
          if (part) {
            if (event.result !== undefined) {
              part.result = event.result
            }
          }
          break
        }
        case 'error':
        case 'finish': {
          const part = parts.find((part): part is UIMessageToolCallPart => part.type === 'tool-call' && part.status !== 'complete')
          if (part) {
            part.status = 'error'
          }
          break
        }
        default:
      }

      onUpdate(message)
    },
  })

  await fullStream.pipeTo(new WritableStream({ write() { } }))
}
