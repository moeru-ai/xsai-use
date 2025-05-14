<script>
  import { Chat } from '../src'

  const chat = new Chat()
</script>

<main>
  <ul>
    {#each chat.messages as message, messageIndex (messageIndex)}
      <li>
        <div>{message.role}</div>
        <div>
          {#each message.parts as part, partIndex (partIndex)}
            {#if part.type === 'text'}
              <div>{part.text}</div>
            {/if}
          {/each}
        </div>
      </li>
    {/each}
  </ul>
  <form onsubmit={chat.handleSubmit}>
    <input bind:value={chat.input} />
    <button type='submit'>Send</button>
  </form>
</main>
