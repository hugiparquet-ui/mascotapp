import { useState } from 'react'
import { supabase } from '../../../core/config/supabase.client'

export const NotifyOwnerModal = ({ petId, onClose, onSuccess }: { petId: string, onClose: () => void, onSuccess: () => void }) => {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [shareLocation, setShareLocation] = useState(true)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      let lat = null, lng = null
      if (shareLocation && navigator.geolocation) {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 }))
        lat = pos.coords.latitude; lng = pos.coords.longitude
      }
      await supabase.rpc('notify_owner_scan', { p_pet_id: petId, p_finder_message: message || 'Alguien encontró a tu mascota', p_finder_phone: null, p_location_lat: lat, p_location_lng: lng })
      onSuccess()
    } catch (err: any) { setError(err.message) } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">📢 Avisar al dueño</h2>
        <textarea placeholder="Mensaje opcional" value={message} onChange={(e) => setMessage(e.target.value)} className="w-full p-3 border rounded-lg" rows={3} />
        <div className="flex items-center gap-2 mt-2"><input type="checkbox" checked={shareLocation} onChange={(e) => setShareLocation(e.target.checked)} /><label>Compartir ubicación</label></div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex gap-3 mt-4"><button onClick={onClose} className="flex-1 bg-gray-200 py-2 rounded-lg">Cancelar</button><button onClick={handleSubmit} disabled={loading} className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-bold">{loading ? 'Enviando...' : 'Enviar'}</button></div>
      </div>
    </div>
  )
}