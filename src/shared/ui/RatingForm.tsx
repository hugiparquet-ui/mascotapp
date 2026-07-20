import { useState } from 'react'
import { supabase } from '../../core/config/supabase.client'
import { useAuth } from '../../core/hooks/useAuth'

interface RatingFormProps {
  targetId: string
  targetType: 'walker' | 'business'
  onSuccess: () => void
  onCancel: () => void
}

export const RatingForm = ({ targetId, targetType, onSuccess, onCancel }: RatingFormProps) => {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hoveredStar, setHoveredStar] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('Debes iniciar sesión para valorar')
      return
    }
    if (rating === 0) {
      setError('Selecciona una calificación')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.from('valoraciones').insert({
        user_id: user.id,
        target_id: targetId,
        target_type: targetType,
        rating,
        comment: comment.trim() || null,
      })

      if (error) throw error

      onSuccess()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Error al guardar la valoración')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Dejar una valoración</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center gap-1 text-3xl">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <span className={star <= (hoveredStar || rating) ? 'text-yellow-400' : 'text-gray-300'}>
                  ★
                </span>
              </button>
            ))}
          </div>

          <textarea
            placeholder="Comentario (opcional, máximo 300 caracteres)"
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 300))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
            rows={3}
            maxLength={300}
          />
          <p className="text-xs text-gray-400 text-right">{comment.length}/300</p>

          {error && <p className="text-red-500 text-sm">{error}</p>}

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
              {loading ? 'Guardando...' : 'Enviar valoración'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}