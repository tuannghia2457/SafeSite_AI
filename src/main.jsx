import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ensureSeeded } from './backend/seed'
import './index.css'

// Seed (or top up) the in-browser demo database before the first render.
ensureSeeded()
  .catch((err) => console.error('Demo database could not be initialised', err))
  .finally(() => {
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
