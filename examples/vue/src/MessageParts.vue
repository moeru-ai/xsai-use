<script setup lang="ts">
import type { UIMessage } from '@xsai-use/vue'
import type { DeepReadonly } from 'vue'
import MessageToolPart from './MessageToolPart.vue'

const props = defineProps<{
  parts: DeepReadonly<UIMessage['parts']>
}>()
</script>

<template>
  <div v-for="(part, index) in props.parts" :key="index">
    <div v-if="part.type === 'text'">
      {{ part.text }}
    </div>
    <template v-else-if="part.type === 'tool-call'">
      <MessageToolPart :part="part" />
    </template>
    <div v-else>
      Unknown message part type: {{ part.type }}
    </div>
  </div>
</template>
