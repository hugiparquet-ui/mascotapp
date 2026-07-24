import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../core/config/supabase.client'
import { useGeolocation } from '../../core/hooks/useGeolocation'
import { useAuth } from '../../core/hooks/useAuth'
import { Loader } from '../../shared/ui/Loader'

interface Business {
  id: string
  owner_id: string
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

// Función para truncar texto largo
const truncateText = (text: string, maxLength: number = 30): string => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

export const BusinessList = () => {
  const { user } = useAuth()
  const { coords } = useGeolocation()
  const navigate = useNavigate()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!coords) {
      setLoading(false)
      return
    }

    const fetchBusinesses = async () => {
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select(`
            id,
            owner_id,
            name,
            category,
            address,
            phone,
            hours,
            services,
            image_url,
            profiles ( full_name )
          `)
          .eq('is_active', true)
          .limit(20)

        if (error) throw error

        const formatted = (data || []).map((item: any) => ({
          ...item,
          profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles,
        }))
        setBusinesses(formatted)
      } catch (err: any) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchBusinesses()
  }, [coords])

  if (loading) return <Loader />

  const getCategoryEmoji = (category: string) => {
    const map: Record<string, string> = {
      veterinaria: '🏥',
      tienda: '🛍️',
    }
    return map[category] || '🏪'
  }

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
                Veterinarias y Tiendas
              </span>
            </h1>
            {/* ✅ Enlace "Registrar" con ?new=true */}
            <Link
              to="/businesses/register?new=true"
              className="bg-azul-turquesa text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-azul-fuerte transition shadow-md"
            >
              Registrar
            </Link>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              Error: {error}
            </div>
          )}

          {businesses.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <p>No hay locales registrados cerca.</p>
              <p className="text-sm text-gray-400">(Radio de búsqueda: 50 km)</p>
            </div>
          ) : (
            businesses.map((business) => (
              <div key={business.id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4 mb-4 border-2 border-azul-turquesa relative">
                {/* Botón de edición (solo dueño) */}
                {user && business.owner_id === user.id && (
                  <Link
                    to="/businesses/register"
                    className="absolute top-2 right-2 text-gray-400 hover:text-azul-fuerte transition"
                    title="Editar perfil"
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
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center text-3xl border-2 border-azul-turquesa">
                    {business.image_url ? (
                      <img src={business.image_url} alt={business.name} className="w-full h-full object-cover" />
                    ) : (
                      getCategoryEmoji(business.category)
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{business.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{business.category}</p>
                    {business.address && <p className="text-sm text-gray-600">📍 {business.address}</p>}
                    {business.hours && (
                      <p className="text-sm text-gray-500" title={business.hours}>
                        🕐 {truncateText(business.hours, 25)}
                      </p>
                    )}
                    {business.services && business.services.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {business.services.slice(0, 3).map((s, i) => (
                          <span key={i} className="bg-gray-200 px-2 py-0.5 rounded-full text-xs text-gray-700 font-medium">
                            {s}
                          </span>
                        ))}
                        {business.services.length > 3 && (
                          <span className="bg-gray-200 px-2 py-0.5 rounded-full text-xs text-gray-500 font-medium">
                            +{business.services.length - 3} más
                          </span>
                        )}
                      </div>
                    )}
                    {business.distance_meters !== undefined && (
                      <p className="text-xs text-blue-500 mt-1">📍 {Math.round(business.distance_meters)} m</p>
                    )}
                  </div>
                </div>

                {/* Botones de acción */}
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
                  <button
                    onClick={() => {
                      setSelectedBusiness(business)
                      setShowModal(true)
                    }}
                    className="flex-1 bg-azul-fuerte text-white text-center py-2 rounded-lg font-bold text-sm hover:bg-azul-turquesa transition"
                  >
                    Ver Perfil
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de perfil del negocio */}
      {showModal && selectedBusiness && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-azul-turquesa max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-800 w-full text-center">
                {selectedBusiness.name}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl flex-shrink-0 ml-2"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-sm">
              {selectedBusiness.image_url && (
                <img
                  src={selectedBusiness.image_url}
                  alt={selectedBusiness.name}
                  className="w-full h-48 object-cover rounded-lg border-2 border-azul-turquesa"
                />
              )}
              {selectedBusiness.address && <p><strong className="text-gray-600">Dirección:</strong> {selectedBusiness.address}</p>}
              {selectedBusiness.phone && <p><strong className="text-gray-600">Teléfono:</strong> {selectedBusiness.phone}</p>}
              {selectedBusiness.hours && <p><strong className="text-gray-600">Horarios:</strong> {selectedBusiness.hours}</p>}
              {selectedBusiness.services && selectedBusiness.services.length > 0 && (
                <div>
                  <strong className="text-gray-600">Servicios:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedBusiness.services.map((s, i) => (
                      <span key={i} className="bg-gray-200 px-2 py-0.5 rounded-full text-xs text-gray-700 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {selectedBusiness.distance_meters !== undefined && (
                <p><strong className="text-gray-600">Distancia:</strong> {Math.round(selectedBusiness.distance_meters)} m</p>
              )}
            </div>

            {selectedBusiness.phone && (
              <a
                href={`https://wa.me/549${selectedBusiness.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full bg-green-500 text-white py-2 rounded-lg font-bold text-center hover:bg-green-600 transition block"
              >
                💬 Contactar por WhatsApp
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}