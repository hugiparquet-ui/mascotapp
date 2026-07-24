import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../core/config/supabase.client'
import { useAuth } from '../../core/hooks/useAuth'
import { useGeolocation } from '../../core/hooks/useGeolocation'
import { uploadImage } from '../../core/services/upload.service'
import { ConfirmModal } from '../../shared/ui/ConfirmModal' // ✅ NUEVO: importado

export const WalkerRegister = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { coords } = useGeolocation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [bio, setBio] = useState('')
  const [experienceYears, setExperienceYears] = useState<number | ''>('')
  const [pricePerHour, setPricePerHour] = useState('')
  const [phone, setPhone] = useState('')
  const [phonePublic, setPhonePublic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [existingWalker, setExistingWalker] = useState<any>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false) // ✅ NUEVO: estado para modal de eliminación

  // Cargar datos existentes (incluyendo teléfono del perfil)
  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('phone')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.phone) setPhone(data.phone)
        })

      supabase
        .from('walkers')
        .select('*')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setExistingWalker(data)
            setBio(data.bio || '')
            setExperienceYears(data.experience_years !== undefined ? data.experience_years : '')
            setPricePerHour(data.price_per_hour?.toString() || '')
            setPhonePublic(data.phone_public || false)
            if (data.avatar_url) setAvatarPreview(data.avatar_url)
          }
        })
    }
  }, [user])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe superar los 5 MB.')
        return
      }
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
      setError('')
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!user) {
      setError('Debes iniciar sesión')
      return
    }
    if (!coords) {
      setError('No podemos obtener tu ubicación. Activa el GPS.')
      return
    }
    if (!bio.trim()) {
      setError('La descripción es obligatoria')
      return
    }

    setLoading(true)

    try {
      if (phone.trim()) {
        const { error: phoneError } = await supabase
          .from('profiles')
          .update({ phone: phone.trim() })
          .eq('id', user.id)
        if (phoneError) throw phoneError
      }

      let avatarUrl = null
      if (avatarFile) {
        try {
          avatarUrl = await uploadImage(avatarFile)
        } catch (uploadErr: any) {
          console.error('Error en Cloudinary:', uploadErr)
          setError(`Error al subir la imagen: ${uploadErr.message || 'Intenta con otra imagen'}`)
          setLoading(false)
          return
        }
      }

      const walkerData = {
        user_id: user.id,
        bio: bio.trim(),
        experience_years: typeof experienceYears === 'number' ? experienceYears : 0,
        price_per_hour: parseFloat(pricePerHour) || 0,
        location: `POINT(${coords.longitude} ${coords.latitude})`,
        is_active: true,
        phone_public: phonePublic,
        avatar_url: avatarUrl,
      }

      if (existingWalker) {
        const { error } = await supabase
          .from('walkers')
          .update(walkerData)
          .eq('id', existingWalker.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('walkers')
          .insert(walkerData)
        if (error) throw error
      }

      setSuccess(true)
      setTimeout(() => navigate('/walkers'), 2000)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Error al guardar los datos')
    } finally {
      setLoading(false)
    }
  }

  // ✅ NUEVO: Eliminar perfil de paseador
  const handleDeleteWalker = async () => {
    try {
      const { error } = await supabase
        .from('walkers')
        .delete()
        .eq('id', existingWalker.id)

      if (error) throw error

      alert('✅ Perfil de paseador eliminado correctamente.')
      navigate('/walkers')
    } catch (err: any) {
      alert('Error al eliminar el perfil: ' + err.message)
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100/90 to-gray-200/90 p-4 flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="bg-gray-100/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-azul-turquesa relative pt-12">
          {/* Botón de retroceso dentro del cuadro */}
          <button
            onClick={() => navigate('/walkers')}
            className="absolute top-2 left-2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-naranja-brillante hover:bg-naranja-brillante hover:text-white transition-all duration-200 border border-naranja-suave/30 hover:border-naranja-brillante"
            aria-label="Volver al Listado de Paseadores"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h1 className="text-2xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-naranja-brillante to-azul-fuerte bg-clip-text text-transparent inline-block">
              {existingWalker ? 'Editar Perfil de Paseador' : 'REGISTRARME COMO PASEADOR'}
            </span>
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* FOTO DE PERFIL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Foto de Perfil
              </label>
              <div className="flex justify-center">
                <div
                  onClick={handleAvatarClick}
                  className="w-32 h-32 bg-gray-200 rounded-xl border-2 border-dashed border-azul-turquesa flex items-center justify-center cursor-pointer hover:bg-gray-100 transition group relative overflow-hidden shadow-md"
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-gray-500 group-hover:text-azul-turquesa transition p-2">
                      <svg
                        className="w-10 h-10 mx-auto mb-1"
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
                      <span className="text-xs">Subir Foto</span>
                    </div>
                  )}
                  {avatarPreview && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <span className="text-white text-xs font-medium">Cambiar</span>
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
              </div>
              {avatarPreview && (
                <p className="text-xs text-green-600 text-center mt-1">✅ Foto cargada</p>
              )}
            </div>

            {/* DESCRIPCIÓN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción / Experiencia *
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black transition"
                rows={4}
                placeholder="Cuéntanos tu experiencia con mascotas, disponibilidad, etc."
                required
              />
            </div>

            {/* TELÉFONO DE CONTACTO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono de Contacto
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black transition"
                placeholder="Ej: 3777-123456"
              />
              <p className="text-xs text-gray-400 mt-1">
                Este número se mostrará en tu perfil si activas la opción "Mostrar mi teléfono".
              </p>
            </div>

            {/* AÑOS DE EXPERIENCIA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Años de Experiencia
              </label>
              <input
                type="number"
                value={experienceYears}
                onChange={(e) => {
                  const val = e.target.value
                  setExperienceYears(val === '' ? '' : Number(val))
                }}
                className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black transition no-spinner"
                placeholder="Ej: 5"
                min={0}
                max={50}
                step="0.5"
              />
            </div>

            {/* TARIFA POR HORA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tarifa por Hora ($)
              </label>
              <input
                type="number"
                value={pricePerHour}
                onChange={(e) => setPricePerHour(e.target.value)}
                className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black transition"
                placeholder="Ej: 2000"
                min={0}
                step={100}
              />
            </div>

            {/* MOSTRAR TELÉFONO */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="phonePublic"
                checked={phonePublic}
                onChange={(e) => setPhonePublic(e.target.checked)}
                className="w-4 h-4 text-azul-turquesa focus:ring-azul-turquesa border-gray-300 rounded"
              />
              <label htmlFor="phonePublic" className="text-sm text-gray-700">
                Mostrar mi teléfono en el Directorio (para que me contacten)
              </label>
            </div>

            {/* ERROR */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* BOTÓN DE ENVÍO */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-azul-turquesa text-white py-3 rounded-lg font-bold hover:bg-azul-fuerte transition disabled:opacity-50 shadow-md"
            >
              {loading ? 'Guardando...' : existingWalker ? 'Actualizar' : 'Registrarme'}
            </button>

            {/* ✅ NUEVO: BOTÓN ELIMINAR PERFIL (solo si existe) */}
            {existingWalker && (
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="w-full bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600 transition shadow-md"
              >
                Eliminar Perfil
              </button>
            )}
          </form>
        </div>
      </div>

      {/* ✅ NUEVO: MODAL DE CONFIRMACIÓN PARA ELIMINAR */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Eliminar Perfil"
        message="¿Estás seguro de que deseas eliminar tu perfil? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={() => {
          setShowDeleteModal(false)
          handleDeleteWalker()
        }}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  )
}