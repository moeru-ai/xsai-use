import { mount } from 'svelte'
import App from './app.svelte'
import './index.css'

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
