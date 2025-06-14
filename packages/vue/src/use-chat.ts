import type { InputMessage, UIMessage, UseChatOptions, UseChatStatus } from '@xsai-use/shared'
import type { MaybeRefOrGetter, Ref } from 'vue'
import { callApi, extractUIMessageParts, generateWeakID } from '@xsai-use/shared'
import { computed, ref, toValue, watch } from 'vue'

declare global {
  interface ReadableStream<R = any> {
    // eslint-disable-next-line ts/method-signature-style
    [Symbol.asyncIterator](): AsyncIterableIterator<R>
  }
}

export function useChat(options: MaybeRefOrGetter<UseChatOptions>) {
  const getOptions = () => toValue(options)

  const initialUIMessages = computed(() => {
    const opts = getOptions()
    const messages = opts.initialMessages ?? []
    const idGenerator = opts.generateID ?? generateWeakID

    return messages.map((m) => {
      return {
        ...m,
        id: idGenerator(),
        parts: extractUIMessageParts(m),
      }
    })
  })

  const messages = ref<UIMessage[]>(initialUIMessages.value)
  const status = ref<UseChatStatus>('idle')
  const input = ref('')
  const error = ref<Error | null>(null)

  let abortController: AbortController | null = null

  watch(initialUIMessages, (newInitialMessages) => {
    if (status.value === 'idle') {
      messages.value = newInitialMessages
    }
  }, { deep: true })

  const request = async ({ messages: requestMessages }: { messages: UIMessage[] }) => {
    status.value = 'loading'
    error.value = null

    abortController = new AbortController()

    try {
      const opts = getOptions()
      const {
        id: _id,
        generateID: _generateID,
        initialMessages: _initialMessages,
        onFinish: _onFinish,
        preventDefault: _preventDefault,
        ...currentStreamTextOptions
      } = opts
      const idGenerator = opts.generateID ?? generateWeakID

      await callApi({
        ...currentStreamTextOptions,
        messages: requestMessages,
        onFinish: () => {
          status.value = 'idle'
          abortController = null
          // Call the onFinish callback if provided
          void opts.onFinish?.()
        },
        signal: abortController.signal,
      }, {
        generateID: idGenerator,
        updatingMessage: {
          id: idGenerator(),
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

    const opts = getOptions()
    const idGenerator = opts.generateID ?? generateWeakID

    const userMessage = {
      ...message,
      id: idGenerator(),
      role: 'user',
    } as UIMessage
    userMessage.parts = extractUIMessageParts(userMessage)

    const newMessages = [...messages.value, userMessage]
    messages.value = newMessages

    await request({
      messages: newMessages,
    })
  }

  const handleSubmit = async (e?: Event) => {
    const opts = getOptions()
    if (opts.preventDefault && e) {
      e.preventDefault()
    }

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
      messages: newMessages,
    })
  }

  const reset = () => {
    stop()
    messages.value = initialUIMessages.value
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
    messages,
    status,
    input,
    error,

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
