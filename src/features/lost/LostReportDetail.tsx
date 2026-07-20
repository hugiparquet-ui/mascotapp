import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../core/config/supabase.client'
import { useAuth } from '../../core/hooks/useAuth'
import { Loader } from '../../shared/ui/Loader'
import { BackButton } from '../../shared/ui/BackButton'

export const LostReportDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [report, setReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    const fetchReport = async () => {
      if (!id) return
      const { data, error } = await supabase
        .from('lost_reports')
        .select(`
          *,
          pet:pet_id (id, name, image_url, species, breed, color),
          user:user_id (id, full_name, phone, phone_public)
        `)
        .eq('id', id)
        .single()
      if (error) {
        setError('No se encontró el reporte')
      } else {
        setReport(data)
      }
      setLoading(false)
    }
    fetchReport()
  }, [id])

  const handleMarkFound = async () => {
    if (!window.confirm('¿Marcar esta mascota como encontrada?')) return
    setUpdating(true)
    const { error } = await supabase
      .from('lost_reports')
      .update({ status: 'resuelto' })
      .eq('id', id)
    if (error) {
      alert('Error al actualizar: ' + error.message)
    } else {
      alert('✅ Mascota marcada como encontrada')
      navigate(-1)
    }
    setUpdating(false)
  }

  if (loading) return <Loader />
  if (error) return <div className="p-4 text-red-500">{error}</div>
  if (!report) return <div className="p-4">Reporte no encontrado</div>

  const isOwner = user?.id === report.user_id
  const isResolved = report.status === 'resuelto'

  return (
    <div className="p-4 max-w-md mx-auto">
      <BackButton />
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {report.pet?.image_url && (
          <img src={report.pet.image_url} alt={report.pet.name} className="w-full h-64 object-cover" />
        )}
        <div className="p-4">
          <h1 className="text-2xl font-bold text-brown-700">{report.pet?.name || 'Mascota'}</h1>
          <p className="text-gray-600">{report.title}</p>
          <p className="text-gray-700 mt-2">{report.description}</p>
          <div className="mt-2 text-sm text-gray-500">
            <span className="inline-block px-2 py-1 rounded-full bg-gray-100">
              📅 {new Date(report.created_at).toLocaleDateString()}
            </span>
            <span className={`ml-2 inline-block px-2 py-1 rounded-full ${isResolved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {isResolved ? '✅ Encontrada' : '⚠️ Perdida'}
            </span>
          </div>
          {report.phone_public && report.user?.phone && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-gray-700">📞 Teléfono: <strong>{report.user.phone}</strong></p>
              <a
                href={`https://wa.me/549${report.user.phone.replace(/\D/g, '')}`}
                target="_blank"
                className="inline-block mt-1 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold"
              >
                💬 WhatsApp
              </a>
            </div>
          )}
          {isOwner && !isResolved && (
            <button
              onClick={handleMarkFound}
              disabled={updating}
              className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition"
            >
              {updating ? 'Actualizando...' : '🐾 Marcar como encontrada'}
            </button>
          )}
          {isOwner && (
            <button
              onClick={() => alert('Edición de reporte (próximamente)')}
              className="mt-2 w-full bg-orange-500 text-white py-2 rounded-lg font-bold hover:bg-orange-600 transition"
            >
              ✏️ Editar reporte
            </button>
          )}
        </div>
      </div>
    </div>
  )
}