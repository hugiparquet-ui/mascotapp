console.log('StrayList montado')
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../core/config/supabase.client'
import { useGeolocation } from '../../core/hooks/useGeolocation'
import { Loader } from '../../shared/ui/Loader'
import { BackButton } from '../../shared/ui/BackButton'

interface StrayPet {
  id: string
  name: string
  species: string
  breed: string
  color: string
  image_url: string
  description: string
  created_at: string
  distance_meters?: number
  qr_code_hash: string
  profiles: {
    full_name: string
  }
}

export const StrayList = () => {
  const { coords } = useGeolocation()
  const [pets, setPets] = useState<StrayPet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!coords) {
      setLoading(false)
      return
    }
    const fetch = async () => {
      try {
        const { data, error } = await supabase.rpc('find_stray_pets_nearby', {
          user_lat: coords.latitude,
          user_lng: coords.longitude,
          max_distance_meters: 10000,
        })
        if (error) {
          console.error('Error al cargar mascotas callejeras:', error)
        } else {
          setPets(data || [])
        }
      } catch (err) {
        console.error('Error en la consulta:', err)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [coords])

  if (loading) return <Loader />

  return (
    <div className="p-4">
      <BackButton />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-brown-700">Mascotas callejeras</h1>
        <Link
          to="/stray/report"
          className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-orange-600 transition"
        >
          + Registrar
        </Link>
      </div>

      {!coords && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg mb-4">
          ⚠️ Activa el GPS para ver mascotas callejeras cercanas.
        </div>
      )}

      {pets.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">No hay mascotas callejeras reportadas cerca.</p>
      ) : (
        pets.map((p) => (
          <div key={p.id} className="bg-white rounded-xl shadow-md p-4 mb-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🐾</div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold">{p.name}</h3>
                <p className="text-sm text-gray-600">{p.species} {p.breed && `· ${p.breed}`}</p>
                {p.color && <p className="text-xs text-gray-500">Color: {p.color}</p>}
                {p.description && <p className="text-sm text-gray-600 mt-1">{p.description}</p>}
                {p.distance_meters !== undefined && (
                  <p className="text-xs text-blue-500 mt-1">📍 {Math.round(p.distance_meters)} m</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Reportado por: {p.profiles?.full_name || 'Anónimo'}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Link
                to={`/pet/${p.qr_code_hash}`}
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