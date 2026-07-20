const CAFECITO_URL = 'https://cafecito.app/tu_usuario'  // Cambiar por tu link
const MERCADO_PAGO_URL = 'https://link.mercadopago.com.ar/tu_usuario' // Cambiar por tu link

export const DonationButton = () => {
  return (
    <div className="flex flex-col items-center gap-2 w-full">
      <p className="text-sm text-gray-500">¿Te gusta Mascotapp? ¡Apoyanos!</p>
      <div className="flex gap-3 w-full">
        <a
          href={CAFECITO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-yellow-400 text-black px-4 py-2 rounded-full font-bold hover:bg-yellow-500 transition text-center text-sm flex items-center justify-center gap-2"
        >
          ☕ Cafecito
        </a>
        <a
          href={MERCADO_PAGO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-full font-bold hover:bg-blue-600 transition text-center text-sm flex items-center justify-center gap-2"
        >
          💳 Mercado Pago
        </a>
      </div>
    </div>
  )
}