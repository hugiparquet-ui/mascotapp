import { useState } from 'react'
import { Link } from 'react-router-dom'

// ============================================
// 1. ICONOS DE SECCIONES (con "Mis Mascotas" en la esquina)
// ============================================
const sections = [
  { to: '/map', icon: '📌', label: 'MAPA' },
  { to: '/adopt', icon: '🐶', label: 'ADOPTAR' },
  { to: '/lost/report', icon: '🚩', label: 'REPORTAR' },
  { to: '/walkers', icon: '🐕‍🦺', label: 'PASEADORES' },
  { to: '/businesses', icon: '🏥', label: 'VETERINARIAS' },
  { to: '/businesses', icon: '🏪', label: 'TIENDAS' },
  { to: '/profile', icon: '👤', label: 'PERFIL' },
  { to: '/my-pets', icon: '🐾', label: 'Mis Mascotas', colStart: 'col-start-3' },
]

// ============================================
// 2. COMPONENTE PRINCIPAL
// ============================================
export const HomePage = () => {
  const [showDonationModal, setShowDonationModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactMessage, setContactMessage] = useState('')

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Abrir cliente de correo con los datos ingresados
    const subject = `Mensaje desde MascotApp - ${contactName || 'Anónimo'}`
    const body = `Nombre: ${contactName || 'No especificado'}%0AEmail: ${contactEmail || 'No especificado'}%0A%0AMensaje:%0A${contactMessage || 'Sin mensaje'}`
    window.location.href = `mailto:hugiparquet@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setShowContactModal(false)
    // Limpiar campos
    setContactName('')
    setContactEmail('')
    setContactMessage('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100/90 to-gray-200/90 p-4 flex flex-col items-center">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center mb-10 pt-4">
          <span className="bg-gradient-to-r from-naranja-brillante to-azul-fuerte bg-clip-text text-transparent inline-block">
            MascotApp
          </span>
        </h1>

        {/* Cuadrícula de accesos */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto w-full">
          {sections.map((section, index) => (
            <Link
              key={index}
              to={section.to}
              className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 flex flex-col items-center justify-center aspect-square hover:scale-105 hover:shadow-xl transition-all duration-200 border border-white/20 ${section.colStart || ''}`}
            >
              <span className="text-5xl mb-1 block">{section.icon}</span>
              <span className="font-medium text-gray-700 text-xs text-center">{section.label}</span>
            </Link>
          ))}
        </div>

        {/* ============================================
            BOTÓN "APOYAR" CENTRADO
            ============================================ */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowDonationModal(true)}
            className="bg-azul-turquesa text-white px-5 py-2 rounded-full shadow-md hover:bg-azul-fuerte transition flex items-center gap-2 font-bold text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <span>Apoyar</span>
          </button>
        </div>

        {/* ============================================
            BOTÓN "CONTACTO" (abre modal)
            ============================================ */}
        <div className="mt-2 flex justify-center">
          <button
            onClick={() => setShowContactModal(true)}
            className="flex items-center gap-1 text-gray-500 hover:text-azul-fuerte transition text-xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <span>Contacto</span>
          </button>
        </div>
      </div>

      {/* ============================================
          MODAL DE DONACIÓN
          ============================================ */}
      {showDonationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border-2 border-azul-turquesa">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Apoyar MascotApp</h2>
              <button onClick={() => setShowDonationModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <p className="text-sm text-gray-600 mb-4">Elegí tu Método de Apoyo Preferido. ¡Gracias por Contribuir!</p>
            <div className="flex flex-col gap-3">
              <a href="https://cafecito.app/mascotapp" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-yellow-400 text-black font-bold py-3 rounded-xl hover:bg-yellow-500 transition">☕ Cafecito</a>
              <a href="https://link.mercadopago.com.ar/mascotapp" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition">💳 Mercado Pago</a>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          MODAL DE CONTACTO (NUEVO)
          ============================================ */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border-2 border-azul-turquesa">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Contactar con el Equipo</h2>
              <button onClick={() => setShowContactModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tu Nombre</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black"
                  placeholder="Opcional"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tu Correo</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black"
                  placeholder="ejemplo@gmail.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="w-full p-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black"
                  rows={4}
                  placeholder="Escribí tu mensaje acá..."
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-azul-turquesa text-white py-2 rounded-lg font-bold hover:bg-azul-fuerte transition"
              >
                Enviar Mensaje
              </button>
              <p className="text-xs text-gray-400 text-center">
                Se abrirá tu cliente de correo para completar el envío.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}