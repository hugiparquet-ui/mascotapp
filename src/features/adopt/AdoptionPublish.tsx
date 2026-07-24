import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../core/config/supabase.client'
import { useAuth } from '../../core/hooks/useAuth'
import { uploadImage } from '../../core/services/upload.service'

export const AdoptionPublish = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [requirements, setRequirements] = useState({
    age: '',
    sex: '',
    size: '',
    vaccinated: false,
    neutered: false,
  })
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe superar los 5 MB.')
        return
      }
      setFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string)
      }
      reader.readAsDataURL(file)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return setError('Debes iniciar sesión')
    if (!file) return setError('Selecciona una foto')

    setLoading(true)
    setError('')

    try {
      const imageUrl = await uploadImage(file)
      const { data: pet, error: petError } = await supabase
        .from('pets')
        .insert({
          owner_id: user.id,
          name: title,
          image_url: imageUrl,
          species: 'Otro',
        })
        .select()
        .single()

      if (petError) throw petError

      const { error } = await supabase.from('adoption_listings').insert({
        pet_id: pet.id,
        user_id: user.id,
        title,
        description,
        requirements,
        is_active: true,
      })

      if (error) throw error

      alert('✅ Mascota publicada para Adopción')
      navigate('/adopt')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100/90 to-gray-200/90 p-4 flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="bg-gray-100/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-azul-turquesa relative pt-12">
          {/* ✅ Botón de retroceso dentro del cuadro */}
          <button
            onClick={() => navigate('/adopt')}
            className="absolute top-2 left-2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-naranja-brillante hover:bg-naranja-brillante hover:text-white transition-all duration-200 border border-naranja-suave/30 hover:border-naranja-brillante"
            aria-label="Volver al listado de adopciones"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h1 className="text-2xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-naranja-brillante to-azul-fuerte bg-clip-text text-transparent inline-block">
              Publicar en Adopción
            </span>
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black transition"
                placeholder="Ej: Busca familia"
                required
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black transition"
                rows={3}
                placeholder="Cuéntanos sobre la mascota, su carácter, etc."
              />
            </div>

            {/* Foto con vista previa mejorada */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Foto de la Mascota *
              </label>
              <div
                onClick={() => document.getElementById('fileInput')?.click()}
                className="w-full h-48 bg-gray-200 rounded-xl border-2 border-dashed border-azul-turquesa flex items-center justify-center cursor-pointer hover:bg-gray-100 transition group relative overflow-hidden"
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Vista previa"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-gray-500 group-hover:text-azul-turquesa transition p-2">
                    <svg
                      className="w-12 h-12 mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                      />
                    </svg>
                    <span className="text-sm">Subir foto</span>
                  </div>
                )}
                {previewUrl && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <span className="text-white text-sm font-medium">Cambiar foto</span>
                  </div>
                )}
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              {previewUrl && (
                <p className="text-xs text-green-600 text-center mt-1">✅ Foto Cargada</p>
              )}
            </div>

            {/* Requisitos: grid 2 columnas */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
                <input
                  type="text"
                  placeholder="Ej: 2 años"
                  value={requirements.age}
                  onChange={(e) =>
                    setRequirements({ ...requirements, age: e.target.value })
                  }
                  className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                <input
                  type="text"
                  placeholder="Macho / Hembra"
                  value={requirements.sex}
                  onChange={(e) =>
                    setRequirements({ ...requirements, sex: e.target.value })
                  }
                  className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tamaño</label>
                <input
                  type="text"
                  placeholder="Pequeño / Mediano / Grande"
                  value={requirements.size}
                  onChange={(e) =>
                    setRequirements({ ...requirements, size: e.target.value })
                  }
                  className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black transition"
                />
              </div>
            </div>

            {/* Checkboxes verticales debajo de tamaño */}
            <div className="space-y-2 mt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="vaccinated"
                  checked={requirements.vaccinated}
                  onChange={(e) =>
                    setRequirements({ ...requirements, vaccinated: e.target.checked })
                  }
                  className="w-4 h-4 text-azul-turquesa focus:ring-azul-turquesa border-gray-300 rounded"
                />
                <label htmlFor="vaccinated" className="text-sm text-gray-700">
                  Vacunado
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="neutered"
                  checked={requirements.neutered}
                  onChange={(e) =>
                    setRequirements({ ...requirements, neutered: e.target.checked })
                  }
                  className="w-4 h-4 text-azul-turquesa focus:ring-azul-turquesa border-gray-300 rounded"
                />
                <label htmlFor="neutered" className="text-sm text-gray-700">
                  Castrado
                </label>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-azul-turquesa text-white py-3 rounded-lg font-bold hover:bg-azul-fuerte transition disabled:opacity-50 shadow-md"
            >
              {loading ? 'Publicando...' : 'Publicar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}