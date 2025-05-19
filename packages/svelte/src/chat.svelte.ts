import type {
  InputMessage,
  UIMessage,
  UseChatOptions,
  UseChatStatus,
} from '@xsai-use/shared'
import {
  callApi,
  extractUIMessageParts,
  generateWeakID,
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
      id,
      generateID,
      initialMessages,
      onFinish,
      preventDefault,
      ...streamTextOptions
    } = this.#options

    this.#streamTextOptions = $derived(streamTextOptions)
  }

  #request = async ({
    messages,
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

            // eslint-disable-next-line ts/no-floating-promises
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

    this.#messages = [...this.#messages, userMessage]

    await this.#request({
      messages: this.#messages,
    })
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

  reload = async (id?: string) => {
    if (this.#status !== 'idle') {
      return
    }

    if (this.#messages.length === 0) {
      return
    }

    let msgIdx = this.#messages.findLastIndex(m => m.role === 'user' && (id === undefined || m.id === id))
    if (msgIdx === -1) {
      msgIdx = this.#messages.findLastIndex(m => m.role === 'user')
    }
    // still not found, return
    if (msgIdx === -1) {
      return
    }

    await this.#request({
      messages: this.#messages.slice(0, msgIdx + 1),
    })
  }

  reset = () => {
    this.stop()
    this.#messages = this.#initialUIMessages
    this.input = ''
    this.#error = null
    this.#status = 'idle'
  }
}
