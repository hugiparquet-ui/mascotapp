import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../core/config/supabase.client'
import { useAuth } from '../../core/hooks/useAuth'
import { Loader } from '../../shared/ui/Loader'
import { BackButton } from '../../shared/ui/BackButton'

interface Pet {
  id: string
  name: string
  species: string
  breed: string
  color: string
  image_url: string
  is_stray: boolean
  qr_code_hash: string
  created_at: string
}

export const MyPets = () => {
  const { user } = useAuth()
  const [myPets, setMyPets] = useState<Pet[]>([])
  const [strayPets, setStrayPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null) // ✅ Estado para el modal de imagen

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchPets = async () => {
      try {
        const { data: own, error: ownError } = await supabase
          .from('pets')
          .select('*')
          .eq('owner_id', user.id)
          .eq('is_stray', false)

        if (ownError) throw ownError

        const { data: stray, error: strayError } = await supabase
          .from('pets')
          .select('*, stray_reports!inner(reporter_id)')
          .eq('is_stray', true)
          .eq('stray_reports.reporter_id', user.id)

        if (strayError) throw strayError

        setMyPets(own || [])
        setStrayPets(stray || [])
      } catch (err: any) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPets()
  }, [user])

  if (loading) return <Loader />
  if (error) return <div className="p-4 text-red-500 text-center">{error}</div>

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100/90 to-gray-200/90 p-4 flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="bg-gray-100/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-azul-turquesa relative pt-12">
          {/* Botón de retroceso dentro del cuadro */}
          <div className="absolute top-2 left-2">
            <BackButton />
          </div>

          <h1 className="text-2xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-naranja-brillante to-azul-fuerte bg-clip-text text-transparent inline-block">
              Mis Mascotas
            </span>
          </h1>

          <div className="flex gap-3 mb-6">
            <Link
              to="/my-pets/add-pet"
              className="flex-1 bg-azul-turquesa text-white py-2 rounded-lg font-bold text-center hover:bg-azul-fuerte transition shadow-md"
            >
              Agregar Mascota
            </Link>
            <Link
              to="/my-pets/add-stray"
              className="flex-1 bg-naranja-brillante text-white py-2 rounded-lg font-bold text-center hover:bg-naranja-suave transition shadow-md"
            >
              Agregar Comunitario
            </Link>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-700 mb-2">Mascotas Propias</h2>
            {myPets.length === 0 ? (
              <p className="text-sm text-gray-400">No tenés Mascotas Registradas.</p>
            ) : (
              <div className="space-y-2">
                {myPets.map((pet) => (
                  <div key={pet.id} className="bg-white/80 rounded-lg p-3 flex items-center gap-3 border border-azul-turquesa/30">
                    {/* ✅ Imagen clickeable */}
                    <div
                      className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 cursor-pointer border-2 border-transparent hover:border-azul-turquesa transition"
                      onClick={() => pet.image_url && setSelectedImage(pet.image_url)}
                    >
                      {pet.image_url ? (
                        <img src={pet.image_url} alt={pet.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">🐾</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{pet.name}</p>
                      <p className="text-xs text-gray-500">{pet.species} {pet.breed && `· ${pet.breed}`}</p>
                    </div>
                    <Link
                      to={`/pet/${pet.qr_code_hash}`}
                      className="text-sm bg-azul-fuerte text-white px-3 py-1 rounded-full hover:bg-azul-turquesa transition"
                    >
                      Ver Perfil
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-700 mb-2">Comunitarios Agregados</h2>
            {strayPets.length === 0 ? (
              <p className="text-sm text-gray-400">Todavia no se agregaron comunitarios.</p>
            ) : (
              <div className="space-y-2">
                {strayPets.map((pet) => (
                  <div key={pet.id} className="bg-white/80 rounded-lg p-3 flex items-center gap-3 border border-naranja-suave/30">
                    {/* ✅ Imagen clickeable */}
                    <div
                      className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 cursor-pointer border-2 border-transparent hover:border-naranja-brillante transition"
                      onClick={() => pet.image_url && setSelectedImage(pet.image_url)}
                    >
                      {pet.image_url ? (
                        <img src={pet.image_url} alt={pet.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">🐾</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{pet.name}</p>
                      <p className="text-xs text-gray-500">{pet.species} {pet.breed && `· ${pet.breed}`}</p>
                    </div>
                    <Link
                      to={`/pet/${pet.qr_code_hash}`}
                      className="text-sm bg-naranja-brillante text-white px-3 py-1 rounded-full hover:bg-naranja-suave transition"
                    >
                      Ver Perfil
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================
          MODAL PARA VER LA IMAGEN COMPLETA
          ============================================ */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Vista completa"
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl border-2 border-azul-turquesa"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-3 -right-3 bg-white rounded-full w-8 h-8 flex items-center justify-center text-gray-800 hover:bg-gray-100 transition shadow-lg text-xl"
              aria-label="Cerrar imagen"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}