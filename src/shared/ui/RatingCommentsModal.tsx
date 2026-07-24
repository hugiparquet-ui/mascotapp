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
      {/* ✅ Contenedor con altura máxima y scroll interno */}
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] flex flex-col shadow-2xl border-2 border-azul-turquesa">
        {/* ✅ Header fijo (sticky) con el botón de cerrar */}
        <div className="sticky top-0 bg-white rounded-t-2xl z-10 p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Valoraciones</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        {/* ✅ Contenido con scroll interno */}
        <div className="overflow-y-auto p-4 space-y-4 flex-1">
          {avgRating > 0 && (
            <div className="mb-2">
              <RatingDisplay rating={avgRating} count={comments.length} size="lg" />
            </div>
          )}

          {loading ? (
            <p className="text-gray-500">Cargando comentarios...</p>
          ) : comments.length === 0 ? (
            <p className="text-gray-400">No hay valoraciones aún.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="border-b border-gray-100 pb-3 last:border-0">
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
            ))
          )}
        </div>
      </div>
    </div>
  )
}