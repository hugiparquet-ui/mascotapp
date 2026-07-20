import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../core/config/supabase.client'
import { useAuth } from '../../core/hooks/useAuth'
import { useGeolocation } from '../../core/hooks/useGeolocation'
import { uploadImage } from '../../core/services/upload.service'
import { BackButton } from '../../shared/ui/BackButton'

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
      supabase
        .from('profiles')
        .select('phone')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.phone) setUserPhone(data.phone)
        })
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
    <div className="p-4 max-w-md mx-auto">
      <BackButton />
      <h1 className="text-2xl font-bold text-brown-700 mb-4">Reportar pérdida</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Nombre *" value={petName} onChange={(e) => setPetName(e.target.value)} className="w-full p-3 border rounded-lg" required />
        <select value={species} onChange={(e) => setSpecies(e.target.value)} className="w-full p-3 border rounded-lg">
          <option value="Perro">Perro</option>
          <option value="Gato">Gato</option>
          <option value="Otro">Otro</option>
        </select>
        <input type="text" placeholder="Raza (opcional)" value={breed} onChange={(e) => setBreed(e.target.value)} className="w-full p-3 border rounded-lg" />
        <input type="text" placeholder="Color (opcional)" value={color} onChange={(e) => setColor(e.target.value)} className="w-full p-3 border rounded-lg" />
        <textarea placeholder="Descripción / Lugar *" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 border rounded-lg" rows={3} required />
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full p-2 border rounded-lg" required />
        {file && <p className="text-sm text-green-600">✅ {file.name}</p>}
        <div className="flex items-center gap-2">
          <input type="checkbox" id="showPhone" checked={showPhone} onChange={(e) => setShowPhone(e.target.checked)} />
          <label htmlFor="showPhone" className="text-sm">Mostrar mi teléfono {userPhone && `(${userPhone})`}</label>
        </div>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>}
        <button type="submit" disabled={loading} className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold">{loading ? 'Publicando...' : 'Publicar alerta'}</button>
      </form>
    </div>
  )
}