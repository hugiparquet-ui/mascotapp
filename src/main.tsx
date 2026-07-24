import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// ============================================
// REGISTRO DEL SERVICE WORKER (solo una vez)
// ============================================
if ('serviceWorker' in navigator) {
  // Esperar a que la página esté completamente cargada
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('✅ Service Worker registrado correctamente:', reg);
        // Verificar si hay una actualización pendiente
        if (reg.waiting) {
          console.log('🔔 Hay una nueva versión del SW esperando.');
        }
      })
      .catch((err) => {
        console.error('❌ Error al registrar Service Worker:', err);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);