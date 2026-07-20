interface RatingDisplayProps {
  rating: number
  count?: number
  size?: 'sm' | 'md' | 'lg'
}

export const RatingDisplay = ({ rating, count = 0, size = 'md' }: RatingDisplayProps) => {
  const starSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-400">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-400">★</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300">★</span>
        ))}
      </div>
      <span className={`${starSizes[size]} font-medium text-gray-700 ml-1`}>
        {rating.toFixed(1)}
      </span>
      {count > 0 && (
        <span className={`${starSizes[size]} text-gray-400`}>
          ({count} {count === 1 ? 'valoración' : 'valoraciones'})
        </span>
      )}
    </div>
  )
}