import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../core/config/supabase.client'
import { Loader } from '../../shared/ui/Loader'
import { QRCodeSVG } from 'qrcode.react'
import { NotifyOwnerModal } from './components/NotifyOwnerModal'
import { ClinicalRecordForm } from '../clinical/ClinicalRecordForm'
import { useAuth } from '../../core/hooks/useAuth'
import { BackButton } from '../../shared/ui/BackButton'

export const PublicPetProfile = () => {
  const { hash } = useParams()
  const { user } = useAuth()
  const [pet, setPet] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showNotifyModal, setShowNotifyModal] = useState(false)
  const [showClinicalForm, setShowClinicalForm] = useState(false)
  const [activeReport, setActiveReport] = useState<any>(null)

  // Obtener datos de la mascota (incluyendo historial clínico)
  useEffect(() => {
    const fetchPet = async () => {
      if (!hash) {
        setError('Código inválido')
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('pets')
          .select(`
            *,
            profiles (
              full_name,
              phone,
              phone_public
            ),
            lost_reports (
              id,
              status,
              description,
              created_at,
              phone_public
            ),
            clinical_records (
              id,
              record_type,
              title,
              description,
              veterinarian_name,
              clinic_name,
              record_date,
              next_due_date,
              created_at
            )
          `)
          .eq('qr_code_hash', hash)
          .maybeSingle()

        if (error) throw error
        if (!data) {
          setError('Mascota no encontrada')
          setLoading(false)
          return
        }

        // Buscar reporte activo
        const report = data.lost_reports?.find((r: any) => r.status === 'activo')
        setActiveReport(report || null)
        setPet(data)
      } catch (err: any) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPet()
  }, [hash])

  if (loading) return <Loader />
  if (error) return <div className="p-4 text-red-500">{error}</div>
  if (!pet) return <div className="p-4 text-center">Mascota no encontrada</div>

  const isLost = !!activeReport
  const ownerPhone = activeReport?.phone_public && pet.profiles?.phone ? pet.profiles.phone : null
  const isOwner = user?.id === pet.owner_id
  const isVet = user?.user_metadata?.role === 'vet'

  // Verificar si el usuario puede agregar registros (dueño o vet)
  const canAddRecords = isOwner || isVet

  // Ordenar registros clínicos por fecha (más reciente primero)
  const clinicalRecords = pet.clinical_records || []
  const sortedRecords = [...clinicalRecords].sort(
    (a, b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime()
  )

  return (
    <div className="min-h-screen bg-cream-50 p-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Botón de retroceso */}
        <div className="p-2">
          <BackButton />
        </div>

        {/* Foto y estado */}
        <div className="relative h-64 bg-gray-200">
          <img
            src={pet.image_url || '/default-pet.png'}
            alt={pet.name}
            className="w-full h-full object-cover"
          />
          {isLost && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              ⚠️ Perdida
            </div>
          )}
        </div>

        {/* Información básica */}
        <div className="p-4">
          <h1 className="text-2xl font-bold text-brown-700">{pet.name}</h1>
          <p className="text-gray-600">
            {pet.species} {pet.breed && `· ${pet.breed}`}
          </p>
          {pet.color && <p className="text-gray-500 text-sm">Color: {pet.color}</p>}

          {isLost && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 font-semibold">¡Esta mascota está perdida!</p>
              {activeReport?.description && (
                <p className="text-sm text-gray-700 mt-1">{activeReport.description}</p>
              )}
              {activeReport?.created_at && (
                <p className="text-xs text-gray-500 mt-1">
                  Reportado el {new Date(activeReport.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {ownerPhone && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-gray-700">
                📞 Teléfono de contacto: <strong>{ownerPhone}</strong>
              </p>
            </div>
          )}

          {/* Botón "Avisar al dueño" */}
          {isLost && (
            <button
              onClick={() => setShowNotifyModal(true)}
              className="mt-4 w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition"
            >
              📢 Avisar al dueño
            </button>
          )}

          {/* ============================================ */}
          {/* SECCIÓN: HISTORIAL CLÍNICO */}
          {/* ============================================ */}
          <div className="mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-brown-700">Historial clínico</h2>
              {canAddRecords && (
                <button
                  onClick={() => setShowClinicalForm(true)}
                  className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold hover:bg-orange-600 transition"
                >
                  + Agregar
                </button>
              )}
            </div>

            {sortedRecords.length === 0 ? (
              <p className="text-sm text-gray-400 mt-2">No hay registros clínicos aún.</p>
            ) : (
              <div className="space-y-2 mt-2">
                {sortedRecords.map((record: any) => (
                  <div key={record.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-semibold">{record.title}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {record.record_type}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(record.record_date).toLocaleDateString()}
                      </span>
                    </div>
                    {record.description && (
                      <p className="text-gray-600 text-xs mt-1">{record.description}</p>
                    )}
                    {(record.veterinarian_name || record.clinic_name) && (
                      <p className="text-xs text-gray-400 mt-1">
                        {record.veterinarian_name && `👨‍⚕️ ${record.veterinarian_name}`}
                        {record.clinic_name && ` · 🏥 ${record.clinic_name}`}
                      </p>
                    )}
                    {record.next_due_date && (
                      <p className="text-xs text-orange-500 mt-1">
                        🔄 Próxima: {new Date(record.next_due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* QR para compartir */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400 mb-2">Escanea este QR para ver esta página</p>
            <div className="inline-block bg-white p-2 rounded-lg shadow">
              <QRCodeSVG value={window.location.href} size={128} />
            </div>
          </div>

          {pet.profiles?.full_name && (
            <p className="mt-4 text-xs text-gray-400 text-center">
              Registrado por: {pet.profiles.full_name}
            </p>
          )}
        </div>
      </div>

      {/* Modal: Avisar al dueño */}
      {showNotifyModal && (
        <NotifyOwnerModal
          petId={pet.id}
          onClose={() => setShowNotifyModal(false)}
          onSuccess={() => {
            setShowNotifyModal(false)
            alert('✅ Aviso enviado al dueño. ¡Gracias por ayudar!')
          }}
        />
      )}

      {/* Modal: Agregar registro clínico */}
      {showClinicalForm && (
        <ClinicalRecordForm
          petId={pet.id}
          onSuccess={() => {
            setShowClinicalForm(false)
            // Recargar los datos de la mascota para mostrar el nuevo registro
            window.location.reload()
          }}
          onCancel={() => setShowClinicalForm(false)}
        />
      )}
    </div>
  )
}