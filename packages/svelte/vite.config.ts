import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    svelte({
      /* plugin options */
    }),
  ],
  test: {
    coverage: {
      exclude: ['node_modules/'],
      reporter: ['text', 'json', 'html'],
    },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,ts}', 'test/**/*.{test,spec}.{js,ts}'],
  },
})
