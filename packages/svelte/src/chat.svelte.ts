import type {
  InputMessage,
  UIMessage,
  UseChatOptions,
  UseChatStatus,
} from '@xsai-use/shared'
import {
  callApi,
  generateWeakID,
  PartParser,
} from '@xsai-use/shared'
import { untrack } from 'svelte'

export class Chat {
  readonly #options: UseChatOptions = {} as UseChatOptions
  readonly #generateID = $derived(this.#options.generateID ?? generateWeakID)
  readonly id: string = $derived(this.#options.id ?? this.#generateID())
  readonly #onFinish = $derived(this.#options.onFinish)
  readonly #preventDefault = $derived(this.#options.preventDefault ?? false)

  readonly #partParser = new PartParser()

  readonly #initialUIMessages = $derived((this.#options.initialMessages ?? []).map(m => ({
    ...m,
    id: this.#generateID(),
    parts: this.#partParser.exec(m),
  })))

  readonly #streamTextOptions: Record<string, unknown>

  #error = $state<Error>()
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

  #abortController: AbortController | undefined

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

    this.#streamTextOptions = streamTextOptions
    this.messages = this.#initialUIMessages
  }

  #request = async ({
    messages,
  }: {
    messages: UIMessage[]
  }) => {
    this.#status = 'loading'
    this.#error = undefined

    const abortController = new AbortController()

    try {
      this.#abortController = abortController

      await callApi(
        {
          ...(this.#streamTextOptions as UseChatOptions),
          messages,
          onFinish: () => {
            this.#status = 'idle'

            // eslint-disable-next-line ts/no-floating-promises
            this.#onFinish?.()
            this.#abortController = undefined
          },
          abortSignal: this.#abortController.signal,
        },
        {
          generateID: this.#generateID,
          updatingMessage: {
            id: this.#generateID(),
            parts: [],
            role: 'assistant',
          },
          onUpdate: (message) => {
            if (abortController.signal.aborted) {
              return
            }

            const clonedMessage = structuredClone(message)
            const latestMessages = untrack(() => this.messages)

            this.messages = (latestMessages.at(-1)?.role === 'assistant' ? latestMessages.slice(0, -1) : latestMessages).concat(clonedMessage)
          },
        },
      )
    }
    catch (err) {
      if (abortController.signal.aborted) {
        return
      }
      this.#status = 'error'
      const actualError = err instanceof Error ? err : new Error(String(err))
      this.#error = actualError
      this.#abortController = undefined
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
    userMessage.parts = this.#partParser.exec(userMessage)

    this.messages = this.messages.concat(userMessage)

    await this.#request({
      messages: untrack(() => $state.snapshot(this.messages)),
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
      this.#abortController = undefined
      this.#status = 'idle'
    }
  }

  reload = async (id?: string) => {
    if (this.#status === 'loading') {
      return
    }

    if (this.messages.length === 0) {
      return
    }

    let msgIdx = this.messages.findLastIndex(m => m.role === 'user' && (id === undefined || m.id === id))
    if (msgIdx === -1) {
      msgIdx = this.messages.findLastIndex(m => m.role === 'user')
    }
    // still not found, return
    if (msgIdx === -1) {
      return
    }

    const newMessages = untrack(() => this.messages.slice(0, msgIdx + 1))
    this.messages = newMessages

    await this.#request({
      messages: $state.snapshot(newMessages),
    })
  }

  reset = () => {
    this.stop()
    this.messages = this.#initialUIMessages
    this.input = ''
    this.#error = undefined
    this.#status = 'idle'
  }
}
