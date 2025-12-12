import type { AudioContentPart, CommonContentPart, ImageContentPart, Message, ToolCall } from '@xsai/shared-chat'

export type UIMessage = Message & {
  id: string
  parts: UIMessagePart[]
}

export interface UIMessageAudioPart {
  audio: AudioContentPart
  type: 'audio'
}

export interface UIMessageImagePart {
  type: 'image'
  url: ImageContentPart
}

export type UIMessagePart
  = | UIMessageAudioPart
    | UIMessageImagePart
    | UIMessageReasoningPart
    | UIMessageRefusalPart
    | UIMessageTextPart
    | UIMessageToolCallPart

export interface UIMessageReasoningPart {
  reasoning: string
  type: 'reasoning'
}

export interface UIMessageRefusalPart {
  refusal: string
  type: 'refusal'
}

export interface UIMessageTextPart {
  text: string
  type: 'text'
}

export interface UIMessageToolCallPart {
  /**
   * The status of the tool call
   * - `complete` - the tool call has finished
   * - `error` - the tool call has errored
   * - `loading` - the tool call is loading
   * - `partial` - the tool call has partially loaded
   *
   * partial -> loading -> complete
   *
   * partial -> loading -> error
   *
   * partial -> error
   */
  status: 'complete' | 'error' | 'loading' | 'partial'
  toolCall: ToolCall
  type: 'tool-call'
  result?: string | CommonContentPart[]
  error?: unknown
}
