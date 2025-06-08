# xsAI Use

Official UI Framework Bindings for xsAI

## Getting Started

Install with your favorite package manager:

```bash
# Using npm
npm install @xsai-use/react

# Using yarn
yarn add @xsai-use/react

# Using pnpm
pnpm add @xsai-use/react
```

## Currently Supported UI Libraries

- React
  - useChat
- Svelte
  - Chat

## Usage Examples

a simple chat example with `@xsai-use/react`

```tsx
import { useChat } from '@xsai-use/react'

export function ChatComponent() {
  const {
    handleSubmit,
    handleInputChange,
    input,
    messages,
    status,
    error,
    reset,
    stop,
    reload,
  } = useChat({
    id: 'simple-chat',
    preventDefault: true,
    initialMessages: [
      {
        role: 'system',
        content: 'you are a helpful assistant.',
      },
    ],
    baseURL: 'https://api.openai.com/v1/',
    model: 'openai-compatible-model',
    maxSteps: 3,
  })

  return (
    <div>
      {messages.map((message, idx) => message
        ? (
            <ChatMessage
              key={message.id}
              message={message}
              isError={idx === messages.length - 1 && status === 'error'}
              error={idx === messages.length - 1 ? error : null}
              reload={reload}
            />
          )
        : 'null')}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="say something..."
          onChange={handleInputChange}
          value={input}
          disabled={status !== 'idle'}
        />
        <button type="submit">Send</button>
        <button type="button" onClick={reset}>Reset</button>
      </form>
    </div>
  )
}
```

## License

[MIT](LICENSE.md)
