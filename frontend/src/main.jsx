import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import './index.css'
import './styles/global3d.css'
import App from './App.jsx'

// Global Fetch Interceptor for production API mapping (split frontend/backend deployment)
const apiUrl = import.meta.env.VITE_API_URL;
if (apiUrl) {
  const originalFetch = window.fetch;
  window.fetch = function (input, init) {
    if (typeof input === 'string' && (input.startsWith('/api') || input.startsWith('/pdf'))) {
      input = `${apiUrl.replace(/\/$/, '')}${input}`;
    }
    return originalFetch(input, init);
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
)
