import type { InputMessage, UIMessage, UseChatOptions, UseChatStatus } from '@xsai-use/shared'
import { callApi, extractUIMessageParts, generateWeakID } from '@xsai-use/shared'
import { computed, readonly, ref, watch } from 'vue'
import { deepToRaw } from './utils/deep-to-raw'

declare global {
  interface ReadableStream<R = any> {
    // eslint-disable-next-line ts/method-signature-style
    [Symbol.asyncIterator](): AsyncIterableIterator<R>
  }
}

export function useChat(options: UseChatOptions) {
  const {
    id,
    generateID = generateWeakID,
    initialMessages = [],
    onFinish,
    preventDefault = false,
    ...streamTextOptions
  } = options

  const initialUIMessages = initialMessages.map((m) => {
    return {
      ...m,
      id: generateID(),
      parts: extractUIMessageParts(m),
    }
  })

  const messages = ref<UIMessage[]>(initialUIMessages)
  const status = ref<UseChatStatus>('idle')
  const input = ref('')
  const error = ref<Error>()

  let abortController: AbortController | null = null

  const initialUIMessagesR = computed(() => initialUIMessages)
  watch(initialUIMessagesR, (newInitialMessages) => {
    if (status.value === 'idle') {
      messages.value = newInitialMessages
    }
  }, { deep: true })

  const request = async ({ messages: requestMessages }: { messages: UIMessage[] }) => {
    status.value = 'loading'
    error.value = undefined

    abortController = new AbortController()

    try {
      await callApi({
        ...streamTextOptions,
        messages: requestMessages,
        onFinish: () => {
          status.value = 'idle'
          abortController = null
          void options.onFinish?.()
        },
        signal: abortController.signal,
      }, {
        generateID,
        updatingMessage: {
          id: generateID(),
          parts: [],
          role: 'assistant',
        },
        onUpdate: (message) => {
          if (abortController?.signal.aborted) {
            return
          }

          const clonedMessage = structuredClone(message)
          const currentMessages = messages.value

          // Replace the last assistant message or append new one
          const newMessages = [
            ...(currentMessages.at(-1)?.role === 'assistant'
              ? currentMessages.slice(0, -1)
              : currentMessages),
            clonedMessage,
          ]

          messages.value = newMessages
        },
      })
    }
    catch (err) {
      if (abortController.signal.aborted) {
        return
      }
      status.value = 'error'
      const actualError = err instanceof Error ? err : new Error(String(err))
      error.value = actualError
      abortController = null
    }
  }

  const submitMessage = async (message: InputMessage) => {
    if (status.value !== 'idle') {
      return
    }

    // Validate message content
    if (
      (Array.isArray(message.content) && message.content.length === 0)
      || (typeof message.content === 'string' && message.content.trim() === '')
    ) {
      return
    }

    const userMessage = {
      ...message,
      id: generateID(),
      role: 'user',
    } as UIMessage
    userMessage.parts = extractUIMessageParts(userMessage)

    const newMessages = [...messages.value, userMessage]
    messages.value = newMessages

    await request({
      messages: deepToRaw(newMessages),
    })
  }

  const handleSubmit = async (e?: Event) => {
    preventDefault && e?.preventDefault?.()

    if (!input.value.trim()) {
      return
    }

    await submitMessage({
      content: [
        {
          text: input.value,
          type: 'text',
        },
      ],
    })

    input.value = ''
  }

  const stop = () => {
    if (abortController) {
      abortController.abort()
      abortController = null
      status.value = 'idle'
    }
  }

  const reload = async (id?: string) => {
    if (status.value === 'loading') {
      return
    }

    const currentMessages = messages.value

    if (currentMessages.length === 0) {
      return
    }

    // Find last user message with matching id (or any user message if id is undefined)
    let msgIdx = -1
    for (let i = currentMessages.length - 1; i >= 0; i--) {
      if (currentMessages[i].role === 'user' && (id === undefined || currentMessages[i].id === id)) {
        msgIdx = i
        break
      }
    }

    // If no matching message found, find the last user message
    if (msgIdx === -1) {
      for (let i = currentMessages.length - 1; i >= 0; i--) {
        if (currentMessages[i].role === 'user') {
          msgIdx = i
          break
        }
      }
    }

    // Still not found, return
    if (msgIdx === -1) {
      return
    }

    const newMessages = currentMessages.slice(0, msgIdx + 1)
    messages.value = newMessages

    await request({
      messages: deepToRaw(newMessages),
    })
  }

  const reset = () => {
    stop()
    messages.value = initialUIMessages
    input.value = ''
    error.value = null
    status.value = 'idle'
  }

  const setMessages = (newMessages: UIMessage[]) => {
    if (status.value === 'loading') {
      return
    }
    messages.value = newMessages
  }

  const handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement
    input.value = target.value
  }

  return {
    // state
    messages: readonly(messages),
    status: readonly(status),
    input,
    error: readonly(error),

    // Actions
    submitMessage,
    handleSubmit,
    handleInputChange,
    setMessages,
    reload,
    reset,
    stop,
  }
}

export default useChat
