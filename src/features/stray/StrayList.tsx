import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../core/config/supabase.client'
import { useGeolocation } from '../../core/hooks/useGeolocation'
import { useAuth } from '../../core/hooks/useAuth'
import { Loader } from '../../shared/ui/Loader'

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
  reporter_id: string
  profiles: {
    full_name: string
  }
}

export const StrayList = () => {
  const { user } = useAuth()
  const { coords } = useGeolocation()
  const navigate = useNavigate()
  const [pets, setPets] = useState<StrayPet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!coords) {
      setLoading(false)
      return
    }

    const fetchStrayPets = async () => {
      try {
        const { data, error } = await supabase.rpc('find_stray_pets_nearby', {
          user_lat: coords.latitude,
          user_lng: coords.longitude,
          max_distance_meters: 10000,
        })

        if (error) throw error

        setPets(data || [])
      } catch (err: any) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStrayPets()
  }, [coords])

  if (loading) return <Loader />

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100/90 to-gray-200/90 p-4 flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="bg-gray-100/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-azul-turquesa relative pt-12">
          {/* ✅ Botón de retroceso dentro del cuadro */}
          <button
            onClick={() => navigate('/')}
            className="absolute top-2 left-2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-naranja-brillante hover:bg-naranja-brillante hover:text-white transition-all duration-200 border border-naranja-suave/30 hover:border-naranja-brillante"
            aria-label="Volver al inicio"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-naranja-brillante to-azul-fuerte bg-clip-text text-transparent inline-block">
                Comunitarios
              </span>
            </h1>
            <Link
              to="/stray/report"
              className="bg-azul-turquesa text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-azul-fuerte transition shadow-md"
            >
              Agregar
            </Link>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              Error: {error}
            </div>
          )}

          {!coords && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg mb-4">
              ⚠️ Activá el GPS para ver Comunitarios Cercanos.
            </div>
          )}

          {pets.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <p>No hay Comunitarios Agregados Cerca.</p>
              <p className="text-sm text-gray-400">(Radio de búsqueda: 10 km)</p>
            </div>
          ) : (
            pets.map((p) => (
              <div key={p.id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 mb-4 border-2 border-azul-turquesa relative">
                {/* Botón de edición (solo reportero) */}
                {user && p.reporter_id === user.id && (
                  <Link
                    to="/stray/report"
                    className="absolute top-2 right-2 text-gray-400 hover:text-azul-fuerte transition"
                    title="Editar reporte"
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
                  </Link>
                )}

                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 border-2 border-azul-turquesa">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🐾</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{p.name}</h3>
                    <p className="text-sm text-gray-500">{p.species} {p.breed && `· ${p.breed}`}</p>
                    {p.color && <p className="text-xs text-gray-500">Color: {p.color}</p>}
                    {p.description && <p className="text-sm text-gray-600 mt-1">{p.description}</p>}
                    {p.distance_meters !== undefined && (
                      <p className="text-xs text-blue-500 mt-1">📍 {Math.round(p.distance_meters)} m</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Agregado por: {p.profiles?.full_name || 'Anónimo'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <Link
                    to={`/pet/${p.qr_code_hash}`}
                    className="flex-1 bg-azul-fuerte text-white text-center py-2 rounded-lg font-bold text-sm hover:bg-azul-turquesa transition"
                  >
                    Ver Perfil
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}