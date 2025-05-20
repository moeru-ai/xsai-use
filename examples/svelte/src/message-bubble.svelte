<script lang='ts'>
  const { message, error, isError, reload } = $props()
</script>

{#snippet UIMessageTextPart(part)}
  <div>
    {part.text}
  </div>
{/snippet}

{#snippet UIMessageToolPart(part)}
  <div>
    {part.toolCall.name}
  </div>
{/snippet}

{#snippet UIMessageUnknownPart(part)}
  <div>
    Unknown message part type: {part.type}
  </div>
{/snippet}

<div
  class={[
    'chat',
    message.role === 'user' ? 'chat-end' : 'chat-start',
  ]}
>
  <div
    class={[
      'chat-bubble',
      message.role === 'user' ? 'chat-bubble-primary' : '',
      'chatBubble',
    ]}
  >

    {#each message.parts as part, index (index)}

      {#if part.type === 'text'}
        {@render UIMessageTextPart(part)}
      {:else if part.type === 'tool-call'}
        {@render UIMessageToolPart(part)}
      {:else}
        {@render UIMessageUnknownPart(part)}
      {/if}
    {/each}
    {#if isError}
      <div class='errorMessage'>
        ❌
        {error?.message}
      </div>
    {/if}
  </div>
  {#if message.role === 'user'}
    <div class='chat-footer opacity-50'>
      <button type='button' class='link' onclick={() => reload?.(message.id)}>reload from here</button>
    </div>
  {/if}
</div>

<style>
.chatBubble {
  display: flex;
  flex-direction: column;
  gap: .5rem;
}

.errorMessage {
  font-size: 12px;
}
</style>
