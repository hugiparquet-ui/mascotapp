import { useState, useEffect } from 'react'
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
            pet:pet_id!inner ( id, name, image_url, species, breed ),
            user:user_id!inner ( id, full_name )
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
        if (error) throw error
        setListings((data as any || []) as AdoptionListing[])
      } catch (error) {
        console.error(error)
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
  if (!listings.length) return <div className="p-4 text-center">No hay mascotas en adopción.</div>
  if (currentIndex >= listings.length) return <div className="p-4 text-center">¡Has visto todas!</div>

  const currentPet = listings[currentIndex]
  return (
    <div className="relative flex flex-col items-center justify-center h-full bg-cream-50 p-4">
      <SwipeCard
        pet={{
          id: currentPet.pet.id,
          name: currentPet.pet.name,
          image_url: currentPet.pet.image_url || '/default-pet.png',
          species: currentPet.pet.species,
          breed: currentPet.pet.breed || '',
          description: `${currentPet.title} - ${currentPet.description}`,
        }}
        onSwipe={handleSwipe}
      />
      <SwipeButtons onLike={() => handleSwipe('right')} onDislike={() => handleSwipe('left')} />
      {match && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-8 rounded-3xl text-center">
            <h2 className="text-3xl font-bold text-orange-500">¡Es un Match!</h2>
            <button className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-full" onClick={() => setMatch(null)}>¡Genial!</button>
          </div>
        </div>
      )}
    </div>
  )
}