// React core imports for rendering the application
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Global styles import
import './index.css'
// Main App component
import App from './App.tsx'
import "./index.css";

// Mount the React application to the DOM root element
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
