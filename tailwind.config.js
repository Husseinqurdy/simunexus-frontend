/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0B1C3D', 50: '#E8EDF5', 100: '#C5D1E8', 500: '#1A3A7A', 600: '#0B1C3D', 700: '#071430' },
        accent:  { DEFAULT: '#0EA5E9', 500: '#0EA5E9', 600: '#0284C7' },
        success: '#10B981',
        warning: '#F59E0B',
        danger:  '#EF4444',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      boxShadow: { card: '0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.06)' },
    },
  },
  plugins: [],
}
