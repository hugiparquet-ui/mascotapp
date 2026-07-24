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
    if (!user) return setError('Debes Iniciar Sesión')
    setLoading(true)
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
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 border-2 border-azul-turquesa max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-center mb-4 text-gray-800">Agregar Registro Clínico</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={recordType}
            onChange={(e) => setRecordType(e.target.value)}
            className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black"
          >
            <option value="vacuna">Vacuna</option>
            <option value="desparasitacion">Desparasitación</option>
            <option value="consulta">Consulta</option>
            <option value="cirugia">Cirugía</option>
            <option value="alergia">Alergia</option>
            <option value="castracion">Castración</option>
            <option value="otro">Otro</option>
          </select>

          <input
            type="text"
            placeholder="Título *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black"
            required
          />

          <textarea
            placeholder="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black"
            rows={3}
          />

          <input
            type="text"
            placeholder="Veterinario (opcional)"
            value={veterinarianName}
            onChange={(e) => setVeterinarianName(e.target.value)}
            className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black"
          />

          <input
            type="text"
            placeholder="Clínica (opcional)"
            value={clinicName}
            onChange={(e) => setClinicName(e.target.value)}
            className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del Registro *</label>
            <input
              type="date"
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
              className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Próxima Fecha (opcional)</label>
            <input
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              className="w-full p-3 border-2 border-azul-turquesa rounded-lg focus:outline-none focus:ring-2 focus:ring-azul-fuerte focus:border-transparent text-black"
            />
          </div>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-azul-turquesa text-white py-2 rounded-lg font-bold hover:bg-azul-fuerte transition disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}