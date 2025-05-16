import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  './packages/react/vite.config.js',
  './examples/svelte/vite.config.js',
  './packages/svelte/vite.config.js',
  './examples/react/vite.config.js',
])
