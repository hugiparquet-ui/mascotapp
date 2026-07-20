import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../core/config/supabase.client'
import { useAuth } from '../../core/hooks/useAuth'
import { useGeolocation } from '../../core/hooks/useGeolocation'
import { uploadImage } from '../../core/services/upload.service'
import { BackButton } from '../../shared/ui/BackButton'

export const StrayReport = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { coords } = useGeolocation()

  const [name, setName] = useState('')
  const [species, setSpecies] = useState('Perro')
  const [breed, setBreed] = useState('')
  const [color, setColor] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [duplicateFound, setDuplicateFound] = useState(false)
  const [existingPet, setExistingPet] = useState<any>(null)

  // Generar hash único para el QR
  const generateHash = () => {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 10)
    return `stray-${timestamp}-${random}`
  }

  const checkDuplicate = async () => {
    if (!coords) return false
    // Buscar mascotas con el mismo nombre, raza y color en un radio de 500m
    const { data, error } = await supabase.rpc('find_stray_pets_nearby', {
      user_lat: coords.latitude,
      user_lng: coords.longitude,
      max_distance_meters: 500,
    })
    if (error || !data || data.length === 0) return false

    // Filtrar por coincidencia de nombre, raza y color
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

      alert('✅ Mascota callejera reportada. ¡Gracias por ayudar!')
      navigate('/stray')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (duplicateFound && existingPet) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <BackButton />
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-4 rounded-lg mt-4">
          <h2 className="font-bold">⚠️ Esta mascota ya fue reportada</h2>
          <p>Nombre: {existingPet.name}</p>
          <p>Raza: {existingPet.breed || 'No especificada'}</p>
          <p>Color: {existingPet.color || 'No especificado'}</p>
          <button
            onClick={() => {
              setDuplicateFound(false)
              setExistingPet(null)
            }}
            className="mt-3 bg-orange-500 text-white px-4 py-2 rounded-lg"
          >
            Intentar con otro nombre
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <BackButton />
      <h1 className="text-2xl font-bold text-brown-700 mb-4">Reportar mascota callejera</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nombre sugerido *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 border rounded-lg"
          required
        />

        <select
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
          className="w-full p-3 border rounded-lg"
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
          className="w-full p-3 border rounded-lg"
        />

        <input
          type="text"
          placeholder="Color (opcional)"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />

        <textarea
          placeholder="Descripción (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-3 border rounded-lg"
          rows={3}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full p-2 border rounded-lg"
          required
        />
        {file && <p className="text-sm text-green-600">✅ {file.name}</p>}

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold"
        >
          {loading ? 'Reportando...' : 'Reportar mascota callejera'}
        </button>
      </form>
    </div>
  )
}