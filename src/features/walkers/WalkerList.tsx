import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../core/config/supabase.client'
import { useAuth } from '../../core/hooks/useAuth'
import { useGeolocation } from '../../core/hooks/useGeolocation'
import { Loader } from '../../shared/ui/Loader'
import { RatingDisplay } from '../../shared/ui/RatingDisplay'
import { RatingForm } from '../../shared/ui/RatingForm'
import { RatingCommentsModal } from '../../shared/ui/RatingCommentsModal'

interface Walker {
  id: string
  user_id: string
  bio: string
  experience_years: number
  price_per_hour: number
  rating_avg: number
  distance_meters?: number
  avatar_url?: string
  profiles: {
    full_name: string
    avatar_url: string
    phone: string
    phone_public: boolean
  }
}

export const WalkerList = () => {
  const { user } = useAuth()
  const { coords } = useGeolocation()
  const navigate = useNavigate()
  const [walkers, setWalkers] = useState<Walker[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedWalkerId, setSelectedWalkerId] = useState<string | null>(null)
  const [showRatingForm, setShowRatingForm] = useState(false)
  const [showCommentsModal, setShowCommentsModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!coords) {
      setLoading(false)
      return
    }

    const fetchWalkers = async () => {
      try {
        const { data, error } = await supabase
          .from('walkers')
          .select(`
            id,
            user_id,
            bio,
            experience_years,
            price_per_hour,
            rating_avg,
            avatar_url,
            profiles ( full_name, phone, phone_public )
          `)
          .eq('is_active', true)
          .limit(20)

        if (error) throw error

        const formatted = (data || []).map((item: any) => ({
          ...item,
          profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
        }))
        setWalkers(formatted)
      } catch (err: any) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchWalkers()
  }, [coords])

  const handleRatingSuccess = () => {
    setShowRatingForm(false)
    window.location.reload()
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
                PASEADORES
              </span>
            </h1>
            <Link
              to="/walkers/register"
              className="bg-azul-turquesa text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-azul-fuerte transition shadow-md"
            >
              Registrarme
            </Link>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              Error: {error}
            </div>
          )}

          {walkers.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <p>No hay paseadores cerca.</p>
              <p className="text-sm text-gray-400">(Radio de búsqueda: 50 km)</p>
            </div>
          ) : (
            walkers.map((w) => {
              const isOwner = user?.id === w.user_id

              return (
                <div key={w.id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 mb-4 border-2 border-azul-turquesa relative">
                  {/* ⚙️ Icono de edición (solo para el dueño) */}
                  {isOwner && (
                    <Link
                      to="/walkers/register"
                      className="absolute top-2 right-2 bg-white/80 rounded-full p-1.5 shadow-md hover:bg-gray-100 transition border border-azul-turquesa"
                      title="Editar perfil"
                    >
                      <svg
                        className="w-5 h-5 text-azul-turquesa hover:text-azul-fuerte"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </Link>
                  )}

                  <div className="flex items-start gap-4">
                    {/* Foto de perfil circular */}
                    <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border-2 border-azul-turquesa">
                      {w.avatar_url ? (
                        <img src={w.avatar_url} alt={w.profiles?.full_name || 'Paseador'} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
                          👤
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-base">{w.profiles?.full_name || 'Anónimo'}</h3>
                      <p className="text-sm text-gray-600">{w.bio}</p>
                      <div className="mt-1">
                        <RatingDisplay rating={w.rating_avg || 0} count={0} size="sm" />
                      </div>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-600">
                        <span className="bg-gray-100 px-2 py-0.5 rounded-full">📅 {w.experience_years} años</span>
                        <span className="bg-green-100 px-2 py-0.5 rounded-full">💰 ${w.price_per_hour}/hora</span>
                        {w.distance_meters !== undefined && (
                          <span className="bg-blue-100 px-2 py-0.5 rounded-full">📍 {Math.round(w.distance_meters)} m</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ✅ Botones más compactos */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {w.profiles?.phone_public && w.profiles?.phone ? (
                      <a
                        href={`https://wa.me/549${w.profiles.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-green-500 text-white text-center py-1.5 rounded-lg font-bold text-xs hover:bg-green-600 transition"
                      >
                        💬 WhatsApp
                      </a>
                    ) : (
                      <button className="flex-1 bg-gray-300 text-gray-700 py-1.5 rounded-lg cursor-not-allowed text-xs">
                        Contacto
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedWalkerId(w.id)
                        setShowRatingForm(true)
                      }}
                      className="flex-1 bg-naranja-brillante text-white py-1.5 rounded-lg font-bold text-xs hover:bg-naranja-suave transition"
                    >
                      ⭐ Valorar
                    </button>

                    <button
                      onClick={() => {
                        setSelectedWalkerId(w.id)
                        setShowCommentsModal(true)
                      }}
                      className="flex-1 bg-azul-fuerte text-white py-1.5 rounded-lg font-bold text-xs hover:bg-azul-turquesa transition"
                    >
                      💬 Comentarios
                    </button>
                  </div>
                </div>
              )
            })
          )}

          {showRatingForm && selectedWalkerId && (
            <RatingForm
              targetId={selectedWalkerId}
              targetType="walker"
              onSuccess={handleRatingSuccess}
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
      </div>
    </div>
  )
}