import type { Message } from '@xsai/shared-chat'

import type { UIMessagePart } from '../types'

export function extractUIMessageParts(message: Message): UIMessagePart[] {
  if (message.content === undefined) {
    return []
  }

  if (typeof message.content === 'string') {
    return [
      {
        text: message.content,
        type: 'text',
      },
    ]
  }

  if (Array.isArray(message.content)) {
    return message.content.map((part): null | UIMessagePart => {
      switch (part.type) {
        case 'image_url':
        case 'input_audio':
          return {
            text: 'Unsupported message type',
            type: 'text',
          }
        case 'refusal':
          return {
            refusal: part.refusal,
            type: 'refusal',
          }
        case 'text':
          return {
            text: part.text,
            type: 'text',
          }
        default:
      }
      return null
    }).filter((part): part is UIMessagePart => part !== null)
  }

  return []
}
