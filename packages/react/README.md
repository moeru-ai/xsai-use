# @xsai-use/react

React bindings for xsAI.

This package provides a collection of React hooks for building interactive web applications with powerful features and minimal boilerplate.

## Installation

```bash
npm install @xsai-use/react
# or
yarn add @xsai-use/react
# or
pnpm add @xsai-use/react
```

## Hooks

- `useChat`: hook for building chat interfaces

### useChat

__parameter__

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Unique identifier for the chat |
| generateID? | () => string | Function to generate unique IDs for messages |
| initialMessages? | Message[] | Initial messages to populate the chat |
| onFinish? | () => void | Callback when the chat response completes |
| preventDefault? | boolean | Whether to prevent default form submission |

__return__

| Property | Type | Description |
|----------|------|-------------|
| error | Error \| null | Error object if an error occurred |
| handleInputChange | (e: React.ChangeEvent<HTMLInputElement \| HTMLTextAreaElement>) => void | Handles input changes |
| handleSubmit | (e?: React.FormEvent<HTMLFormElement>) => Promise<void> | Handles form submission |
| input | string | Current input value |
| messages | UIMessage[] | Array of messages in the conversation |
| setMessages | (messages: UIMessage[]) => void | Function to set messages manually |
| reload | (id?: string) => Promise<void> | Reloads the last chat response |
| reset | () => void | Resets the chat to initial state |
| setInput | (input: string) => void | Function to set input value |
| status | 'idle' \| 'loading' \| 'error' | Current status of the chat |
| stop | () => void | Stops the current response generation |
| submitMessage | (message: InputMessage) => Promise<void> | Submits a message programmatically |

## Usage

More examples in [examples](https://github.com/moeru-ai/xsai-use/examples/react)

### useChat

```jsx
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
    model: 'gpt-4.1',
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
        : null)}
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

MIT
