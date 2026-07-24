import { motion, useMotionValue, useTransform } from 'framer-motion'
import type { PanInfo } from 'framer-motion'

interface SwipeCardProps {
  pet: {
    id: string
    name: string
    image_url: string
    species: string
    breed: string
    description: string
  }
  onSwipe: (direction: 'left' | 'right') => void
}

export const SwipeCard = ({ pet, onSwipe }: SwipeCardProps) => {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-30, 30])
  const opacity = useTransform(x, [-200, -50, 0, 50, 200], [0, 1, 1, 1, 0])

  const handleDragEnd = (event: MouseEvent | TouchEvent, info: PanInfo) => {
    const threshold = 100
    if (info.offset.x > threshold) {
      onSwipe('right')
    } else if (info.offset.x < -threshold) {
      onSwipe('left')
    } else {
      const animate = (x as any).animate
      animate({ x: 0, rotate: 0 }, { type: 'spring', stiffness: 500, damping: 20 })
    }
  }

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      className="relative w-full max-w-sm h-[500px] rounded-2xl shadow-2xl overflow-hidden bg-white border-2 border-naranja-suave"
    >
      <img
        src={pet.image_url || '/default-pet.png'}
        alt={pet.name}
        className="w-full h-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/default-pet.png'
        }}
      />
      {/* Contenedor de información con fondo degradado translúcido */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4 text-white">
        <h3 className="text-2xl font-bold text-naranja-brillante">{pet.name}</h3>
        <p className="text-sm text-azul-turquesa opacity-90">
          {pet.species} {pet.breed && `· ${pet.breed}`}
        </p>
        <p className="text-xs mt-1 text-gray-200">{pet.description}</p>
      </div>

      {/* Indicadores de like/dislike (más visibles) */}
      <motion.div
        className="absolute top-8 left-6 border-4 border-success text-success font-bold text-3xl px-4 py-2 rounded-lg rotate-[-20deg] bg-white/80 backdrop-blur-sm"
        style={{ opacity: useTransform(x, [50, 150], [0, 1]) }}
      >
        ME GUSTA
      </motion.div>
      <motion.div
        className="absolute top-8 right-6 border-4 border-danger text-danger font-bold text-3xl px-4 py-2 rounded-lg rotate-[20deg] bg-white/80 backdrop-blur-sm"
        style={{ opacity: useTransform(x, [-150, -50], [1, 0]) }}
      >
        NO
      </motion.div>
    </motion.div>
  )
}