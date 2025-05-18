import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    svelte({
      configFile: './svelte.config.js',
      compilerOptions: {
        dev: true,
      },
    }),
    tailwindcss(),
  ],
})
