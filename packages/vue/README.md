# @xsai-use/vue

Vue composables for xsAI.

This package provides a collection of Vue composables for building interactive web applications with powerful features and minimal boilerplate.

## Installation

```bash
npm install @xsai-use/vue
# or
yarn add @xsai-use/vue
# or
pnpm add @xsai-use/vue
```

## Composables

- `useChat`: composable for building chat interfaces

### useChat

**Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Unique identifier for the chat |
| generateID? | () => string | Function to generate unique IDs for messages |
| initialMessages? | Message[] | Initial messages to populate the chat |
| onFinish? | () => void | Callback when the chat response completes |
| preventDefault? | boolean | Whether to prevent default form submission |

**Returns**

| Property | Type | Description |
|----------|------|-------------|
| error | Readonly\<Ref\<Error \| null\>\> | Error object if an error occurred |
| handleInputChange | (e: Event) => void | Handles input changes |
| handleSubmit | (e?: Event) => Promise\<void\> | Handles form submission |
| input | Ref\<string\> | Current input value |
| messages | Readonly\<Ref\<UIMessage[]\>\> | Array of messages in the conversation |
| setMessages | (messages: UIMessage[]) => void | Function to set messages manually |
| reload | (id?: string) => Promise\<void\> | Reloads the last chat response |
| reset | () => void | Resets the chat to initial state |
| status | Readonly\<Ref\<'idle' \| 'loading' \| 'error'\>\> | Current status of the chat |
| stop | () => void | Stops the current response generation |
| submitMessage | (message: InputMessage) => Promise\<void\> | Submits a message programmatically |

## Usage

More examples in [examples](https://github.com/moeru-ai/xsai-use/examples/vue)

### Usage Example

```vue
<script setup lang="ts">
import { useChat } from '@xsai-use/vue'

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
</script>

<template>
  <div>
    <div
      v-for="(message, index) in messages"
      :key="message?.id || index"
    >
      <div>{{ message.role }}</div>
      <div>{{ message.content }}</div>
      <div v-if="index === messages.length - 1 && status === 'error'">
        ❌ {{ error?.message }}
        <button @click="reload()">
          Reload
        </button>
      </div>
    </div>

    <form @submit="handleSubmit">
      <input
        type="text"
        placeholder="say something..."
        :value="input"
        :disabled="status !== 'idle'"
        @input="handleInputChange"
      >
      <button
        :type="status === 'loading' ? 'button' : 'submit'"
        @click="status === 'loading' ? stop() : undefined"
      >
        {{ status === 'loading' ? 'Stop' : 'Send' }}
      </button>
      <button type="button" @click="reset">
        Reset
      </button>
    </form>
  </div>
</template>
```

## License

MIT
