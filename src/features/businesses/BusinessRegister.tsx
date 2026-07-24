import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../core/config/supabase.client'
import { useAuth } from '../../core/hooks/useAuth'
import { useGeolocation } from '../../core/hooks/useGeolocation'
import { uploadImage } from '../../core/services/upload.service'
import { ConfirmModal } from '../../shared/ui/ConfirmModal' // ✅ NUEVO

export const BusinessRegister = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { coords } = useGeolocation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('veterinaria')
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [hours, setHours] = useState('')
  const [services, setServices] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [existingBusiness, setExistingBusiness] = useState<any>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false) // ✅ NUEVO

  // ✅ Solo cargar existente si NO hay parámetro "new" en la URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const isNew = urlParams.get('new') === 'true'
    if (user && !isNew) {
      supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .single()
        .then(({ data }) => {
          if (data) setExistingBusiness(data)
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
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
      setError('')
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  // ✅ NUEVO: Eliminar negocio
  const handleDeleteBusiness = async () => {
    try {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', existingBusiness.id)

      if (error) throw error

      alert('✅ Perfil de negocio eliminado correctamente.')
      navigate('/businesses')
    } catch (err: any) {
      alert('Error al eliminar el perfil: ' + err.message)
    }
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
    if (!name.trim()) {
      setError('El nombre del local es obligatorio')
      return
    }

    setLoading(true)

    try {
      let imageUrl = null
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile)
        } catch (uploadErr: any) {
          console.error('Error al subir imagen:', uploadErr)
          setError(`Error al subir la imagen: ${uploadErr.message || 'Intenta con otra imagen'}`)
          setLoading(false)
          return
        }
      }

      const businessData = {
        owner_id: user.id,
        name: name.trim(),
        category,
        address: address.trim() || null,
        phone: phone.trim() || null,
        location: `POINT(${coords.longitude} ${coords.latitude})`,
        hours: hours.trim() || null,
        services: services.trim() ? services.split(',').map(s => s.trim()) : [],
        is_active: true,
        image_url: imageUrl,
      }

      if (existingBusiness) {
        const { error } = await supabase
          .from('businesses')
          .update(businessData)
          .eq('id', existingBusiness.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('businesses')
          .insert(businessData)
        if (error) throw error
      }

      setSuccess(true)
      setTimeout(() => navigate('/businesses'), 2000)
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Error al guardar los datos')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="p-4 text-center">
        <h2 className="text-2xl font-bold text-green-600">✅ ¡Registro exitoso!</h2>
        <p className="text-gray-600">Serás redirigido al directorio...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100/90 to-gray-200/90 p-4 flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="bg-gray-100/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-azul-turquesa relative pt-12">
          <button
            onClick={() => navigate('/businesses')}
            className="absolute top-2 left-2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-naranja-brillante hover:bg-naranja-brillante hover:text-white transition-all duration-200 border border-naranja-suave/30 hover:border-naranja-brillante"
            aria-label="Volver al listado de veterinarias y tiendas"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h1 className="text-2xl font-bold text-center mb-4">
            <span className="bg-gradient-to-r from-naranja-brillante to-azul-fuerte bg-clip-text text-transparent inline-block">
              {existingBusiness ? 'Editar Local' : 'Registrar Local'}
            </span>
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Imagen del local */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Imagen del Local
              </label>
              <div className="flex justify-center">
                <div
                  onClick={handleImageClick}
                  className="w-32 h-32 bg-gray-200 rounded-xl border-2 border-dashed border-azul-turquesa flex items-center justify-center cursor-pointer hover:bg-gray-100 transition group relative overflow-hidden shadow-md"
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
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
                      <span className="text-xs">Subir Imagen</span>
                    </div>
                  )}
                  {imagePreview && (
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
              {imagePreview && (
                <p className="text-xs text-green-600 text-center mt-1">✅ Imagen Cargada</p>
              )}
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Local *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black transition"
                placeholder="Ej: Veterinaria Goya"
                required
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black transition"
              >
                <option value="veterinaria">Veterinaria</option>
                <option value="tienda">Tienda de Mascotas</option>
              </select>
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black transition"
                placeholder="Ej: Av. San Martín 123"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black transition"
                placeholder="Ej: 3777-123456"
              />
            </div>

            {/* Horarios */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horarios (opcional)
              </label>
              <input
                type="text"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black transition"
                placeholder="Ej: Lun-Vie 9 a 18hs, Sáb 9 a 13hs"
              />
            </div>

            {/* Servicios */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Servicios (separados por coma)
              </label>
              <input
                type="text"
                value={services}
                onChange={(e) => setServices(e.target.value)}
                className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black transition"
                placeholder="Ej: Consultas, Vacunación, Baños"
              />
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
              {loading ? 'Guardando...' : existingBusiness ? 'Actualizar' : 'Registrar'}
            </button>

            {/* ✅ NUEVO: Botón Eliminar Perfil (solo si existe) */}
            {existingBusiness && (
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

      {/* ✅ NUEVO: Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Eliminar Perfil"
        message="¿Estás seguro de que deseas eliminar tu perfil? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={() => {
          setShowDeleteModal(false)
          handleDeleteBusiness()
        }}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  )
}