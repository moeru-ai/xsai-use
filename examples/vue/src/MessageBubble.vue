<script setup lang="ts">
import type { UIMessage } from '@xsai-use/vue'
import type { DeepReadonly } from 'vue'
import MessageParts from './MessageParts.vue'

interface Props {
  message: DeepReadonly<UIMessage>
  isError?: boolean
  error?: Error | null
  reload?: (id: string) => void | Promise<void>
}

const props = withDefaults(defineProps<Props>(), {
  isError: false,
  error: null,
})
</script>

<template>
  <div v-if="props.message.role === 'system'" class="flex justify-center">
    <div class="badge badge-ghost">
      <MessageParts :parts="props.message.parts" />
    </div>
  </div>

  <div v-else class="chat" :class="[props.message.role === 'user' ? 'chat-end' : 'chat-start']">
    <div
      class="chat-bubble"
      :class="[
        props.message.role === 'user' ? 'chat-bubble-primary' : '',
      ]"
    >
      <MessageParts :parts="props.message.parts" />

      <div v-if="props.isError" class="error-message">
        ❌ {{ props.error?.message }}
      </div>
    </div>

    <div v-if="props.message.role === 'user'" class="chat-footer opacity-50">
      <button
        type="button"
        class="link"
        @click="props.reload?.(props.message.id)"
      >
        reload from here
      </button>
    </div>
  </div>
</template>

<style>
.chat-bubble {
  display: flex;
  flex-direction: column;
  gap: .5rem;
}

.error-message {
  font-size: 12px;
}
</style>
