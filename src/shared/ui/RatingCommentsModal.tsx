import { useEffect, useState } from 'react'
import { supabase } from '../../core/config/supabase.client'
import { RatingDisplay } from './RatingDisplay'

interface RatingCommentsModalProps {
  targetId: string
  targetType: 'walker' | 'business'
  onClose: () => void
}

export const RatingCommentsModal = ({ targetId, targetType, onClose }: RatingCommentsModalProps) => {
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [avgRating, setAvgRating] = useState(0)

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from('valoraciones')
        .select('rating, comment, created_at, profiles(full_name)')
        .eq('target_id', targetId)
        .eq('target_type', targetType)
        .order('created_at', { ascending: false })

      if (!error) {
        setComments(data || [])
        // Calcular promedio localmente
        if (data && data.length > 0) {
          const sum = data.reduce((acc, curr) => acc + curr.rating, 0)
          setAvgRating(sum / data.length)
        }
      }
      setLoading(false)
    }
    fetchComments()
  }, [targetId, targetType])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Valoraciones</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
        </div>

        {avgRating > 0 && (
          <div className="mb-4">
            <RatingDisplay rating={avgRating} count={comments.length} size="lg" />
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">Cargando comentarios...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-400">No hay valoraciones aún.</p>
        ) : (
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="border-b border-gray-100 pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold">{c.profiles?.full_name || 'Anónimo'}</span>
                    <div className="text-yellow-400 text-sm">
                      {'★'.repeat(Math.round(c.rating))}
                      {'☆'.repeat(5 - Math.round(c.rating))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
                {c.comment && <p className="text-sm text-gray-600 mt-1">{c.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}