# @xsai-use/react

xsAI 的 React 绑定。

本包为构建交互式 Web 应用程序提供了一系列 React hooks，具有强大的功能和最少的样板代码。

## 安装

```bash
npm install @xsai-use/react
# 或
yarn add @xsai-use/react
# 或
pnpm add @xsai-use/react
```

## Hooks

- `useChat`: 用于构建 AI 聊天界面的 hook

### useChat

__参数__

| 参数 | 类型 | 描述 |
|-----------|------|-------------|
| id | string | 聊天的唯一标识符 |
| generateID? | () => string | 为消息生成唯一 ID 的函数 |
| initialMessages? | Message[] | 用于填充聊天的初始消息 |
| onFinish? | () => void | 聊天响应完成时的回调 |
| preventDefault? | boolean | 是否阻止默认表单提交 |

__返回值__

| 属性 | 类型 | 描述 |
|----------|------|-------------|
| error | Error \| null | 如果发生错误，则为错误对象 |
| handleInputChange | (e: React.ChangeEvent<HTMLInputElement \| HTMLTextAreaElement>) => void | 处理输入变化 |
| handleSubmit | (e?: React.FormEvent<HTMLFormElement>) => Promise<void> | 处理表单提交 |
| input | string | 当前输入值 |
| messages | UIMessage[] | 对话中的消息数组 |
| setMessages | (messages: UIMessage[]) => void | 手动设置消息的函数 |
| reload | (id?: string) => Promise<void> | 重新加载最后的聊天响应 |
| reset | () => void | 将聊天重置为初始状态 |
| setInput | (input: string) => void | 设置输入值的函数 |
| status | 'idle' \| 'loading' \| 'error' | 聊天的当前状态 |
| stop | () => void | 停止当前响应生成 |
| submitMessage | (message: InputMessage) => Promise<void> | 以编程方式提交消息 |

## 使用方法

更多示例请参见 [examples](https://github.com/moeru-ai/xsai-use/examples/react)

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
    baseURL: 'http://url.to.your.ai/v1/',
    model: 'openai-compatible-model',
    maxSteps: 3,
    toolChoice: 'auto',
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
          placeholder="说点什么..."
          onChange={handleInputChange}
          value={input}
          disabled={status !== 'idle'}
        />
        <button type="submit">发送</button>
        <button type="button" onClick={reset}>重置</button>
      </form>
    </div>
  )
}
```

## 许可证

MIT
