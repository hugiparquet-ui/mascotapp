import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../core/config/supabase.client'

export const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone
        }
      }
    })
    
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/login')
      alert('Registro exitoso. Ya puedes iniciar sesión.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">
          <span className="bg-gradient-to-r from-naranja-brillante to-azul-fuerte bg-clip-text text-transparent inline-block">
            Mascotapp
          </span>
        </h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Nombre completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte text-black"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte text-black"
            required
          />
          <input
            type="tel"
            placeholder="Teléfono (opcional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte text-black"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte text-black"
            required
            minLength={6}
          />
          {error && <p className="text-danger text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-azul-turquesa text-white py-3 rounded-lg font-bold hover:bg-azul-fuerte transition disabled:opacity-50"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <a href="/login" className="text-naranja-brillante font-semibold hover:underline">
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  )
}