import { useState, useEffect } from 'react'
import { useAuth } from '../../core/hooks/useAuth'
import { DonationButton } from '../../shared/ui/DonationButton'
import { subscribeUser, unsubscribeUser, isUserSubscribed } from '../../core/services/push.service'

export const ProfilePage = () => {
  const { user, signOut } = useAuth()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const sendTestNotification = async () => {
    if (!user?.id) {
      alert('Usuario no identificado para enviar la notificación.')
      return
    }

    try {
      const response = await fetch(
  'https://nadrsaptnpihqnuxotty.supabase.co/functions/v1/push', // 🔴 Usa la URL exacta de tu Edge Function
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      userId: user.id,
      title: '🔔 Notificación de prueba',
      body: '¡Esta es una notificación de prueba desde la Edge Function!',
      url: '/',
    }),
  }
);

      const result = await response.json()
      console.log('Resultado del envío:', result)
      alert('Notificación enviada. Revisa la consola para detalles.')
    } catch (err: any) {
      console.error(err)
      alert('Error al enviar: ' + (err?.message ?? err))
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold">Mi Perfil</h1>
      <div className="mt-4 space-y-2">
        <p><strong>Email:</strong> {user?.email}</p>
        <p><strong>Nombre:</strong> {user?.user_metadata?.full_name || 'Sin nombre'}</p>
        <p><strong>Teléfono:</strong> {user?.user_metadata?.phone || 'No registrado'}</p>
      </div>

      {/* Botón para notificaciones */}
      <div className="mt-4">
        <button
          onClick={handleToggleNotifications}
          disabled={loading}
          className={`w-full py-2 rounded-lg font-bold transition ${
            isSubscribed
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading
            ? 'Cargando...'
            : isSubscribed
            ? '🔕 Desactivar notificaciones'
            : '🔔 Activar notificaciones'}
        </button>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        <p className="text-xs text-gray-400 mt-1">
          {isSubscribed
            ? 'Recibirás alertas de pérdidas cercanas, matches y avisos de tu mascota.'
            : 'Activa las notificaciones para recibir alertas importantes.'}
        </p>
      </div>

      {/* ✅ BOTÓN DE PRUEBA DE NOTIFICACIONES */}
      <div className="mt-4">
        <button
          onClick={sendTestNotification}
          className="w-full bg-green-500 text-white py-2 rounded-lg font-bold hover:bg-green-600 transition"
        >
          📨 Enviar notificación de prueba
        </button>
        <p className="text-xs text-gray-400 mt-1">
          Usa este botón para probar que las notificaciones funcionan correctamente.
        </p>
      </div>

      <div className="mt-6 flex justify-center">
        <DonationButton />
      </div>

      <button
        onClick={signOut}
        className="mt-6 w-full bg-red-500 text-white py-2 rounded-full"
      >
        Cerrar sesión
      </button>
    </div>
  )
}