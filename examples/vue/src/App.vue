<script setup lang="ts">
import { useChat } from '@xsai-use/vue'
import { tool } from '@xsai/tool'
import { description, object, pipe, string } from 'valibot'
import { ref, onMounted, nextTick, watch } from 'vue'

import MessageBubble from './MessageBubble.vue'

interface ToolMap {
  [key: string]: Awaited<ReturnType<typeof tool>>
}

const inputRef = ref<HTMLInputElement | null>(null)
const isLoadingTools = ref(true)
const loadedTools = ref<ToolMap>({})

// Load tools on component mount
onMounted(async () => {
  isLoadingTools.value = true
  // manually delay loading tools to simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  try {
    const weatherTool = await tool({
      description: 'Get the weather in a location',
      execute: async ({ location }) => {
        // manually delay loading tools to simulate network delay
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
          description('The location to get the weather for')
        ),
      }),
    })

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
          description('The mathematical expression to calculate')
        ),
      }),
    })

    loadedTools.value = {
      weather: weatherTool,
      calculator: calculatorTool,
    }
  } catch (err) {
    console.error('Error loading tools:', err)
  } finally {
    isLoadingTools.value = false
  }
})

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
  tools: Object.values(loadedTools.value),
})

// Handle send button click based on status
const handleSendButtonClick = (e: Event) => {
  if (status.value === 'loading') {
    e.preventDefault()
    stop()
  }
  // Let the form submission handle other cases
}

// Focus input when status changes to idle
watch(status, (newStatus) => {
  if (newStatus === 'idle' && inputRef.value) {
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
})
</script>

<template>
  <div style="display: flex; justify-content: center; padding: 20px;">
    <div class="useChat-container">
      <div class="useChat-header">
        <h2>useChat</h2>
      </div>

      <div class="chat-tools-section">
        <div class="tools-container">
          <span>Available tools:</span>
          <span v-if="isLoadingTools" class="loading loading-infinity loading-md"></span>
          <template v-else>
            <div
              v-for="toolName in Object.keys(loadedTools)"
              :key="toolName"
              class="tool-badge"
            >
              <span class="tool-icon">🔧</span>
              <span class="tool-name">{{ toolName }}</span>
            </div>
          </template>
        </div>
      </div>

      <div class="messages-container">
        <MessageBubble
          v-for="(message, idx) in messages"
          :key="message?.id || idx"
          :message="message"
          :isError="idx === messages.length - 1 && status === 'error'"
          :error="idx === messages.length - 1 ? error : null"
          :reload="reload"
        />
      </div>

      <form @submit="handleSubmit" class="input-container">
        <div class="join" style="width: 100%;">
          <input
            ref="inputRef"
            type="text"
            class="input join-item"
            placeholder="say something..."
            style="width: 100%;"
            :value="input"
            @input="handleInputChange"
            :disabled="status !== 'idle'"
          />
          <button
            class="btn join-item"
            @click="handleSendButtonClick"
            :type="status === 'loading' ? 'button' : 'submit'"
          >
            {{ status === 'loading' ? 'Stop' : 'Send' }}
          </button>
          <button
            class="btn join-item"
            @click="(e) => {
              e.preventDefault()
              reset()
            }"
            type="button"
          >
            <span v-if="status === 'loading'" class="loading loading-dots loading-md"></span>
            <span v-else>Reset</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
