# xsai-use: Official UI Framework Bindings for xsAI

## Introducing xsai-use

Today, we're excited to introduce **xsai-use** - the official collection of UI framework bindings for xsAI. These libraries allow developers to seamlessly integrate xsAI's capabilities into their favorite UI frameworks, enabling rapid development of AI-powered applications with minimal effort.

## Why Framework Bindings?

While xsAI provides a powerful core for AI functionality, integrating it with modern UI frameworks requires framework-specific adaptations. xsai-use bridges this gap by offering idiomatic implementations for each supported framework, allowing you to use xsAI in a way that feels natural to your development environment.

## Supported Frameworks

xsai-use currently provides official bindings for:

- React via `@xsai-use/react`
- Svelte via `@xsai-use/svelte`

> @xsai-use/vue is planned for release following Vue 3.6, which will introduce enhanced reactivity features we intend to leverage.

Each package is designed to leverage the unique strengths of its target framework while maintaining a consistent API across implementations.

## Getting Started

Installation is straightforward with your favorite package manager:

```bash
# Using npm
npm install @xsai-use/react

# Using yarn
yarn add @xsai-use/react

# Using pnpm
pnpm add @xsai-use/react
```

## Usage Examples

With xsai-use, developing AI-powered applications becomes remarkably simple!

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
    baseURL: 'https://your-ai-provider.com/api/v1',
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

## Customization and Extension

xsai-use is designed to be extensible. Each binding provides low-level hooks that give you complete control over how xsAI integrates with your application. This makes it easy to:

- Create custom UI components around AI capabilities
- Implement specialized workflows for your specific use cases
- Integrate with other libraries in your ecosystem

## Get Started Today

Ready to add AI capabilities to your application? Install the appropriate xsai-use package for your framework and start building!
