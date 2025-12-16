import type { CommonContentPart, Message, RefusalContentPart } from '@xsai/shared-chat'
import type { UIMessagePart } from './types/ui'

export type ParseFunc<T extends (CommonContentPart | RefusalContentPart)['type']> = (part: Extract<CommonContentPart | RefusalContentPart, { type: T }>) => UIMessagePart[]

export type ParseMap = {
  [T in (CommonContentPart | RefusalContentPart)['type']]?: ParseFunc<T>
}

const defaultParseMap: ParseMap = {
  text: part => [{
    text: part.text,
    type: 'text',
  }],
  refusal: part => [{
    refusal: part.refusal,
    type: 'refusal',
  }],
  image_url: () => [{
    text: 'Unsupported message type',
    type: 'text',
  }],
  input_audio: () => [{
    text: 'Unsupported message type',
    type: 'text',
  }],
}

export class PartParser {
  #parses: ParseMap = defaultParseMap

  register(map: ParseMap) {
    this.#parses = { ...this.#parses, ...map }
    return this
  }

  #parsePart(part: CommonContentPart | RefusalContentPart): UIMessagePart[] {
    const parse = this.#parses[part.type]
    if (parse) {
      return (parse as ParseFunc<typeof part.type>)(part)
    }
    return [{
      text: 'Unsupported message type',
      type: 'text',
    }]
  }

  exec(message: Message) {
    if (message.content === undefined) {
      return []
    }

    if (typeof message.content === 'string') {
      return this.#parsePart({
        type: 'text',
        text: message.content,
      })
    }

    if (Array.isArray(message.content)) {
      return message.content.flatMap(part => this.#parsePart(part)).filter((part): part is UIMessagePart => part !== null)
    }

    return []
  }
}
