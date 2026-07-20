import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../core/config/supabase.client'
import { useAuth } from '../../core/hooks/useAuth'
import { uploadImage } from '../../core/services/upload.service'
import { BackButton } from '../../shared/ui/BackButton'

export const AdoptionPublish = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [requirements, setRequirements] = useState({ age: '', sex: '', size: '', vaccinated: false, neutered: false })
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return setError('Debes iniciar sesión')
    if (!file) return setError('Selecciona una foto')
    setLoading(true)
    try {
      const imageUrl = await uploadImage(file)
      const { data: pet, error: petError } = await supabase
        .from('pets')
        .insert({ owner_id: user.id, name: title, image_url: imageUrl, species: 'Otro' })
        .select()
        .single()
      if (petError) throw petError
      const { error } = await supabase
        .from('adoption_listings')
        .insert({
          pet_id: pet.id,
          user_id: user.id,
          title,
          description,
          requirements,
          is_active: true
        })
      if (error) throw error
      alert('✅ Mascota publicada para adopción')
      navigate('/adopt')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <BackButton />
      <h2 className="text-xl font-bold mb-4">Publicar en adopción</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Título" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 border rounded-lg" required />
        <textarea placeholder="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 border rounded-lg" rows={3} />
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="w-full p-2 border rounded-lg" required />
        <div className="grid grid-cols-2 gap-2">
          <input type="text" placeholder="Edad" value={requirements.age} onChange={(e) => setRequirements({...requirements, age: e.target.value})} className="p-2 border rounded" />
          <input type="text" placeholder="Sexo" value={requirements.sex} onChange={(e) => setRequirements({...requirements, sex: e.target.value})} className="p-2 border rounded" />
          <input type="text" placeholder="Tamaño" value={requirements.size} onChange={(e) => setRequirements({...requirements, size: e.target.value})} className="p-2 border rounded" />
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={requirements.vaccinated} onChange={(e) => setRequirements({...requirements, vaccinated: e.target.checked})} />
            <label>Vacunado</label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={requirements.neutered} onChange={(e) => setRequirements({...requirements, neutered: e.target.checked})} />
            <label>Castrado</label>
          </div>
        </div>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>}
        <button type="submit" disabled={loading} className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold">{loading ? 'Publicando...' : 'Publicar'}</button>
      </form>
    </div>
  )
}