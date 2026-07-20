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
  profiles: {
    full_name: string
    avatar_url: string
  }
}

export const BusinessList = () => {
  const { coords } = useGeolocation()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!coords) {
      console.log('⏳ BusinessList: Esperando coordenadas...')
      setLoading(false)
      return
    }

    const fetchBusinesses = async () => {
      console.log('🚀 BusinessList: Consultando negocios con radio 50 km...')
      const { data, error } = await supabase.rpc('find_businesses_nearby', {
        user_lat: coords.latitude,
        user_lng: coords.longitude,
        max_distance_meters: 50000,
      })

      if (error) {
        console.error('❌ BusinessList: Error al cargar negocios:', error)
      } else {
        console.log('✅ BusinessList: Datos recibidos:', data)
        setBusinesses(data || [])
      }
      setLoading(false)
    }

    fetchBusinesses()
  }, [coords])

  if (loading) return <Loader />

  const getCategoryEmoji = (category: string) => {
    const map: Record<string, string> = {
      veterinaria: '🏥',
      tienda: '🛍️',
      petshop: '🐾'
    }
    return map[category] || '🏪'
  }

  return (
    <div className="p-4">
      <BackButton />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-brown-700">Veterinarias y Tiendas</h1>
        <Link
          to="/businesses/register"
          className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-orange-600 transition"
        >
          + Registrar local
        </Link>
      </div>

      {businesses.length === 0 ? (
        <p className="text-gray-500 text-center">No hay locales registrados cerca.</p>
      ) : (
        businesses.map((business) => (
          <div key={business.id} className="bg-white rounded-xl shadow-md p-4 mb-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                {business.image_url ? (
                  <img src={business.image_url} alt={business.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">
                    {getCategoryEmoji(business.category)}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{business.name}</h3>
                <p className="text-sm text-gray-500">{business.category}</p>
                {business.address && <p className="text-sm text-gray-600">📍 {business.address}</p>}
                {business.hours && <p className="text-sm text-gray-500">🕐 {business.hours}</p>}
                {business.services && business.services.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {business.services.map((s, i) => (
                      <span key={i} className="bg-gray-100 px-2 py-0.5 rounded-full text-xs">{s}</span>
                    ))}
                  </div>
                )}
                {business.distance_meters !== undefined && (
                  <p className="text-xs text-blue-500 mt-1">📍 {Math.round(business.distance_meters)} m</p>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              {business.phone && (
                <a
                  href={`https://wa.me/549${business.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-500 text-white text-center py-2 rounded-lg font-bold text-sm hover:bg-green-600 transition"
                >
                  💬 Contactar
                </a>
              )}
              <Link
                to={`/businesses/${business.id}`}
                className="flex-1 bg-blue-500 text-white text-center py-2 rounded-lg font-bold text-sm hover:bg-blue-600 transition"
              >
                Ver perfil
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  )
}