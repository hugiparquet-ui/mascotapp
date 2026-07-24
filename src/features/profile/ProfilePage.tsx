import { useState, useEffect } from 'react'
import { useAuth } from '../../core/hooks/useAuth'
import { subscribeUser, unsubscribeUser, isUserSubscribed } from '../../core/services/push.service'
import { useNavigate } from 'react-router-dom'

export const ProfilePage = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDonationModal, setShowDonationModal] = useState(false)

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        if (user) {
          const subscribed = await isUserSubscribed()
          setIsSubscribed(subscribed)
        }
      } catch (err) {
        console.error('Error al verificar suscripción:', err)
        setError('No se pudo verificar el estado de las notificaciones')
      } finally {
        setLoading(false)
      }
    }
    checkSubscription()
  }, [user])

  const handleToggleNotifications = async () => {
    setLoading(true)
    setError(null)
    try {
      if (isSubscribed) {
        const success = await unsubscribeUser()
        if (success) {
          setIsSubscribed(false)
        } else {
          setError('No se pudo desactivar las notificaciones')
        }
      } else {
        const success = await subscribeUser()
        if (success) {
          setIsSubscribed(true)
        } else {
          setError('No se pudo activar las notificaciones')
        }
      }
    } catch (err) {
      console.error('Error al cambiar suscripción:', err)
      setError('Ocurrió un error al cambiar las notificaciones')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100/90 to-gray-200/90 p-4 flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="bg-gray-100/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-azul-turquesa relative pt-12">
          {/* Botón de retroceso */}
          <button
            onClick={() => navigate('/')}
            className="absolute top-2 left-2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-naranja-brillante hover:bg-naranja-brillante hover:text-white transition-all duration-200 border border-naranja-suave/30 hover:border-naranja-brillante"
            aria-label="Volver al inicio"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h1 className="text-2xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-naranja-brillante to-azul-fuerte bg-clip-text text-transparent inline-block">
              MI PERFIL
            </span>
          </h1>

          {/* Datos del usuario */}
          <div className="mt-4 space-y-2 text-sm">
            <p>
              <strong className="bg-gradient-to-r from-naranja-brillante to-azul-fuerte bg-clip-text text-transparent">
                E-MAIL:
              </strong>{' '}
              <span className="text-gray-900 font-semibold">
                {user?.email}
              </span>
            </p>
            <p>
              <strong className="bg-gradient-to-r from-naranja-brillante to-azul-fuerte bg-clip-text text-transparent">
                NOMBRE:
              </strong>{' '}
              <span className="text-gray-900 font-semibold">
                {user?.user_metadata?.full_name || 'Sin Nombre'}
              </span>
            </p>
            <p>
              <strong className="bg-gradient-to-r from-naranja-brillante to-azul-fuerte bg-clip-text text-transparent">
                TELÉFONO:
              </strong>{' '}
              <span className="text-gray-900 font-semibold">
                {user?.user_metadata?.phone || 'No Registrado'}
              </span>
            </p>
          </div>

          {/* Notificaciones */}
          <div className="mt-4">
            <button
              onClick={handleToggleNotifications}
              disabled={loading}
              className={`w-full py-2 rounded-lg font-bold transition ${
                isSubscribed
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-azul-turquesa text-white hover:bg-azul-fuerte'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Cargando...' : isSubscribed ? '🔕 Desactivar Notificaciones' : '🔔 Activar Notificaciones'}
            </button>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            <p className="text-gray-700 text-xs text-center font-medium">
              {isSubscribed
                ? 'Recibirás Alertas.'
                : 'Activá las Notificaciones Para Recibir Alertas.'}
            </p>
          </div>

          {/* ============================================
              DONACIÓN CON MODAL (igual que HomePage)
              ============================================ */}
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowDonationModal(true)}
              className="bg-azul-turquesa text-white px-6 py-2 rounded-full shadow-md hover:bg-azul-fuerte transition flex items-center gap-2 font-bold text-sm mx-auto"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span>Apoyar</span>
            </button>
          </div>

          {/* Cerrar sesión */}
          <button
            onClick={signOut}
            className="mt-6 w-full bg-red-500 text-white py-2 rounded-full font-bold hover:bg-red-600 transition"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* ============================================
          MODAL DE DONACIÓN (idéntico al de Home)
          ============================================ */}
      {showDonationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border-2 border-azul-turquesa">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Apoyar MascotApp</h2>
              <button
                onClick={() => setShowDonationModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Elige tu método de apoyo preferido. ¡Gracias por contribuir!
            </p>
            <div className="flex flex-col gap-3">
              <a
                href="https://cafecito.app/mascotapp" // ✅ Reemplazar con tu enlace
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-yellow-400 text-black font-bold py-3 rounded-xl hover:bg-yellow-500 transition"
              >
                ☕ Cafecito
              </a>
              <a
                href="https://link.mercadopago.com.ar/mascotapp" // ✅ Reemplazar con tu enlace
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-600 transition"
              >
                💳 Mercado Pago
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}