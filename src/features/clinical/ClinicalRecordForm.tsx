import { useState } from 'react'
import { supabase } from '../../core/config/supabase.client'
import { useAuth } from '../../core/hooks/useAuth'

interface ClinicalRecordFormProps {
  petId: string
  onSuccess: () => void
  onCancel: () => void
}

export const ClinicalRecordForm = ({ petId, onSuccess, onCancel }: ClinicalRecordFormProps) => {
  const { user } = useAuth()
  const [recordType, setRecordType] = useState('vacuna')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [veterinarianName, setVeterinarianName] = useState('')
  const [clinicName, setClinicName] = useState('')
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0])
  const [nextDueDate, setNextDueDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('Debes iniciar sesión')
      return
    }
    if (!title.trim()) {
      setError('El título es obligatorio')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase
        .from('clinical_records')
        .insert({
          pet_id: petId,
          record_type: recordType,
          title: title.trim(),
          description: description.trim() || null,
          veterinarian_name: veterinarianName.trim() || null,
          clinic_name: clinicName.trim() || null,
          record_date: recordDate,
          next_due_date: nextDueDate || null,
          created_by: user.id,
        })

      if (error) throw error

      onSuccess()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Error al guardar el registro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Agregar registro clínico</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de registro *
            </label>
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              <option value="vacuna">💉 Vacuna</option>
              <option value="desparasitacion">🧪 Desparasitación</option>
              <option value="consulta">🩺 Consulta</option>
              <option value="cirugia">🔪 Cirugía</option>
              <option value="alergia">🤧 Alergia</option>
              <option value="castracion">⚕️ Castración</option>
              <option value="otro">📋 Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título *
            </label>
            <input
              type="text"
              placeholder="Ej: Vacuna antirrábica"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción (opcional)
            </label>
            <textarea
              placeholder="Detalles adicionales..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Veterinario (opcional)
            </label>
            <input
              type="text"
              placeholder="Nombre del veterinario"
              value={veterinarianName}
              onChange={(e) => setVeterinarianName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clínica (opcional)
            </label>
            <input
              type="text"
              placeholder="Nombre de la clínica"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha del registro *
            </label>
            <input
              type="date"
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Próxima fecha (opcional)
            </label>
            <input
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              ❌ {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-bold hover:bg-orange-600 transition disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}