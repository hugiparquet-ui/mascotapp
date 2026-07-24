import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../core/config/supabase.client'
import { useAuth } from '../../core/hooks/useAuth'

export const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)
  const navigate = useNavigate()
  const { initialize } = useAuth()

  // ✅ Limpiar error al montar el componente
  useEffect(() => {
    setError('')
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      await initialize()
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100/90 to-gray-200/90 p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-gray-100/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-azul-turquesa">
          <h1 className="text-3xl font-bold text-center mb-6">
            <span className="bg-gradient-to-r from-naranja-brillante to-azul-fuerte bg-clip-text text-transparent inline-block">
              MascotApp
            </span>
          </h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte text-black"
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte text-black"
              autoComplete="current-password"
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-azul-turquesa text-white py-3 rounded-lg font-bold hover:bg-azul-fuerte transition disabled:opacity-50"
            >
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>
          <p className="text-center mt-4 text-sm text-gray-600">
            ¿No tenés cuenta?{' '}
            <Link 
              to="/register" 
              onClick={() => setError('')}
              className="text-naranja-brillante font-semibold hover:underline"
            >
              Registrate
            </Link>
          </p>
        </div>

        {/* ✅ Botones de descarga (APK e iOS) */}
        <div className="mt-4 flex justify-between items-center gap-2">
          {/* Botón APK (izquierda) */}
          <a
            href="/apk/MascotApp.apk"
            download
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition shadow-md text-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M17.523 14.789a1.5 1.5 0 0 1-1.5 1.5h-8.5a1.5 1.5 0 0 1-1.5-1.5v-4.5a1.5 1.5 0 0 1 1.5-1.5h8.5a1.5 1.5 0 0 1 1.5 1.5v4.5Z" />
              <path d="M12.75 3.25a.75.75 0 0 1 .75.75v14a.75.75 0 0 1-1.5 0V4a.75.75 0 0 1 .75-.75Z" />
              <path d="M6.25 8.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75Z" />
              <path d="M17.75 8.5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5a.75.75 0 0 1 .75-.75Z" />
              <path d="M3.25 10a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75Z" />
              <path d="M20.75 10a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75Z" />
            </svg>
            APK
          </a>

          {/* Botón iOS (derecha) */}
          <button
            onClick={() => setShowIOSInstructions(true)}
            className="inline-flex items-center gap-2 bg-blue-400 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition shadow-md text-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            iOS
          </button>
        </div>
      </div>

      {/* ============================================
          MODAL DE INSTRUCCIONES PARA iOS
          ============================================ */}
      {showIOSInstructions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border-2 border-azul-turquesa max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">📱 Instalar en iPhone</h2>
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Seguí estos pasos para agregar MascotApp a la pantalla de inicio de tu iPhone:
            </p>
            <ol className="space-y-3 text-sm text-gray-700 list-decimal list-inside">
              <li>Abrí la app en <strong>Safari</strong> (no en otro navegador).</li>
              <li>Tocá el ícono de <strong>compartir</strong> (cuadrado con flecha hacia arriba).</li>
              <li>Desplazate hacia abajo y seleccioná <strong>"Agregar a la pantalla de inicio"</strong>.</li>
              <li>Confirmá tocando <strong>"Agregar"</strong>.</li>
            </ol>
            <p className="text-xs text-gray-400 mt-4 text-center">
              La app se instalará con tu logo y se abrirá como una app nativa.
            </p>
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="mt-4 w-full bg-azul-turquesa text-white py-2 rounded-lg font-bold hover:bg-azul-fuerte transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  )
}