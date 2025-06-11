<script lang='ts'>
  import type { Chat, UIMessage, UIMessageTextPart, UIMessageToolCallPart } from '@xsai-use/svelte'

  interface Props {
    message: UIMessage
    error: Chat['error']
    isError: boolean
    reload: Chat['reload']
  }
  const { message, error, isError, reload }: Props = $props()
</script>

{#snippet UIMessageTextPart(part: UIMessageTextPart)}
  <div>
    {part.text}
  </div>
{/snippet}

{#snippet UIMessageToolResult(part: UIMessageToolCallPart)}
  {#if part.status === 'error' && part.error}
    <pre>
      {String(part.error)}
    </pre>
  {/if}

  {#if part.status === 'complete' && part.result}
    {@const result = part.result}
    {#if typeof result === 'string'}
      <pre>{result}</pre>
    {/if}

    {#if Array.isArray(result)}
      <div>
        {#each result as item}
          <li>
            {#if item.type === 'text'}
              <div>{item.text}</div>
            {/if}
            {#if item.type === 'image_url'}
              <img src={item.image_url.url} alt='Tool Result' style='max-width: 100%; border-radius: 4px;' />
            {/if}
            {#if item.type === 'input_audio'}
              <audio controls>
                <source src={item.input_audio.data} type={`audio/${item.input_audio.format}`} />
                Your browser does not support the audio element.
              </audio>
            {/if}
          </li>
        {/each}
      </div>
    {/if}
  {/if}

{/snippet}

{#snippet UIMessageToolPart(part: UIMessageToolCallPart)}
  {@const hasResult = part.status === 'complete' || part.status === 'error'}
  {@const isLoading = part.status === 'loading' || part.status === 'partial'}
  <div
    class="collapse collapse-arrow border {part.status === 'error' ? 'bg-red-100' : 'bg-base-100'}"
  >
    <input type='checkbox' class='tweak-collapse' />
    <div class='collapse-title font-semibold tweak-collapse tweak-collapse-title-arrow'>{part.toolCall.function.name}</div>
    <div class='collapse-content'>
      {#if isLoading}
        <div class='skeleton h-4 w-full'></div>
      {/if}
      {#if hasResult}
        <div>
          {@render UIMessageToolResult(part)}
        </div>
      {/if}
    </div>
  </div>
{/snippet}

{#snippet UIMessageUnknownPart(part: any)}
  <div>
    Unknown message part type: {part?.type}
  </div>
{/snippet}

{#snippet renderMessageParts(message: UIMessage)}
  {#each message.parts as part, index (index)}
    {#if part.type === 'text'}
      {@render UIMessageTextPart(part)}
    {:else if part.type === 'tool-call'}
      {@render UIMessageToolPart(part)}
    {:else}
      {@render UIMessageUnknownPart(part)}
    {/if}
  {/each}
{/snippet}

{#if message.role === 'system'}
  <div class='flex justify-center'>
    <div class='badge badge-ghost'>
      {@render renderMessageParts(message)}
    </div>
  </div>
{:else}
  <div class="chat {message.role === 'user' ? 'chat-end' : 'chat-start'}">
    <div class="chat-bubble {message.role === 'user' ? 'chat-bubble-primary' : ''}">
      {@render renderMessageParts(message)}
      {#if isError}
        <div class='error-message'>
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
{/if}

<style>
.chat-bubble {
  display: flex;
  flex-direction: column;
  gap: .5rem;
}

.error-message {
  font-size: 12px;
}

.tweak-collapse {
  padding-top: .5rem;
  padding-bottom: .5rem;
  min-height: 2.75rem;
}

.tweak-collapse-title-arrow:after {
  top: 1.4rem;
}
</style>
