import type { InputMessage, UIMessage, UseChatOptions, UseChatStatus } from '@xsai-use/shared'
import { callApi, extractUIMessageParts, generateWeakID } from '@xsai-use/shared'

import { useCallback, useMemo, useRef, useState } from 'react'

import { useStableValue } from './utils/use-stable-value'

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

  const stableInitialMessages = useStableValue(initialMessages ?? [])
  const initialUIMessages = useMemo(() => stableInitialMessages.map((m) => {
    return {
      ...m,
      id: generateID(),
      parts: extractUIMessageParts(m),
    }
  }), [stableInitialMessages, generateID])

  const [uiMessages, setUIMessages] = useState<UIMessage[]>(initialUIMessages)
  // keep a reference to the messages
  const uiMessagesRef = useRef<UIMessage[]>(uiMessages)

  const setInnerMessages = (messages: UIMessage[]) => {
    uiMessagesRef.current = messages
    setUIMessages(messages)
  }

  const [status, setStatus] = useState<UseChatStatus>('idle')
  const setMessages = useCallback((messages: UIMessage[]) => {
    if (status !== 'loading') {
      return
    }
    setInnerMessages(messages)
  }, [status])

  const [input, setInput] = useState('')
  const [error, setError] = useState<Error | null>(null)
  const lastUIMessage = useRef<null | UIMessage>(null)
  const stableStreamTextOptions = useStableValue(streamTextOptions)

  const abortControllerRef = useRef<AbortController | null>(null)

  const request = useCallback(
    async ({
      messages,
    }: {
      messages: UIMessage[]
    }) => {
      setStatus('loading')
      setError(null)

      try {
        abortControllerRef.current = new AbortController()

        await callApi({
          ...stableStreamTextOptions,
          messages,
          onFinish: () => {
            setStatus('idle')
            lastUIMessage.current = null
            // eslint-disable-next-line ts/no-floating-promises
            onFinish?.()
          },
          signal: abortControllerRef.current.signal,
        }, {
          generateID,
          updatingMessage: {
            id: generateID(),
            parts: [],
            role: 'assistant',
          },
          onUpdate: (message) => {
            const clonedMessage = structuredClone(message)

            const latestMessages = uiMessagesRef.current
            const messages = [
              ...latestMessages.at(-1)?.role === 'assistant'
                ? latestMessages.slice(0, -1)
                : latestMessages,
              clonedMessage,
            ]

            // maybe we should throttle this
            setInnerMessages(messages)
          },
        })
      }
      catch (error) {
        setStatus('error')
        const actualError = error instanceof Error ? error : new Error(String(error))
        setError(actualError)
        lastUIMessage.current = null
      }
    },
    [
      generateID,
      onFinish,
      stableStreamTextOptions,
      abortControllerRef,
    ],
  )

  const submitMessage = useCallback(
    async (message: InputMessage) => {
      if (status !== 'idle') {
        return
      }

      if (
        // check content array
        (Array.isArray(message.content) && message.content.length === 0)
        // compatibility with inputs
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

      const newMessages = [
        ...uiMessagesRef.current,
        userMessage,
      ]

      setInnerMessages(newMessages)

      await request({
        messages: newMessages,
      })
    },
    [
      request,
      generateID,
      uiMessagesRef,
      status,
    ],
  )

  const handleSubmit = useCallback(async (e?: React.FormEvent<HTMLFormElement>) => {
    preventDefault && e?.preventDefault?.()

    if (!input) {
      return
    }

    // TODO: support more input types
    await submitMessage({
      content: [
        {
          text: input,
          type: 'text',
        },
      ],
    })

    setInput('')
  }, [
    preventDefault,
    input,
    submitMessage,
  ])

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setStatus('idle')
    }
  }, [])

  const reload = useCallback(
    async (id?: string) => {
      if (status !== 'idle') {
        return
      }
      const latestMessages = uiMessagesRef.current

      if (latestMessages.length === 0) {
        return
      }

      let msgIdx = latestMessages.findLastIndex(m => m.role === 'user' && (id === undefined || m.id === id))
      if (msgIdx === -1) {
        msgIdx = latestMessages.findLastIndex(m => m.role === 'user')
      }
      // still not found, return
      if (msgIdx === -1) {
        return
      }

      const newMessages = latestMessages.slice(0, msgIdx + 1)
      setInnerMessages(newMessages)

      await request({
        messages: newMessages,
      })
    },
    [
      status,
      request,
      uiMessagesRef,
    ],
  )

  const reset = useCallback(() => {
    stop()
    setInnerMessages(initialUIMessages)
    setInput('')
    setError(null)
    setStatus('idle')
  }, [stop, initialUIMessages])

  return {
    error,
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInput(e.currentTarget.value)
    },
    handleSubmit,
    input,
    messages: uiMessages,
    setMessages,
    reload,
    reset,
    setInput,
    status,
    stop,
    submitMessage,
  }
}

export default useChat
