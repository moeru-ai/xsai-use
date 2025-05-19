<script lang='ts'>
  import { Chat } from '@xsai-use/svelte'

  const chat = new Chat({
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

  const handleSendButtonClick = (event: MouseEvent) => {
    if (chat.status === 'loading') {
      event.preventDefault()
      chat.stop()
    }
    else {
    // Let the form submission handle this case
    }
  }
</script>

<main class='chatContainer'>
  <div class='chatHeader'>
    <h2>useChat</h2>
  </div>

  <div class='chatToolsSection'>
    <div class='toolsContainer'>
      <span>Available tools:</span>
    </div>
  </div>

  <div class='messagesContainer'>
    {#each chat.messages as message, messageIndex (messageIndex)}
      <li>
        <div class='chatHeader'>{message.role}</div>
        <div class='chatBubble'>
          {#each message.parts as part, partIndex (partIndex)}
            {#if part.type === 'text'}
              <div>{part.text}</div>
            {/if}
          {/each}
        </div>
      </li>
    {/each}
  </div>

  <form on:submit={chat.handleSubmit} class='inputContainer'>
    <input bind:value={chat.input} />
    <button type='submit'>Send</button>

    <div class='join' style='width: 100%;'>
      <input
        type='text'
        class='input join-item'
        placeholder='say something...'
        style='width: 100%;'
        bind:value={chat.input}
        disabled={chat.status !== 'idle'}
      />
      <button
        class='btn join-item'
        on:click={handleSendButtonClick}
        type={chat.status === 'loading' ? 'button' : 'submit'}
      >
        {#if chat.status === 'loading'}
          <span class='loading loading-dots loading-md'></span>
        {:else}
          Send
        {/if}
      </button>
      <button
        class='btn join-item'
        on:click={(e) => {
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
</main>

<style>
  .chatBubble {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .chatHeader {
    background-color: #f0f2f5;
    border-bottom: 1px solid #ddd;
    padding: 10px 15px;
    text-align: center;
  }

  .chatContainer {
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

  .inputContainer {
    background-color: #f0f2f5;
    border-top: 1px solid #ddd;
    display: flex;
    padding: 10px;
    width: 100%;
  }

  .messagesContainer {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 10px;
    overflow-y: auto;
    padding: 15px;
  }

  .errorMessage {
    font-size: 12px;
  }

  .toolsContainer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-start;
    gap: 8px;
    min-height: 35px;
  }

  .toolBadge {
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

  .toolIcon {
    color: #495057;
    font-size: 14px;
  }

  .toolName {
    font-size: 13px;
    color: #495057;
  }

  .chatToolsSection {
    padding: 10px;
    align-content: center;
    flex-shrink: 0;
    border-bottom: 1px solid #ddd;
    background-color: #f8f9fa;
  }
</style>
