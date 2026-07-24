import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
  const [listings, setListings] = useState<AdoptionListing[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [match, setMatch] = useState<{ match: boolean; matchId?: string } | null>(null)

  useEffect(() => {
    const fetchListings = async () => {
      try {
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
                Adoptá una Mascota
              </span>
            </h1>
            <Link
              to="/adopt/publish"
              className="bg-azul-turquesa text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-azul-fuerte transition shadow-md"
            >
              Publicar
            </Link>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              Error: {error}
            </div>
          )}

          {listings.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <p>Todavia no hay mascotas en adopción.</p>
              <p className="text-sm text-gray-400 mt-1">¡Sé el primero en publicar una!</p>
            </div>
          ) : currentIndex >= listings.length ? (
            <div className="text-center text-gray-500 mt-10">
              <p>¡Ya viste todas!</p>
              <p className="text-sm text-gray-400 mt-1">Volvé más tarde para ver nuevas mascotas.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <SwipeCard
                pet={{
                  id: listings[currentIndex].pet.id,
                  name: listings[currentIndex].pet.name,
                  image_url: listings[currentIndex].pet.image_url || '/default-pet.png',
                  species: listings[currentIndex].pet.species,
                  breed: listings[currentIndex].pet.breed || '',
                  description: listings[currentIndex].description || listings[currentIndex].title,
                }}
                onSwipe={handleSwipe}
              />
              <SwipeButtons
                onLike={() => handleSwipe('right')}
                onDislike={() => handleSwipe('left')}
              />
            </div>
          )}

          {match && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
              <div className="bg-white p-8 rounded-3xl text-center max-w-sm border-2 border-azul-turquesa">
                <h2 className="text-3xl font-bold text-naranja-brillante">¡Es un Match!</h2>
                <p className="text-sm text-gray-600 mt-2">
                  Le avisaremos a la persona que realizó la publicación. Pronto podrán contactarse.
                </p>
                <button
                  className="mt-4 px-6 py-2 bg-naranja-brillante text-white rounded-full font-bold hover:bg-naranja-suave transition"
                  onClick={() => setMatch(null)}
                >
                  ¡Genial!
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}