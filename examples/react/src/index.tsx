import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app'
import './app.css'

// Mount the React component to a DOM element with id="app"
createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
