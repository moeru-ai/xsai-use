# @xsai-use/svelte

Svelte bindings for xsAI.

This package provides a collection of Svelte stores and components for building interactive web applications with powerful features and minimal boilerplate.

## Installation

```bash
npm install @xsai-use/svelte
# or
yarn add @xsai-use/svelte
# or
pnpm add @xsai-use/svelte
```

## Classes

- `Chat`: class for building chat interfaces with xsAI

### Chat

__constructor parameters__

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Unique identifier for the chat |
| generateID? | () => string | Function to generate unique IDs for messages |
| initialMessages? | Message[] | Initial messages to populate the chat |
| onFinish? | () => void | Callback when the chat response completes |
| preventDefault? | boolean | Whether to prevent default form submission |

__properties and methods__

| Property/Method | Type | Description |
|----------|------|-------------|
| error | Error \| null | Error object if an error occurred |
| handleSubmit | (e: SubmitEvent) => Promise<void> | Handles form submission |
| input | string | Current input value |
| messages | UIMessage[] | Array of messages in the conversation |
| status | 'idle' \| 'loading' \| 'error' | Current status of the chat |
| reload | (id?: string) => Promise<void> | Reloads the last chat response |
| reset | () => void | Resets the chat to initial state |
| stop | () => void | Stops the current response generation |
| submitMessage | (message: InputMessage) => Promise<void> | Submits a message programmatically |

## Usage

More examples in [examples](https://github.com/moeru-ai/xsai-use/examples/svelte)

### Chat

```svelte
<script>
  import { Chat } from '@xsai-use/svelte'

  const chat = $state(new Chat({
    id: 'simple-chat',
    preventDefault: true,
    initialMessages: [
      {
        role: 'system',
        content: 'you are a helpful assistant.',
      },
    ],
    baseURL: 'https://your-ai-provider.com/api/v1',
    model: 'openai-compatible-model',
    maxSteps: 3,
  }))
</script>

<div>
  {#each chat.messages as message, messageIndex (messageIndex)}
    <div>
      <div>{message.role}</div>
      <div>{message.content}</div>
      {#if messageIndex === chat.messages.length - 1 && chat.status === 'error'}
        <button onclick={() => chat.reload()}>Reload</button>
      {/if}
    </div>
  {/each}

  <form onsubmit={chat.handleSubmit}>
    <input
      type='text'
      placeholder='say something...'
      style='width: 100%;'
      bind:value={chat.input}
      disabled={chat.status !== 'idle'}
    />
    <button
      type={chat.status === 'loading' ? 'button' : 'submit'}
      onclick={(e) => {
        if (chat.status === 'loading') {
          e.preventDefault()
          chat.stop()
        }
      }}
    >
      {chat.status === 'loading' ? 'Stop' : 'Send'}
    </button>
    <button
      type='button'
      onclick={() => chat.reset()}
    >
      Reset
    </button>
  </form>
</div>
```

## License

MIT
