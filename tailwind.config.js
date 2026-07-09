/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mascota: {
          claro: '#FFFDF9',  // Fondo crema limpio
          pastel: '#FFB37E', // Naranja suave/pastel principal
          rosa: '#FFD3D3',   // Detalles en rosa pastel
          texto: '#4A3E3D',  // Marrón oscuro suave para las letras
        }
      }
    },
  },
  plugins: [],
}
