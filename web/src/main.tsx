import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ToastProvider } from './components/Toast'
import './index.css'

// Modo liviano: PCs de bajos recursos (2 nucleos o <=4GB RAM) sin animaciones ni glass
if (
  (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 2) ||
  (typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4)
) {
  document.documentElement.classList.add('lite')
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
)