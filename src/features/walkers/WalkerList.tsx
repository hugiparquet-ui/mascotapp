import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../core/config/supabase.client'
import { useGeolocation } from '../../core/hooks/useGeolocation'
import { Loader } from '../../shared/ui/Loader'
import { BackButton } from '../../shared/ui/BackButton'
import { RatingDisplay } from '../../shared/ui/RatingDisplay'
import { RatingForm } from '../../shared/ui/RatingForm'
import { RatingCommentsModal } from '../../shared/ui/RatingCommentsModal'
import { DonationButton } from '../../shared/ui/DonationButton'

interface Walker {
  id: string
  bio: string
  experience_years: number
  price_per_hour: number
  rating_avg: number
  distance_meters?: number
  profiles: {
    full_name: string
    avatar_url: string
    phone: string
    phone_public: boolean
  }
}

export const WalkerList = () => {
  const { coords } = useGeolocation()
  const [walkers, setWalkers] = useState<Walker[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWalkerId, setSelectedWalkerId] = useState<string | null>(null)
  const [showRatingForm, setShowRatingForm] = useState(false)
  const [showCommentsModal, setShowCommentsModal] = useState(false)

  useEffect(() => {
    if (!coords) {
      console.log('⏳ WalkerList: Esperando coordenadas...')
      setLoading(false)
      return
    }

    const fetchWalkers = async () => {
      console.log('🚀 WalkerList: Consultando paseadores con radio 50 km...')
      try {
        const { data, error } = await supabase.rpc('find_walkers_nearby', {
          user_lat: coords.latitude,
          user_lng: coords.longitude,
          max_distance_meters: 50000,
        })

        if (error) {
          console.error('❌ WalkerList: Error:', error)
          setWalkers([])
        } else {
          console.log('✅ WalkerList: Datos recibidos:', data)
          setWalkers(data || [])
        }
      } catch (err) {
        console.error('❌ WalkerList: Excepción:', err)
        setWalkers([])
      } finally {
        setLoading(false)
      }
    }

    fetchWalkers()
  }, [coords])

  if (loading) return <Loader />

  return (
    <div className="p-4">
      <BackButton />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-brown-700">Paseadores</h1>
        <Link to="/walkers/register" className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold">
          + Registrarme
        </Link>
      </div>

      {walkers.length === 0 ? (
        <p className="text-gray-500 text-center">No hay paseadores cerca.</p>
      ) : (
        walkers.map((w) => (
          <div key={w.id} className="bg-white rounded-xl shadow-md p-4 mb-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
                👤
              </div>
              <div className="flex-1">
                <h3 className="font-bold">{w.profiles?.full_name || 'Anónimo'}</h3>
                <p className="text-sm text-gray-600">{w.bio}</p>
                <div className="mt-2">
                  <RatingDisplay rating={w.rating_avg || 0} count={0} size="sm" />
                </div>
                <div className="flex flex-wrap gap-2 mt-2 text-xs">
                  <span className="bg-gray-100 px-2 py-1 rounded-full">📅 {w.experience_years} años</span>
                  <span className="bg-green-100 px-2 py-1 rounded-full">💰 ${w.price_per_hour}/hora</span>
                  {w.distance_meters !== undefined && (
                    <span className="bg-blue-100 px-2 py-1 rounded-full">📍 {Math.round(w.distance_meters)} m</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {w.profiles?.phone_public && w.profiles?.phone ? (
                <a
                  href={`https://wa.me/549${w.profiles.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-500 text-white text-center py-2 rounded-lg font-bold text-sm hover:bg-green-600 transition"
                >
                  💬 WhatsApp
                </a>
              ) : (
                <button className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg cursor-not-allowed text-sm">
                  Contacto privado
                </button>
              )}

              <button
                onClick={() => {
                  setSelectedWalkerId(w.id)
                  setShowRatingForm(true)
                }}
                className="flex-1 bg-purple-500 text-white py-2 rounded-lg font-bold text-sm hover:bg-purple-600 transition"
              >
                ⭐ Valorar
              </button>

              <button
                onClick={() => {
                  setSelectedWalkerId(w.id)
                  setShowCommentsModal(true)
                }}
                className="flex-1 bg-gray-500 text-white py-2 rounded-lg font-bold text-sm hover:bg-gray-600 transition"
              >
                💬 Ver comentarios
              </button>
            </div>

            <div className="mt-3">
              <DonationButton />
            </div>
          </div>
        ))
      )}

      {showRatingForm && selectedWalkerId && (
        <RatingForm
          targetId={selectedWalkerId}
          targetType="walker"
          onSuccess={() => {
            setShowRatingForm(false)
            window.location.reload()
          }}
          onCancel={() => setShowRatingForm(false)}
        />
      )}

      {showCommentsModal && selectedWalkerId && (
        <RatingCommentsModal
          targetId={selectedWalkerId}
          targetType="walker"
          onClose={() => setShowCommentsModal(false)}
        />
      )}
    </div>
  )
}