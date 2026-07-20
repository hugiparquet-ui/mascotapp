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
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!coords) {
      console.log('⏳ StrayList: Esperando coordenadas...')
      setLoading(false)
      return
    }

    const fetchStrayPets = async () => {
      console.log('🚀 StrayList: Consultando mascotas callejeras con radio 50 km...')
      console.log('📍 Coordenadas:', coords.latitude, coords.longitude)
      try {
        const { data, error } = await supabase
  .from('stray_reports')
  .select(`
    id,
    description,
    created_at,
    pet:pet_id ( id, name, image_url, species, breed, color, qr_code_hash ),
    profiles ( full_name )
  `)
  .limit(20)

        if (error) {
          console.error('❌ StrayList: Error en RPC:', error)
          setError(error.message)
          setPets([])
        } else {
          console.log('✅ StrayList: Datos recibidos:', data)
          // Map Supabase response shape to StrayPet[] expected by component
          const mapped: StrayPet[] = (data || []).map((item: any) => {
            const pet = Array.isArray(item.pet) ? item.pet[0] : item.pet
            const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
            return {
              id: item.id,
              name: pet?.name || 'Sin nombre',
              species: pet?.species || '',
              breed: pet?.breed || '',
              color: pet?.color || '',
              image_url: pet?.image_url || '',
              description: item.description || pet?.description || '',
              created_at: item.created_at,
              qr_code_hash: pet?.qr_code_hash || pet?.id || '',
              profiles: {
                full_name: profile?.full_name || 'Anónimo',
              },
            }
          })
          setPets(mapped)
          if (data && data.length > 0) {
            console.log('📊 Primera mascota callejera:', data[0])
          }
        }
      } catch (err: any) {
        console.error('❌ StrayList: Excepción:', err)
        setError(err.message)
        setPets([])
      } finally {
        setLoading(false)
      }
    }

    fetchStrayPets()
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

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          Error: {error}
        </div>
      )}

      {!coords && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg mb-4">
          ⚠️ Activa el GPS para ver mascotas callejeras cercanas.
        </div>
      )}

      {pets.length === 0 ? (
        <div className="text-center text-gray-500 mt-10">
          <p>No hay mascotas callejeras reportadas cerca.</p>
          <p className="text-sm text-gray-400">(Radio de búsqueda: 50 km)</p>
        </div>
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