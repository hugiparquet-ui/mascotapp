import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../core/config/supabase.client'
import { useAuth } from '../../core/hooks/useAuth'
import { useGeolocation } from '../../core/hooks/useGeolocation'
import { BackButton } from '../../shared/ui/BackButton'

export const WalkerRegister = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { coords } = useGeolocation()
  const [bio, setBio] = useState('')
  const [experienceYears, setExperienceYears] = useState(0)
  const [pricePerHour, setPricePerHour] = useState('')
  const [phonePublic, setPhonePublic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [existing, setExisting] = useState<any>(null)

  useEffect(() => {
    if (user) {
      supabase.from('walkers').select('*').eq('user_id', user.id).single().then(({ data }) => setExisting(data))
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !coords) return setError('Faltan datos')
    setLoading(true)
    try {
      const data = {
        user_id: user.id,
        bio: bio.trim(),
        experience_years: experienceYears,
        price_per_hour: parseFloat(pricePerHour) || 0,
        location: `POINT(${coords.longitude} ${coords.latitude})`,
        is_active: true,
        phone_public: phonePublic,
      }
      if (existing) {
        await supabase.from('walkers').update(data).eq('id', existing.id)
      } else {
        await supabase.from('walkers').insert(data)
      }
      navigate('/walkers')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <BackButton />
      <h1 className="text-2xl font-bold text-brown-700 mb-4">{existing ? 'Editar' : 'Registrarme como paseador'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea placeholder="Descripción / Experiencia" value={bio} onChange={(e) => setBio(e.target.value)} className="w-full p-3 border rounded-lg" rows={4} required />
        <input type="number" placeholder="Años de experiencia" value={experienceYears} onChange={(e) => setExperienceYears(Number(e.target.value))} className="w-full p-3 border rounded-lg" min={0} max={50} />
        <input type="number" placeholder="Tarifa por hora ($)" value={pricePerHour} onChange={(e) => setPricePerHour(e.target.value)} className="w-full p-3 border rounded-lg" min={0} step={100} />
        <div className="flex items-center gap-2">
          <input type="checkbox" id="phonePublic" checked={phonePublic} onChange={(e) => setPhonePublic(e.target.checked)} />
          <label htmlFor="phonePublic" className="text-sm">Mostrar mi teléfono</label>
        </div>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>}
        <button type="submit" disabled={loading} className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold">{loading ? 'Guardando...' : existing ? 'Actualizar' : 'Registrarme'}</button>
      </form>
    </div>
  )
}