<script lang='ts'>
  import type { Attachment } from 'svelte/attachments'
  import { Chat } from '@xsai-use/svelte'
  import { tool } from '@xsai/tool'
  import { description, object, pipe, string } from 'valibot'

  import MessageBubble from './message-bubble.svelte'

  let chat = $state(new Chat({}))
  let inputElement: HTMLInputElement | null = null

  const handleSendButtonClick = (event: MouseEvent) => {
    if (chat.status === 'loading') {
      event.preventDefault()
      chat.stop()
    }
    else {
    // Let the form submission handle this case
    }
  }

  let isLoaded = $state(false)
  const tools = []

  const loadTools: Attachment = async () => {
    try {
      const weatherTool = await tool({
        description: 'Get the weather in a location',
        execute: async ({ location }) => {
          await new Promise(resolve => setTimeout(resolve, 2000))
          if (Math.random() > 0.5) {
            throw new Error('Weather API error')
          }
          return {
            location,
            temperature: 10,
          }
        },
        name: 'weather',
        parameters: object({
          location: pipe(
            string(),
            description('The location to get the weather for'),
          ),
        }),
      })
      tools.push('weather')

      const calculatorTool = await tool({
        description: 'Calculate mathematical expression',
        execute: ({ expression }) => ({
          // eslint-disable-next-line no-eval
          result: eval(expression),
        }),
        name: 'calculator',
        parameters: object({
          expression: pipe(
            string(),
            description('The mathematical expression to calculate'),
          ),
        }),
      })
      tools.push('calculator')

      chat = new Chat({
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
        tools: [weatherTool, calculatorTool],
      })

      isLoaded = true
    }
    catch (err) {
      console.error('Error loading tools:', err)
    }

    return () => {}
  }

  $effect(() => {
    if (chat.status === 'idle' && inputElement) {
      inputElement.focus()
    }
  })
</script>

<main style='display: flex; justify-content: center; padding: 20px;' {@attach loadTools}>
  <div class='useChat-container'>
    <div class='useChat-header'>
      <h2>useChat</h2>
    </div>

    <div class='chat-tools-section'>
      <div class='tools-container'>
        <span>Available tools:</span>
        {#if isLoaded}
          {#each tools as tool}
            <div class='tool-badge'>
              <span class='tool-icon'>🔧</span>
              <span class='tool-name'>{tool}</span>
            </div>
          {/each}
        {:else}
          <span class='loading loading-infinity loading-md'></span>
        {/if}
      </div>
    </div>

    <div class='messages-container'>
      {#each chat.messages as message, messageIndex (messageIndex)}
        <MessageBubble
          {message}
          isError={messageIndex === chat.messages.length - 1 && chat.status === 'error'}
          error={messageIndex === chat.messages.length - 1 ? chat.error : null}
          reload={chat.reload}
        />
      {/each}
    </div>

    <form onsubmit={chat.handleSubmit} class='input-container'>
      <div class='join' style='width: 100%;'>
        <input
          type='text'
          class='input join-item'
          placeholder='say something...'
          style='width: 100%;'
          bind:value={chat.input}
          bind:this={inputElement}
          disabled={chat.status !== 'idle'}
        />
        <button
          class='btn join-item'
          onclick={handleSendButtonClick}
          type={chat.status === 'loading' ? 'button' : 'submit'}
        >
          {#if chat.status === 'loading'}
            Stop
          {:else}
            Send
          {/if}
        </button>
        <button
          class='btn join-item'
          onclick={(e) => {
            e.preventDefault()
            chat.reset()
          }}
          type='button'
        >
          {#if chat.status === 'loading'}
            <span class='loading loading-dots loading-md'></span>
          {:else}
            Reset
          {/if}
        </button>
      </div>
    </form>
  </div>
</main>

<style>
.useChat-header {
  background-color: #f0f2f5;
  border-bottom: 1px solid #ddd;
  padding: 10px 15px;
  text-align: center;
}

.useChat-container {
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  font-family: Arial, sans-serif;
  height: 90vh;
  overflow: hidden;
  width: 600px;
}

.input-container {
  background-color: #f0f2f5;
  border-top: 1px solid #ddd;
  display: flex;
  padding: 10px;
  width: 100%;
}

.messages-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  padding: 15px;
}

.tools-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  min-height: 35px;
}

.tool-badge {
  background-color: #e9ecef;
  border-radius: 16px;
  padding: 6px 12px;
  font-size: 13px;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #dee2e6;
}

.tool-icon {
  color: #495057;
  font-size: 14px;
}

.tool-name {
  font-size: 13px;
  color: #495057;
}

.chat-tools-section {
  padding: 10px;
  align-content: center;
  flex-shrink: 0;
  border-bottom: 1px solid #ddd;
  background-color: #f8f9fa;
}
</style>
