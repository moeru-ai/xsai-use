<script setup lang="ts">
import { useChat } from '@xsai-use/vue'
import { tool } from '@xsai/tool'
import { description, object, pipe, string } from 'valibot'
import { nextTick, onMounted, ref, watch } from 'vue'

import MessageBubble from './MessageBubble.vue'

interface ToolMap {
  [key: string]: Awaited<ReturnType<typeof tool>>
}

const inputRef = ref<HTMLInputElement>()
const isLoadingTools = ref(true)
const loadedTools = ref<ToolMap>({})

let {
  handleSubmit,
  handleInputChange,
  input,
  messages,
  status,
  error,
  reset,
  stop,
  reload,
} = useChat({})

onMounted(async () => {
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
          description('The location to get the weather for'),
        ),
      }),
    })
    loadedTools.value.weather = weatherTool

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
    loadedTools.value.calculator = calculatorTool

    isLoadingTools.value = false
  }
  catch (err) {
    console.error('Error loading tools:', err)
  }
  finally {
    ; ({
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
    }))
  }
})

function handleSendButtonClick(e: Event) {
  if (status.value === 'loading') {
    e.preventDefault()
    stop()
  }
  // Let the form submission handle other cases
}

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
          <span v-if="isLoadingTools" class="loading loading-infinity loading-md" />
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
          :is-error="idx === messages.length - 1 && status === 'error'"
          :error="idx === messages.length - 1 ? error : null"
          :reload="reload"
        />
      </div>

      <form class="input-container" @submit="handleSubmit">
        <div class="join" style="width: 100%;">
          <input
            ref="inputRef"
            type="text"
            class="input join-item"
            placeholder="say something..."
            style="width: 100%;"
            :value="input"
            :disabled="status !== 'idle'"
            @input="handleInputChange"
          >
          <button
            class="btn join-item"
            :type="status === 'loading' ? 'button' : 'submit'"
            @click="handleSendButtonClick"
          >
            {{ status === 'loading' ? 'Stop' : 'Send' }}
          </button>
          <button
            class="btn join-item"
            type="button"
            @click="(e) => {
              e.preventDefault()
              reset()
            }"
          >
            <span v-if="status === 'loading'" class="loading loading-dots loading-md" />
            <span v-else>Reset</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

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
