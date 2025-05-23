import type { Message } from '@xsai/shared-chat'
import type { StreamTextOptions } from '@xsai/stream-text'

/**
 * you can either use { content: string } or { parts: [{ text:'', type:'text' }] }
 */
export type InputMessage = Omit<Message, 'id' | 'role'>

export type UseChatOptions = Omit<StreamTextOptions, 'onChunk' | 'onFinish'> & {
  id?: string
  generateID?: () => string
  initialMessages?: Message[]
  onFinish?: () => Promise<void> | void
  preventDefault?: boolean
}

export type UseChatStatus = 'error' | 'idle' | 'loading'
