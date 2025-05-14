# @xsai-use/svelte

Svelte components and utilities for working with AI models. Built on top of the @xsai-use/shared package.

## Installation

```bash
npm install @xsai-use/svelte
```

## Usage

### Basic Chat Example

```svelte
<script>
  import { useChat } from '@xsai-use/svelte'

  const { messages, isLoading, input } = useChat({
    apiKey: 'your-api-key',
  })

  let message = ''

  function handleSubmit() {
    input(message)
    message = ''
  }
</script>

<div>
  {#each $messages as message}
    <div class={message.role}>
      {message.content}
    </div>
  {/each}

  <form on:submit|preventDefault={handleSubmit}>
    <input bind:value={message} />
    <button type='submit' disabled={$isLoading}>Send</button>
  </form>
</div>
```

### Complete Example

Check out the `ChatComponent.svelte` component for a complete example with error handling, message streaming indicators, and more.

## API Reference

### useChat / createChat

```typescript
const {
  messages, // Readable<Message[]> - The conversation history
  isLoading, // Readable<boolean> - Whether a request is in progress
  error, // Readable<Error | undefined> - Any error that occurred
  streamData, // Readable<Record<string, any> | undefined> - Streaming data
  input, // (input: string, options?: ChatRequest) => Promise<any> - Send a message
  stop, // () => void - Stop the current request
  reload, // () => Promise<any> - Reload the last response
  fetchChat, // (input: string, options?: FetchChatOptions) => Promise<any> - Non-streaming request
  prefetchChat, // (input: string, options?: PrefetchChatOptions) => Promise<void> - Prefetch request
  reset, // () => void - Reset the conversation
  setMessages, // (messages: Message[]) => void - Set messages directly
} = useChat({
  initialMessages, // Initial messages to populate the chat
  apiKey, // API key for authentication
  // ... other options
})
```

## Using with SvelteKit

For SvelteKit applications, you may want to initialize the chat on the client side only:

```svelte
<script>
  import { browser } from '$app/environment'
  import { useChat } from '@xsai-use/svelte'

  let chatInstance

  if (browser) {
    chatInstance = useChat({
      apiKey: 'your-api-key',
    })
  }
</script>

{#if browser && chatInstance}
  <!-- Chat UI -->
{/if}
```

## License

MIT
