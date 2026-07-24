import { useState, useEffect } from 'react'
import { useAuth } from '../../core/hooks/useAuth'
import { subscribeUser, unsubscribeUser, isUserSubscribed } from '../../core/services/push.service'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../core/config/supabase.client'

export const ProfilePage = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDonationModal, setShowDonationModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')

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

  // Cargar datos actuales para el formulario de edición
  useEffect(() => {
    if (user) {
      setEditName(user.user_metadata?.full_name || '')
      setEditPhone(user.user_metadata?.phone || '')
    }
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

  // ✅ Guardar cambios del perfil
  const handleSaveProfile = async () => {
    setEditLoading(true)
    setEditError('')
    try {
      // 1. Actualizar en auth.users (metadatos)
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: editName.trim(),
          phone: editPhone.trim(),
        },
      })
      if (updateError) throw updateError

      // 2. Actualizar en profiles (para mantener consistencia)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: editName.trim(),
          phone: editPhone.trim(),
        })
        .eq('id', user.id)
      if (profileError) throw profileError

      // 3. Recargar la página para reflejar los cambios
      alert('✅ Perfil actualizado correctamente.')
      window.location.reload()
    } catch (err: any) {
      setEditError(err.message || 'Error al guardar los cambios')
    } finally {
      setEditLoading(false)
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

          {/* ✅ Botón de edición (engranaje) en la esquina superior derecha */}
          <button
            onClick={() => setShowEditModal(true)}
            className="absolute top-2 right-2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-400 hover:text-azul-fuerte transition border border-gray-200 hover:border-azul-turquesa"
            aria-label="Editar perfil"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"
              />
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

          {/* Donación */}
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
          MODAL DE DONACIÓN
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
                href="https://cafecito.app/mascotapp"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-yellow-400 text-black font-bold py-3 rounded-xl hover:bg-yellow-500 transition"
              >
                ☕ Cafecito
              </a>
              <a
                href="https://link.mercadopago.com.ar/mascotapp"
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

      {/* ============================================
          MODAL DE EDICIÓN DE PERFIL
          ============================================ */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border-2 border-azul-turquesa">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Editar Perfil</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Actualiza tu nombre y teléfono de contacto.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSaveProfile()
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black transition"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black transition"
                  placeholder="Ej: 3777-123456"
                />
              </div>
              {editError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg text-sm">
                  {editError}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 bg-azul-turquesa text-white py-2 rounded-lg font-bold hover:bg-azul-fuerte transition disabled:opacity-50"
                >
                  {editLoading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}