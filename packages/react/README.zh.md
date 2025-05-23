# @xsai-use/react

xsAI 的 React 绑定。

该包提供了一系列 React hooks，用于构建具有强大功能且最小化样板代码的交互式 Web 应用程序。

## 安装

```bash
npm install @xsai-use/react
# 或
yarn add @xsai-use/react
# 或
pnpm add @xsai-use/react
```

## Hooks

- `useChat`: 用于构建 AI 聊天界面的强大 hook

### useChat

__参数__

| 参数 | 类型 | 描述 |
|-----|------|------|
| id | string | 聊天的唯一标识符 |
| generateID? | () => string | 生成消息唯一ID的函数 |
| initialMessages? | Message[] | 初始化聊天的消息列表 |
| onFinish? | () => void | 聊天响应完成时的回调函数 |
| preventDefault? | boolean | 是否阻止默认表单提交行为 |

__返回值__

| 属性 | 类型 | 描述 |
|-----|------|------|
| error | Error \| null | 发生错误时的错误对象 |
| handleInputChange | (e: React.ChangeEvent<HTMLInputElement \| HTMLTextAreaElement>) => void | 处理输入变化的函数 |
| handleSubmit | (e?: React.FormEvent<HTMLFormElement>) => Promise<void> | 处理表单提交的函数 |
| input | string | 当前输入值 |
| messages | UIMessage[] | 对话中的消息数组 |
| setMessages | (messages: UIMessage[]) => void | 手动设置消息的函数 |
| reload | (id?: string) => Promise<void> | 重新加载最后的聊天响应 |
| reset | () => void | 将聊天重置为初始状态 |
| setInput | (input: string) => void | 设置输入值的函数 |
| status | 'idle' \| 'loading' \| 'error' | 聊天的当前状态 |
| stop | () => void | 停止当前响应生成 |
| submitMessage | (message: InputMessage) => Promise<void> | 以编程方式提交消息 |

## 使用

更多示例请查看 [examples](https://github.com/moeru-ai/xsai-use/examples/react)

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
    baseURL: 'http://localhost:11434/v1/',
    model: 'mistral-nemo-instruct-2407',
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
      <input
        type="text"
        placeholder="说点什么..."
        style={{ width: '100%' }}
        onChange={handleInputChange}
        value={input}
        disabled={status !== 'idle'}
      />
    </div>
  )
}
```

## 许可证

MIT
