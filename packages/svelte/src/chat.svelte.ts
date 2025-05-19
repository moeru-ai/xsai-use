import type {
  InputMessage,
  UIMessage,
  UseChatOptions,
  UseChatStatus,
} from '@xsai-use/shared'
import {
  generateWeakID,
  extractUIMessageParts,
  callApi,
} from '@xsai-use/shared'

export class Chat {
  readonly #options: UseChatOptions = {}
  readonly #generateID = $derived(this.#options.generateID ?? generateWeakID)
  readonly id: string = $derived(this.#options.id ?? this.#generateID())
  readonly #onFinish = $derived(this.#options.onFinish)
  readonly #preventDefault = $derived(this.#options.preventDefault ?? false)
  readonly #initialUIMessages = $derived((this.#options.initialMessages ?? []).map(m => ({
    ...m,
    id: this.#generateID(),
    parts: extractUIMessageParts(m),
  })))

  readonly #streamTextOptions: Record<string, unknown>

  #error = $state<Error | null>(null)
  get error() {
    return this.#error
  }

  #status = $state<UseChatStatus>('idle')
  get status() {
    return this.#status
  }

  #messages = $state<UIMessage[]>([])
  get messages() {
    return this.#messages
  }

  set messages(messages: UIMessage[]) {
    this.#messages = messages
  }

  input = $state<string>('')

  #abortController = $state<AbortController | null>(null)

  constructor(options: UseChatOptions) {
    this.#options = options

    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      id,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      generateID,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      initialMessages,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onFinish,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      preventDefault,
      ...streamTextOptions
    } = this.#options

    this.#streamTextOptions = streamTextOptions
  }

  #request = async ({
      messages
    }: {
      messages: UIMessage[]
    }) => {
    this.#status = 'loading'
    this.#error = null

    try {
      this.#abortController = new AbortController()

      await callApi(
        {
          ...this.#streamTextOptions,
          messages,
          onFinish: () => {
            this.#status = 'idle'

            const messages = this.#messages
            this.#onFinish?.()
            this.#abortController = null
          },
          signal: this.#abortController.signal,
        },
        {
          generateID: this.#generateID,
          updatingMessage: {
            id: this.#generateID(),
            parts: [],
            role: 'assistant',
          },
          onUpdate: (message) => {
            const clonedMessage = structuredClone(message)
            const messages = this.#messages

            if (messages.at(-1)?.role === 'assistant') {
              this.#messages = messages.slice(0, -1).concat(clonedMessage)
            }
            else {
              this.#messages = messages.concat(clonedMessage)
            }
          },
        },
      )
    }
    catch (err) {
      this.#status = 'error'
      const actualError = err instanceof Error ? err : new Error(String(err))
      this.#error = actualError
      this.#abortController = null
    }
  }

  submitMessage = async (message: InputMessage) => {
    if (this.#status !== 'idle') {
      return
    }

    if (
      (Array.isArray(message.content) && message.content.length === 0)
      || (typeof message.content === 'string' && message.content.trim() === '')
    ) {
      return
    }

    const userMessage = {
      ...message,
      role: 'user',
      id: this.#generateID(),
    } as UIMessage
    userMessage.parts = extractUIMessageParts(userMessage)

    const originalMessages = this.#messages
    this.#messages = [...originalMessages, userMessage]

    this.#status = 'loading'
    this.#error = null

    try {
      this.#abortController = new AbortController()

      await callApi(
        {
          ...this.#streamTextOptions,
          messages: [...originalMessages, userMessage],
          onFinish: () => {
            this.#status = 'idle'

            const messages = this.#messages
            this.#onFinish?.()
            this.#abortController = null
          },
          signal: this.#abortController.signal,
        },
        {
          generateID: this.#generateID,
          updatingMessage: {
            id: this.#generateID(),
            parts: [],
            role: 'assistant',
          },
          onUpdate: (message) => {
            const clonedMessage = structuredClone(message)
            const messages = this.#messages

            if (messages.at(-1)?.role === 'assistant') {
              this.#messages = messages.slice(0, -1).concat(clonedMessage)
            }
            else {
              this.#messages = messages.concat(clonedMessage)
            }
          },
        },
      )
    }
    catch (err) {
      this.#status = 'error'
      const actualError = err instanceof Error ? err : new Error(String(err))
      this.#error = actualError
      this.#abortController = null
    }
  }

  handleSubmit = async (event: SubmitEvent) => {
    if (this.#preventDefault) {
      event.preventDefault()
    }

    if (this.input.trim() === '') {
      return
    }

    await this.submitMessage({
      content: [
        {
          text: this.input,
          type: 'text',
        },
      ],
    })

    this.input = ''
  }

  stop = () => {
    if (this.#abortController) {
      this.#abortController.abort()
      this.#abortController = null
      this.#status = 'idle'
    }
  }

  reload = () => {

  }

  reset = () => {
    this.stop()
    this.#messages = this.#initialUIMessages
    this.input = ''
    this.#error = null
    this.#status = 'idle'
  }
}
