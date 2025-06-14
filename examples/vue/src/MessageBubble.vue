<script setup lang="ts">
import type { UIMessage } from '@xsai-use/vue'

interface Props {
  message: UIMessage
  isError?: boolean
  error?: Error | null
  reload?: (id: string) => void | Promise<void>
}

const props = withDefaults(defineProps<Props>(), {
  isError: false,
  error: null
})

// Helper function to check if part is a tool call
const isToolCallPart = (part: any): part is any => {
  return part.type === 'tool-call'
}

// Helper function to safely get tool call properties
const getToolCallPart = (part: any) => {
  return isToolCallPart(part) ? part : null
}
</script>

<template>
  <div v-if="props.message.role === 'system'" class="flex justify-center">
    <div class="badge badge-ghost">
      <div v-for="(part, index) in props.message.parts" :key="index">
        <div v-if="part.type === 'text'">
          {{ part.text }}
        </div>
        <div v-else>
          Unknown message part type: {{ part.type }}
        </div>
      </div>
    </div>
  </div>

  <div v-else :class="['chat', props.message.role === 'user' ? 'chat-end' : 'chat-start']">
    <div :class="[
      'chat-bubble',
      props.message.role === 'user' ? 'chat-bubble-primary' : ''
    ]">
      <div v-for="(part, index) in props.message.parts" :key="index">
        <!-- Text Part -->
        <div v-if="part.type === 'text'">
          {{ part.text }}
        </div>

        <!-- Tool Call Part -->
        <div
          v-else-if="part.type === 'tool-call'"
          :class="[
            'collapse',
            'collapse-arrow',
            'border',
            getToolCallPart(part)?.status === 'error' ? 'bg-red-100' : 'bg-base-100'
          ]"
        >
          <input type="checkbox" class="tweak-collapse" />
          <div class="collapse-title font-semibold tweak-collapse-title-arrow tweak-collapse">
            {{ getToolCallPart(part)?.toolCall?.function?.name }}
          </div>
          <div class="collapse-content">
            <!-- Loading State -->
            <div
              v-if="getToolCallPart(part)?.status === 'loading' || getToolCallPart(part)?.status === 'partial'"
              class="skeleton h-4 w-full"
            ></div>

            <!-- Result State -->
            <div v-if="getToolCallPart(part)?.status === 'complete' || getToolCallPart(part)?.status === 'error'">
              <!-- Error Result -->
              <pre v-if="getToolCallPart(part)?.status === 'error' && getToolCallPart(part)?.error">{{ String(getToolCallPart(part)?.error) }}</pre>

              <!-- Success Result -->
              <template v-if="getToolCallPart(part)?.status === 'complete' && getToolCallPart(part)?.result">
                <!-- String Result -->
                <pre v-if="typeof getToolCallPart(part)?.result === 'string'">{{ getToolCallPart(part)?.result }}</pre>

                <!-- Array Result -->
                <div v-else-if="Array.isArray(getToolCallPart(part)?.result)">
                  <div v-for="(item, itemIndex) in getToolCallPart(part)?.result" :key="itemIndex">
                    <div v-if="typeof item === 'object' && item?.type === 'text'">
                      {{ String(item) }}
                    </div>
                    <img
                      v-else-if="typeof item === 'object' && item?.type === 'image_url'"
                      :src="String(item?.image_url)"
                      alt="Tool Result"
                      style="max-width: 100%; border-radius: 4px;"
                    />
                    <audio
                      v-else-if="typeof item === 'object' && item?.type === 'input_audio'"
                      controls
                    >
                      <source :src="item?.input_audio?.data" :type="`audio/${item?.input_audio?.format}`" />
                      Your browser does not support the audio element.
                    </audio>
                    <div v-else>{{ String(item) }}</div>
                  </div>
                </div>

                <!-- Other Result Types -->
                <div v-else>{{ String(getToolCallPart(part)?.result) }}</div>
              </template>
            </div>
          </div>
        </div>

        <!-- Unknown Part -->
        <div v-else>
          Unknown message part type: {{ part.type }}
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="props.isError" class="error-message">
        ❌ {{ props.error?.message }}
      </div>
    </div>

    <!-- Reload Button for User Messages -->
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
