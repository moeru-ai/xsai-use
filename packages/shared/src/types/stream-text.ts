import type { Usage, FinishReason, ToolCall, ToolMessagePart } from '@xsai/shared-chat'

export type StreamTextDataChunk =
  | { error: unknown, type: 'error' }
  | { error?: unknown, id: string, result?: string | ToolMessagePart[], type: 'tool-call-result' }
  | { finishReason?: FinishReason, type: 'finish', usage?: Usage }
  | { reasoning: string, type: 'reasoning' }
  | { refusal: string, type: 'refusal' }
  | { text: string, type: 'text-delta' }
  | { toolCall: ToolCall, type: 'tool-call' }
  | { toolCall: ToolCall, type: 'tool-call-delta' }
