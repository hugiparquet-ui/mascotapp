import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Registrar Service Worker (solo una vez, cuando la página carga)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Primero, intenta desregistrar cualquier SW antiguo para limpiar caché
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(reg => {
        console.log('Desregistrando SW antiguo:', reg)
        reg.unregister()
      })
    }).then(() => {
      // Luego registra el nuevo SW
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(reg => console.log('✅ SW registrado correctamente:', reg))
        .catch(err => console.error('❌ Error al registrar SW:', err))
    })
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)