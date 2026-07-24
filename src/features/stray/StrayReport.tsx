import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../core/config/supabase.client'
import { useAuth } from '../../core/hooks/useAuth'
import { useGeolocation } from '../../core/hooks/useGeolocation'
import { uploadImage } from '../../core/services/upload.service'

export const StrayReport = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { coords } = useGeolocation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [species, setSpecies] = useState('Perro')
  const [breed, setBreed] = useState('')
  const [color, setColor] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [duplicateFound, setDuplicateFound] = useState(false)
  const [existingPet, setExistingPet] = useState<any>(null)

  const generateHash = () => {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 10)
    return `stray-${timestamp}-${random}`
  }

  const checkDuplicate = async () => {
    if (!coords) return false
    const { data, error } = await supabase.rpc('find_stray_pets_nearby', {
      user_lat: coords.latitude,
      user_lng: coords.longitude,
      max_distance_meters: 500,
    })
    if (error || !data || data.length === 0) return false

    const match = data.find((p: any) =>
      p.name.toLowerCase() === name.toLowerCase() &&
      p.breed?.toLowerCase() === breed.toLowerCase() &&
      p.color?.toLowerCase() === color.toLowerCase()
    )
    if (match) {
      setExistingPet(match)
      return true
    }
    return false
  }

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

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!user) { setError('Debes iniciar sesión'); return }
    if (!coords) { setError('Activa el GPS'); return }
    if (!file) { setError('Selecciona una foto'); return }
    if (!name.trim()) { setError('El nombre es obligatorio'); return }

    // Verificar duplicados
    const isDuplicate = await checkDuplicate()
    if (isDuplicate) {
      setDuplicateFound(true)
      return
    }

    setLoading(true)
    try {
      const imageUrl = await uploadImage(file)

      // Crear la mascota (con is_stray = true)
      const { data: pet, error: petError } = await supabase
        .from('pets')
        .insert({
          owner_id: user.id,
          name: name.trim(),
          species,
          breed: breed.trim() || null,
          color: color.trim() || null,
          image_url: imageUrl,
          is_active: true,
          is_stray: true,
          qr_code_hash: generateHash(),
        })
        .select()
        .single()

      if (petError) throw petError

      // Crear el reporte de mascota callejera
      const { error: reportError } = await supabase
        .from('stray_reports')
        .insert({
          pet_id: pet.id,
          reporter_id: user.id,
          location: `POINT(${coords.longitude} ${coords.latitude})`,
          description: description.trim() || null,
          status: 'reportado',
        })

      if (reportError) throw reportError

      alert('✅ Comunitario Agregado. ¡Gracias por ayudar!')
      navigate('/my-pets') // ✅ Cambiado de /stray a /my-pets
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-2xl font-bold text-green-600">✅ ¡Registro Exitoso!</h2>
        <p className="text-gray-600">Serás redirigido al Directorio...</p>
      </div>
    )
  }

  if (duplicateFound && existingPet) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <button
          onClick={() => navigate('/my-pets')} // ✅ Cambiado de /stray a /my-pets
          className="absolute top-2 left-2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-naranja-brillante hover:bg-naranja-brillante hover:text-white transition-all duration-200 border border-naranja-suave/30 hover:border-naranja-brillante"
          aria-label="Volver a Mis Mascotas"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-4 rounded-lg mt-4">
          <h2 className="font-bold">⚠️ Esta mascota ya fue Agregada</h2>
          <p>Nombre: {existingPet.name}</p>
          <p>Raza: {existingPet.breed || 'No especificada'}</p>
          <p>Color: {existingPet.color || 'No especificado'}</p>
          <button
            onClick={() => {
              setDuplicateFound(false)
              setExistingPet(null)
            }}
            className="mt-3 bg-naranja-brillante text-white px-4 py-2 rounded-lg"
          >
            Intentar con otro Nombre
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100/90 to-gray-200/90 p-4 flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="bg-gray-100/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-azul-turquesa relative pt-12">
          {/* ✅ Botón de retroceso dentro del cuadro (va a /my-pets) */}
          <button
            onClick={() => navigate('/my-pets')} // ✅ Cambiado de /stray a /my-pets
            className="absolute top-2 left-2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-naranja-brillante hover:bg-naranja-brillante hover:text-white transition-all duration-200 border border-naranja-suave/30 hover:border-naranja-brillante"
            aria-label="Volver a Mis Mascotas"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h1 className="text-2xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-naranja-brillante to-azul-fuerte bg-clip-text text-transparent inline-block">
              Agregar Comunitario
            </span>
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Sugerido *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black transition"
                placeholder="Ej: Manchitas"
                required
              />
            </div>

            {/* Especie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Especie
              </label>
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black transition"
              >
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            {/* Raza */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Raza (opcional)
              </label>
              <input
                type="text"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black transition"
                placeholder="Ej: Labrador"
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color (opcional)
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black transition"
                placeholder="Ej: Blanco con manchas negras"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción (opcional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black transition"
                rows={3}
                placeholder="Contanos dónde la viste, su comportamiento, etc."
              />
            </div>

            {/* Foto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Foto *
              </label>
              <div
                onClick={handleImageClick}
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
                    <span className="text-sm">Subir Foto</span>
                  </div>
                )}
                {previewUrl && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <span className="text-white text-sm font-medium">Cambiar Foto</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
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
              {loading ? 'Agregando...' : 'Agregar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}