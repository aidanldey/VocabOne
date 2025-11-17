import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeDatabase } from './services/storage/database'

// Initialize database on app startup
initializeDatabase()
  .then(() => {
    console.log('VocabOne app initialized successfully')
  })
  .catch((error) => {
    console.error('Failed to initialize app:', error)
    // Show error to user
    alert('Failed to initialize the app. Please try refreshing the page.')
  })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
