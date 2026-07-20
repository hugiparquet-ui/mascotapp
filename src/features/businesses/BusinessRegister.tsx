import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../core/config/supabase.client'
import { useAuth } from '../../core/hooks/useAuth'
import { useGeolocation } from '../../core/hooks/useGeolocation'
import { BackButton } from '../../shared/ui/BackButton'

export const BusinessRegister = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { coords } = useGeolocation()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('veterinaria')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [hours, setHours] = useState('')
  const [services, setServices] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [existing, setExisting] = useState<any>(null)

  useEffect(() => {
    if (user) {
      supabase.from('businesses').select('*').eq('owner_id', user.id).single().then(({ data }) => setExisting(data))
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !coords) return setError('Faltan datos')
    setLoading(true)
    try {
      const data = {
        owner_id: user.id,
        name: name.trim(),
        category,
        address: address.trim() || null,
        phone: phone.trim() || null,
        location: `POINT(${coords.longitude} ${coords.latitude})`,
        hours: hours.trim() || null,
        services: services.trim() ? services.split(',').map(s => s.trim()) : [],
        is_active: true,
      }
      if (existing) {
        await supabase.from('businesses').update(data).eq('id', existing.id)
      } else {
        await supabase.from('businesses').insert(data)
      }
      navigate('/businesses')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <BackButton />
      <h1 className="text-2xl font-bold text-brown-700 mb-4">{existing ? 'Editar' : 'Registrar local'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Nombre del local *" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border rounded-lg" required />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full p-3 border rounded-lg">
          <option value="veterinaria">Veterinaria</option>
          <option value="tienda">Tienda de mascotas</option>
          <option value="petshop">Petshop</option>
        </select>
        <input type="text" placeholder="Dirección (opcional)" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-3 border rounded-lg" />
        <input type="tel" placeholder="Teléfono (opcional)" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 border rounded-lg" />
        <input type="text" placeholder="Horarios (opcional)" value={hours} onChange={(e) => setHours(e.target.value)} className="w-full p-3 border rounded-lg" />
        <input type="text" placeholder="Servicios (separados por coma)" value={services} onChange={(e) => setServices(e.target.value)} className="w-full p-3 border rounded-lg" />
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>}
        <button type="submit" disabled={loading} className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold">{loading ? 'Guardando...' : existing ? 'Actualizar' : 'Registrar'}</button>
      </form>
    </div>
  )
}