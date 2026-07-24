import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// ✅ Registrar Service Worker UNA SOLA VEZ con versión para forzar actualización
if ('serviceWorker' in navigator) {
  const swUrl = `/sw.js?v=${Date.now()}`
  navigator.serviceWorker.register(swUrl)
    .then(reg => {
      console.log('✅ SW registrado correctamente:', reg)
      if (reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' })
      }
    })
    .catch(err => console.error('❌ Error al registrar SW:', err))
}

// ✅ Usar comprobación de existencia en lugar de aserción TypeScript
const rootElement = document.getElementById('root')
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}