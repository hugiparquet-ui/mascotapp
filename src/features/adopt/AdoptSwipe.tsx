import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../core/config/supabase.client'
import { SwipeCard } from './components/SwipeCard'
import { SwipeButtons } from './components/SwipeButtons'
import { Loader } from '../../shared/ui/Loader'

interface AdoptionListing {
  id: string
  title: string
  description: string
  requirements: any
  pet: {
    id: string
    name: string
    image_url: string
    species: string
    breed: string
  }
  user: {
    id: string
    full_name: string
  }
}

export const AdoptSwipe = () => {
  const [listings, setListings] = useState<AdoptionListing[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [match, setMatch] = useState<{ match: boolean; matchId?: string } | null>(null)

  useEffect(() => {
    const fetchListings = async () => {
      try {
        // ✅ Consulta directa con JOIN a pet y user (evita 406)
        const { data, error } = await supabase
          .from('adoption_listings')
          .select(`
            id,
            title,
            description,
            requirements,
            pet:pet_id ( id, name, image_url, species, breed ),
            user:user_id ( id, full_name )
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) throw error

        // ✅ Mapeo seguro: asegurar que pet y user sean objetos (no arrays)
        const formatted = (data || []).map((item: any) => ({
          ...item,
          pet: Array.isArray(item.pet) ? item.pet[0] : item.pet,
          user: Array.isArray(item.user) ? item.user[0] : item.user,
        })) as AdoptionListing[]

        setListings(formatted)
      } catch (error: any) {
        console.error('❌ Error al cargar adopciones:', error)
        setError(error.message)
        setListings([])
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [])

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (currentIndex >= listings.length) return
    const listingId = listings[currentIndex].id
    if (direction === 'right') {
      try {
        const { data, error } = await supabase.rpc('process_swipe', {
          p_listing_id: listingId,
          p_action: 'like',
        })
        if (error) throw error
        if (data?.match) setMatch({ match: true, matchId: data.match_id })
      } catch (err) {
        console.error(err)
      }
    }
    setCurrentIndex(prev => prev + 1)
  }

  if (loading) return <Loader />

  return (
    <div className="relative flex flex-col items-center justify-center h-full bg-cream-50 p-4">
      {/* ✅ Botón para publicar una mascota en adopción */}
      <div className="absolute top-2 right-2 z-10">
        <Link
          to="/adopt/publish"
          className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-orange-600 transition shadow-lg"
        >
          + Publicar
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 w-full">
          Error: {error}
        </div>
      )}

      {listings.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-500 text-lg">No hay mascotas en adopción.</p>
          <p className="text-sm text-gray-400 mt-1">
            ¡Sé el primero en publicar una!
          </p>
        </div>
      ) : currentIndex >= listings.length ? (
        <div className="text-center">
          <p className="text-gray-500 text-lg">¡Has visto todas!</p>
          <p className="text-sm text-gray-400 mt-1">Vuelve más tarde para ver nuevas mascotas.</p>
        </div>
      ) : (
        <>
          <SwipeCard
            pet={{
              id: listings[currentIndex].pet.id,
              name: listings[currentIndex].pet.name,
              image_url: listings[currentIndex].pet.image_url || '/default-pet.png',
              species: listings[currentIndex].pet.species,
              breed: listings[currentIndex].pet.breed || '',
              description: `${listings[currentIndex].title} - ${listings[currentIndex].description}`,
            }}
            onSwipe={handleSwipe}
          />
          <SwipeButtons
            onLike={() => handleSwipe('right')}
            onDislike={() => handleSwipe('left')}
          />
        </>
      )}

      {match && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-8 rounded-3xl text-center max-w-sm">
            <h2 className="text-3xl font-bold text-orange-500">¡Es un Match!</h2>
            <p className="text-sm text-gray-600 mt-2">
              El dueño también está interesado. Pronto podrán contactarse.
            </p>
            <button
              className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-full font-bold hover:bg-orange-600 transition"
              onClick={() => setMatch(null)}
            >
              ¡Genial!
            </button>
          </div>
        </div>
      )}
    </div>
  )
}