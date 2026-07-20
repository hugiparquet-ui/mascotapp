import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../core/config/supabase.client'
import { useGeolocation } from '../../core/hooks/useGeolocation'
import { Loader } from '../../shared/ui/Loader'
import { BackButton } from '../../shared/ui/BackButton'

interface Business {
  id: string
  name: string
  category: string
  address: string
  phone: string
  hours: string
  services: string[]
  image_url: string
  distance_meters?: number
}

export const BusinessList = () => {
  const { coords } = useGeolocation()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!coords) return
    const fetch = async () => {
      const { data, error } = await supabase.rpc('find_businesses_nearby', {
        user_lat: coords.latitude,
        user_lng: coords.longitude,
        max_distance_meters: 10000,
      })
      if (!error) setBusinesses(data || [])
      setLoading(false)
    }
    fetch()
  }, [coords])

  if (loading) return <Loader />
  return (
    <div className="p-4">
      <BackButton />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-brown-700">Veterinarias y Tiendas</h1>
        <Link to="/businesses/register" className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold">+ Registrar</Link>
      </div>
      {businesses.length === 0 ? <p className="text-gray-500 text-center">No hay locales cerca.</p> : (
        businesses.map(b => (
          <div key={b.id} className="bg-white rounded-xl shadow-md p-4 mb-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-3xl">
                {b.category === 'veterinaria' ? '🏥' : b.category === 'tienda' ? '🛍️' : '🐾'}
              </div>
              <div>
                <h3 className="font-bold">{b.name}</h3>
                <p className="text-sm text-gray-500">{b.category}</p>
                {b.address && <p className="text-sm text-gray-600">📍 {b.address}</p>}
                {b.hours && <p className="text-sm text-gray-500">🕐 {b.hours}</p>}
                {b.services && b.services.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {b.services.map((s, i) => <span key={i} className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">{s}</span>)}
                  </div>
                )}
                {b.distance_meters !== undefined && <p className="text-xs text-blue-500 mt-1">📍 {Math.round(b.distance_meters)} m</p>}
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              {b.phone && <a href={`https://wa.me/549${b.phone.replace(/\D/g, '')}`} target="_blank" className="flex-1 bg-green-500 text-white text-center py-2 rounded-lg font-bold text-sm">💬 Contactar</a>}
              <Link to={`/businesses/${b.id}`} className="flex-1 bg-blue-500 text-white text-center py-2 rounded-lg font-bold text-sm">Ver perfil</Link>
            </div>
          </div>
        ))
      )}
    </div>
  )
}