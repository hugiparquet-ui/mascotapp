import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../core/config/supabase.client'
import { useAuth } from '../../core/hooks/useAuth'
import { useGeolocation } from '../../core/hooks/useGeolocation'
import { uploadImage } from '../../core/services/upload.service'

export const LostReport = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { coords } = useGeolocation()
  
  const [petName, setPetName] = useState('')
  const [description, setDescription] = useState('')
  const [species, setSpecies] = useState('Perro')
  const [breed, setBreed] = useState('')
  const [color, setColor] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [showPhone, setShowPhone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [userPhone, setUserPhone] = useState('')

  useEffect(() => {
    if (user) {
      const phone = user.user_metadata?.phone || ''
      setUserPhone(phone)
    }
  }, [user])

  const generateHash = () => {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 10)
    return `${timestamp}-${random}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!user) { setError('Debes iniciar sesión'); return }
    if (!coords) { setError('Activa el GPS'); return }
    if (!file) { setError('Selecciona una foto'); return }
    if (!petName.trim()) { setError('El nombre es obligatorio'); return }

    setLoading(true)
    try {
      const imageUrl = await uploadImage(file)
      const { data: pet, error: petError } = await supabase
        .from('pets')
        .insert({
          owner_id: user.id,
          name: petName.trim(),
          species,
          breed: breed.trim() || null,
          color: color.trim() || null,
          image_url: imageUrl,
          is_active: true,
          qr_code_hash: generateHash(),
        })
        .select()
        .single()
      if (petError) throw petError

      const { error: reportError } = await supabase
        .from('lost_reports')
        .insert({
          pet_id: pet.id,
          user_id: user.id,
          title: `¡Perdí a ${petName.trim()}!`,
          description: description.trim() || 'Ayúdame a encontrarlo/a',
          last_location: `POINT(${coords.longitude} ${coords.latitude})`,
          radius_km: 1,
          status: 'activo',
          phone_public: showPhone,
        })
      if (reportError) throw reportError

      alert('✅ Reporte creado')
      navigate('/')
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
            onClick={() => navigate('/')}
            className="absolute top-2 left-2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-naranja-brillante hover:bg-naranja-brillante hover:text-white transition-all duration-200 border border-naranja-suave/30 hover:border-naranja-brillante"
            aria-label="Volver al inicio"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h1 className="text-2xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-naranja-brillante to-azul-fuerte bg-clip-text text-transparent inline-block">
              Reportar Pérdida
            </span>
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Nombre *"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte text-black transition"
              required
            />
            <select
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte text-black transition"
            >
              <option value="Perro">Perro</option>
              <option value="Gato">Gato</option>
              <option value="Otro">Otro</option>
            </select>
            <input
              type="text"
              placeholder="Raza (opcional)"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte text-black transition"
            />
            <input
              type="text"
              placeholder="Color (opcional)"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte text-black transition"
            />
            <textarea
              placeholder="Descripción / Lugar *"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte text-black transition"
              rows={3}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Foto de la mascota *
              </label>
              <div
                onClick={() => document.getElementById('fileInput')?.click()}
                className="w-full h-32 bg-gray-200 rounded-xl border-2 border-dashed border-azul-turquesa flex items-center justify-center cursor-pointer hover:bg-gray-100 transition group relative overflow-hidden"
              >
                {file ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-gray-500 group-hover:text-azul-turquesa transition p-2">
                    <svg className="w-10 h-10 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    <span className="text-xs">Hacé clic para subir foto</span>
                  </div>
                )}
                {file && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <span className="text-white text-xs font-medium">Cambiar foto</span>
                  </div>
                )}
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </div>
              {file && <p className="text-xs text-green-600 text-center mt-1">✅ {file.name}</p>}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="showPhone"
                checked={showPhone}
                onChange={(e) => setShowPhone(e.target.checked)}
                className="w-4 h-4 text-azul-fuerte focus:ring-azul-fuerte"
              />
              <label htmlFor="showPhone" className="text-sm text-gray-700">
                Mostrar mi teléfono {userPhone && `(${userPhone})`}
              </label>
            </div>
            {error && <div className="bg-danger/10 border border-danger text-danger p-3 rounded-lg text-sm">{error}</div>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-azul-turquesa text-white py-3 rounded-lg font-bold hover:bg-azul-fuerte transition disabled:opacity-50 shadow-md"
            >
              {loading ? 'Publicando...' : 'Publicar Alerta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}