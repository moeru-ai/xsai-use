<script setup lang="ts">
import type { UIMessageToolCallPart } from '@xsai-use/vue'
import type { DeepReadonly } from 'vue'
import { computed, defineProps } from 'vue'

const props = defineProps<{
  part: DeepReadonly<UIMessageToolCallPart>
}>()

const hasResult = computed(() => props.part.status === 'complete' || props.part.status === 'error')
const isLoading = computed(() => props.part.status === 'loading' || props.part.status === 'partial')
</script>

<template>
  <div class="collapse collapse-arrow border" :class="[props.part.status === 'error' ? 'bg-red-100' : 'bg-base-100']">
    <input type="checkbox" class="tweak-collapse">
    <div class="collapse-title font-semibold tweak-collapse-title-arrow tweak-collapse">
      {{ props.part.toolCall?.function?.name }}
    </div>
    <div class="collapse-content">
      <div v-if="isLoading" class="skeleton h-4 w-full" />
      <div v-else-if="hasResult">
        <pre v-if="props.part.status === 'error' && props.part.error">{{ String(props.part.error) }}</pre>

        <template v-if="props.part.status === 'complete' && props.part.result">
          <pre v-if="typeof props.part.result === 'string'">{{ props.part.result }}</pre>
          <div v-if="Array.isArray(props.part.result)">
            <div v-for="(item, index) in props.part.result" :key="index">
              <div v-if="item.type === 'text'">
                {{ item.text }}
              </div>
              <img v-if="item.type === 'image_url'" :src="String(item.image_url)" alt="Tool Result" style="max-width: 100%; border-radius: 4px;">
              <audio v-if="item.type === 'input_audio'" controls>
                <source :src="item.input_audio.data" :type="`audio/${item.input_audio.format}`">
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style>
.tweak-collapse-title-arrow:after {
  top: 1.4rem;
}

.tweak-collapse {
  padding-top: .5rem;
  padding-bottom: .5rem;
  min-height: 2.75rem;
}
</style>
