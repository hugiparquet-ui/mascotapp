import { supabase } from '../config/supabase.client'

export interface Rating {
  id: string
  user_id: string
  target_id: string
  target_type: 'walker' | 'business'
  rating: number
  comment: string
  created_at: string
  profiles?: {
    full_name: string
  }
}

export const createRating = async (
  targetId: string,
  targetType: 'walker' | 'business',
  rating: number,
  comment: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return { success: false, error: 'Debes iniciar sesión' }

    const { error } = await supabase.from('valoraciones').insert({
      user_id: user.user.id,
      target_id: targetId,
      target_type: targetType,
      rating,
      comment: comment.trim() || null,
    })

    if (error) throw error
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export const getRatingsForTarget = async (
  targetId: string,
  targetType: 'walker' | 'business'
): Promise<Rating[]> => {
  try {
    const { data, error } = await supabase
      .from('valoraciones')
      .select(`
        *,
        profiles (
          full_name
        )
      `)
      .eq('target_id', targetId)
      .eq('target_type', targetType)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (err) {
    console.error('Error al obtener valoraciones:', err)
    return []
  }
}

export const getAverageRating = async (
  targetId: string,
  targetType: 'walker' | 'business'
): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('valoraciones')
      .select('rating')
      .eq('target_id', targetId)
      .eq('target_type', targetType)

    if (error) throw error
    if (!data || data.length === 0) return 0

    const sum = data.reduce((acc, r) => acc + r.rating, 0)
    return sum / data.length
  } catch (err) {
    console.error('Error al obtener promedio:', err)
    return 0
  }
}