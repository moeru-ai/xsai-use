import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    svelte({
      configFile: './svelte.config.js',
      compilerOptions: {
        dev: true,
      },
    }),
  ],
})
