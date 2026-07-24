export const SwipeButtons = ({ onLike, onDislike }: { onLike: () => void; onDislike: () => void }) => {
  return (
    <div className="flex justify-center gap-8 mt-6">
      <button
        onClick={onDislike}
        className="w-16 h-16 rounded-full bg-danger text-white text-3xl border-2 border-danger shadow-xl hover:bg-red-600 hover:scale-110 transition-all duration-200 flex items-center justify-center"
      >
        ✕
      </button>
      <button
        onClick={onLike}
        className="w-16 h-16 rounded-full bg-success text-white text-3xl border-2 border-success shadow-xl hover:bg-green-600 hover:scale-110 transition-all duration-200 flex items-center justify-center"
      >
        ♥
      </button>
    </div>
  )
}