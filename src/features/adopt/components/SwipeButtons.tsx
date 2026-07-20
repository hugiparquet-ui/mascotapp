export const SwipeButtons = ({ onLike, onDislike }: { onLike: () => void, onDislike: () => void }) => {
  return (
    <div className="flex justify-center gap-6 mt-6">
      <button onClick={onDislike} className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center text-red-500 text-3xl border-2 border-red-200 hover:bg-red-50 transition">✕</button>
      <button onClick={onLike} className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center text-green-500 text-3xl border-2 border-green-200 hover:bg-green-50 transition">♥</button>
    </div>
  )
}