import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../core/config/supabase.client'
import { Loader } from '../../shared/ui/Loader'
import { QRCodeSVG } from 'qrcode.react'
import { NotifyOwnerModal } from './components/NotifyOwnerModal'
import { ClinicalRecordForm } from '../clinical/ClinicalRecordForm'
import { useAuth } from '../../core/hooks/useAuth'
import { ConfirmModal } from '../../shared/ui/ConfirmModal'

export const PublicPetProfile = () => {
  const { hash } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [pet, setPet] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showNotifyModal, setShowNotifyModal] = useState(false)
  const [showClinicalForm, setShowClinicalForm] = useState(false)
  const [activeReport, setActiveReport] = useState<any>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null) // ✅ Nuevo estado

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    type: 'record' | 'pet'
    recordId?: string
  }>({ isOpen: false, type: 'record' })

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
            stray_reports (
              reporter_id
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
  if (error) return <div className="p-4 text-red-500 text-center">{error}</div>
  if (!pet) return <div className="p-4 text-center">Mascota no Encontrada</div>

  const isLost = !!activeReport
  const ownerPhone = activeReport?.phone_public && pet.profiles?.phone ? pet.profiles.phone : null
  const isOwner = user?.id === pet.owner_id
  const isReporter = user?.id === pet.stray_reports?.[0]?.reporter_id
  const canEdit = isOwner || isReporter || user?.user_metadata?.role === 'vet'

  const clinicalRecords = pet.clinical_records || []
  const sortedRecords = [...clinicalRecords].sort(
    (a, b) => new Date(b.record_date).getTime() - new Date(a.record_date).getTime()
  )

  const handleBack = () => {
    if (user) {
      navigate('/my-pets')
    } else {
      navigate('/')
    }
  }

  const handleDeleteRecord = async (recordId: string) => {
    try {
      const { error } = await supabase
        .from('clinical_records')
        .delete()
        .eq('id', recordId)
      if (error) throw error
      alert('✅ Registro eliminado')
      window.location.reload()
    } catch (err: any) {
      alert('Error al eliminar: ' + err.message)
    }
  }

  const handleDeletePet = async () => {
    try {
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', pet.id)
      if (error) throw error
      alert('✅ Perfil eliminado')
      navigate('/my-pets')
    } catch (err: any) {
      alert('Error al eliminar: ' + err.message)
    }
  }

  // ✅ Marcar como encontrado
  const handleMarkAsFound = async () => {
    if (!activeReport) return
    if (!window.confirm('¿Ya encontraste a tu mascota? Esto marcará el reporte como resuelto.')) return

    try {
      const { error } = await supabase
        .from('lost_reports')
        .update({ status: 'resuelto' })
        .eq('id', activeReport.id)

      if (error) throw error

      alert('✅ ¡Mascota encontrada! El reporte ha sido cerrado.')
      window.location.reload()
    } catch (err: any) {
      alert('Error al marcar como encontrado: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100/90 to-gray-200/90 p-4 flex flex-col items-center">
      <div className="w-full max-w-md">
        <div className="bg-gray-100/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border-2 border-azul-turquesa relative pt-12">
          {/* Botón de retroceso */}
          <button
            onClick={handleBack}
            className="absolute top-2 left-2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-naranja-brillante hover:bg-naranja-brillante hover:text-white transition-all duration-200 border border-naranja-suave/30 hover:border-naranja-brillante"
            aria-label="Volver"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Foto y estado (clickeable) */}
          <div
            className="relative h-48 bg-gray-200 rounded-xl overflow-hidden border-2 border-azul-turquesa mt-2 cursor-pointer"
            onClick={() => pet.image_url && setSelectedImage(pet.image_url)}
          >
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

          <div className="mt-4">
            <h1 className="text-2xl font-bold text-center text-gray-800">
              {pet.name}
            </h1>
            <p className="text-center text-gray-600">
              {pet.species} {pet.breed && `· ${pet.breed}`}
            </p>
            {pet.color && <p className="text-center text-gray-500 text-sm">Color: {pet.color}</p>}

            {/* Recuadro de "Esta mascota está perdida" con botón "Ya lo encontré" */}
            {isLost && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 relative">
                <p className="text-red-700 font-semibold">¡Esta mascota está perdida!</p>
                {activeReport?.description && (
                  <p className="text-sm text-gray-700 mt-1">{activeReport.description}</p>
                )}
                {activeReport?.created_at && (
                  <p className="text-xs text-gray-500 mt-1">
                    Reportado el {new Date(activeReport.created_at).toLocaleDateString()}
                  </p>
                )}

                {isOwner && (
                  <button
                    onClick={handleMarkAsFound}
                    className="absolute top-2 right-2 bg-verde-esmeralda text-white text-xs font-bold px-3 py-1 rounded-full hover:bg-green-600 transition shadow-sm"
                  >
                    ✅ Ya Lo Encontré
                  </button>
                )}
              </div>
            )}

            {ownerPhone && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-gray-700">
                  📞 Teléfono de Contacto: <strong>{ownerPhone}</strong>
                </p>
              </div>
            )}

            {isLost && (
              <button
                onClick={() => setShowNotifyModal(true)}
                className="mt-4 w-full bg-naranja-brillante text-white py-2 rounded-lg font-bold hover:bg-naranja-suave transition"
              >
                📢 Avisar al Dueño
              </button>
            )}

            {/* Historial Clínico */}
            <div className="mt-6">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h2 className="text-lg font-bold text-gray-800">Historial Clínico</h2>
                <div className="flex gap-2">
                  {canEdit && (
                    <>
                      <button
                        onClick={() => setShowClinicalForm(true)}
                        className="bg-azul-turquesa text-white px-3 py-1 rounded-full text-sm font-bold hover:bg-azul-fuerte transition"
                      >
                        Agregar
                      </button>
                      <button
                        onClick={() => setConfirmModal({ isOpen: true, type: 'pet' })}
                        className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold hover:bg-red-600 transition"
                      >
                        Eliminar Perfil
                      </button>
                    </>
                  )}
                </div>
              </div>

              {sortedRecords.length === 0 ? (
                <p className="text-sm text-gray-400 mt-2">No hay registros clínicos aún.</p>
              ) : (
                <div className="space-y-2 mt-2">
                  {sortedRecords.map((record: any) => (
                    <div key={record.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm relative group pb-8">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-semibold text-gray-800">{record.title}</span>
                          <span className="text-xs text-gray-500 ml-2">{record.record_type}</span>
                        </div>
                        <span className="text-xs font-bold text-gray-800">
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
                      {canEdit && (
                        <button
                          onClick={() => setConfirmModal({ isOpen: true, type: 'record', recordId: record.id })}
                          className="absolute bottom-2 right-2 text-gray-400 hover:text-red-500 transition"
                          title="Eliminar Registro"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* QR */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400 mb-2">Escaneá el QR para ver los datos</p>
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
      </div>

      {/* Modales */}
      {showNotifyModal && (
        <NotifyOwnerModal
          petId={pet.id}
          onClose={() => setShowNotifyModal(false)}
          onSuccess={() => {
            setShowNotifyModal(false)
            alert('✅ Aviso enviado al Dueño. ¡Gracias por ayudar!')
          }}
        />
      )}

      {showClinicalForm && (
        <ClinicalRecordForm
          petId={pet.id}
          onSuccess={() => {
            setShowClinicalForm(false)
            window.location.reload()
          }}
          onCancel={() => setShowClinicalForm(false)}
        />
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.type === 'record' ? 'Eliminar Registro' : 'Eliminar Perfil'}
        message={
          confirmModal.type === 'record'
            ? '¿Estás seguro de eliminar este Registro Clínico?'
            : '¿Estás seguro de eliminar este Perfil? Se perderán todos los datos (historial, reportes, etc.).'
        }
        onConfirm={() => {
          if (confirmModal.type === 'record' && confirmModal.recordId) {
            handleDeleteRecord(confirmModal.recordId)
          } else if (confirmModal.type === 'pet') {
            handleDeletePet()
          }
          setConfirmModal({ isOpen: false, type: 'record' })
        }}
        onCancel={() => setConfirmModal({ isOpen: false, type: 'record' })}
      />

      {/* ============================================
          MODAL PARA VER LA IMAGEN COMPLETA
          ============================================ */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Vista completa"
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl border-2 border-azul-turquesa"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-3 -right-3 bg-white rounded-full w-8 h-8 flex items-center justify-center text-gray-800 hover:bg-gray-100 transition shadow-lg text-xl"
              aria-label="Cerrar imagen"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  )
}