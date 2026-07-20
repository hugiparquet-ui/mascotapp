import { supabase } from '../config/supabase.client'

// ============================================
// 1. UTILIDAD: convertir clave VAPID a Uint8Array
// ============================================
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// ============================================
// 2. SUSCRIBIRSE
// ============================================
export const subscribeUser = async (): Promise<boolean> => {
  try {
    if (!('Notification' in window)) {
      alert('Este navegador no soporta notificaciones push')
      return false
    }

    let permission = Notification.permission
    if (permission === 'default') {
      permission = await Notification.requestPermission()
    }
    if (permission !== 'granted') {
      alert('Debes permitir las notificaciones para activarlas.')
      return false
    }

    const registration = await navigator.serviceWorker.ready

    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
    if (!vapidPublicKey) {
      console.error('VITE_VAPID_PUBLIC_KEY no está definida en .env.local')
      alert('Error de configuración: falta clave VAPID')
      return false
    }

    // ✅ SOLUCIÓN: forzamos el tipo con 'as any' para evitar el error de TypeScript
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as any,
    })

    const { error } = await supabase.from('push_subscriptions').insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      endpoint: subscription.endpoint,
      keys: subscription.toJSON().keys,
    })

    if (error) {
      console.error('Error guardando suscripción:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error en subscribeUser:', error)
    return false
  }
}

// ============================================
// 3. DESUSCRIBIRSE
// ============================================
export const unsubscribeUser = async (): Promise<boolean> => {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      await subscription.unsubscribe()
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', subscription.endpoint)
      return true
    }
    return false
  } catch (error) {
    console.error('Error en unsubscribeUser:', error)
    return false
  }
}

// ============================================
// 4. VERIFICAR SUSCRIPCIÓN
// ============================================
export const isUserSubscribed = async (): Promise<boolean> => {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    return !!subscription
  } catch {
    return false
  }
}