# @xsai-use/svelte

xsAI 的 Svelte 绑定。

该包提供了一系列 Svelte stores 和组件，用于构建具有强大功能且最小化样板代码的交互式 Web 应用程序。

## 安装

```bash
npm install @xsai-use/svelte
# 或
yarn add @xsai-use/svelte
# 或
pnpm add @xsai-use/svelte
```

## 类

- `Chat`: 用于构建 AI 聊天界面的强大类

### Chat

__构造函数参数__

| 参数 | 类型 | 描述 |
|-----|------|------|
| id | string | 聊天的唯一标识符 |
| generateID? | () => string | 生成消息唯一ID的函数 |
| initialMessages? | Message[] | 初始化聊天的消息列表 |
| onFinish? | () => void | 聊天响应完成时的回调函数 |
| preventDefault? | boolean | 是否阻止默认表单提交行为 |

__属性和方法__

| 属性/方法 | 类型 | 描述 |
|-----|------|------|
| error | Error \| null | 发生错误时的错误对象 |
| handleSubmit | (e: SubmitEvent) => Promise<void> | 处理表单提交的函数 |
| input | string | 当前输入值 |
| messages | UIMessage[] | 对话中的消息数组 |
| status | 'idle' \| 'loading' \| 'error' | 聊天的当前状态 |
| reload | (id?: string) => Promise<void> | 重新加载最后的聊天响应 |
| reset | () => void | 将聊天重置为初始状态 |
| stop | () => void | 停止当前响应生成 |
| submitMessage | (message: InputMessage) => Promise<void> | 以编程方式提交消息 |

## 使用

更多示例请查看 [examples](https://github.com/moeru-ai/xsai-use/examples/svelte)

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
    baseURL: 'http://localhost:11434/v1/',
    model: 'mistral-nemo-instruct-2407',
    maxSteps: 3,
    toolChoice: 'auto',
  }))
</script>

<div>
  {#each chat.messages as message, messageIndex (messageIndex)}
    <div>
      <div>{message.role}</div>
      <div>{message.content}</div>
      {#if messageIndex === chat.messages.length - 1 && chat.status === 'error'}
        <button on:click={() => chat.reload()}>重新加载</button>
      {/if}
    </div>
  {/each}

  <form onsubmit={chat.handleSubmit}>
    <input
      type='text'
      placeholder='说点什么...'
      style='width: 100%;'
      bind:value={chat.input}
      disabled={chat.status !== 'idle'}
    />
    <button
      type={chat.status === 'loading' ? 'button' : 'submit'}
      on:click={(e) => {
        if (chat.status === 'loading') {
          e.preventDefault()
          chat.stop()
        }
      }}
    >
      {chat.status === 'loading' ? '停止' : '发送'}
    </button>
    <button
      type='button'
      on:click={() => chat.reset()}
    >
      重置
    </button>
  </form>
</div>
```

## 许可证

MIT
