/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 🟠 Naranjas
        naranja: {
          brillante: '#FF7A21',
          suave: '#FF9E43',
        },
        // 🔵 Azules
        azul: {
          fuerte: '#00BFFF',
          turquesa: '#26D9E7',
        },
        // 🟢 Verdes
        verde: {
          esmeralda: '#009975',
          aguamarina: '#2EC6AA',
        },
        // ⚫ Fondos
        fondo: {
          negro: '#000000',
          marron: '#3B2F2F',
        },
        // ⚪ Blanco
        blanco: '#FFFFFF',
        // 🔴 Rojo (para peligro/eliminar)
        danger: '#fd3f14',
        // 🟢 Verde éxito (para acciones positivas)
        success: '#48dd9f',
        // 🟡 Amarillo (para advertencias)
        warning: '#fdac2c',
      },
    },
  },
  plugins: [],
}