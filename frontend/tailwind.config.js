/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        logique: {
          yellow: '#FFD100',
          hover: '#E6BC00',
          navy: '#0B132B',
          card: '#162238',
          border: 'rgba(51, 65, 85, 0.6)',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
