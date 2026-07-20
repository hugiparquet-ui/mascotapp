import { useNavigate } from 'react-router-dom'

export const BackButton = () => {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-1 text-gray-600 hover:text-orange-500 transition mb-2"
    >
      <span className="text-xl">←</span>
      <span className="text-sm">Volver</span>
    </button>
  )
}