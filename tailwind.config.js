/** GSH design tokens — zinatokana na rangi za logo (navy, royal blue, orange, silver) */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#0A1F6B', 50: '#EAF1FD', 100: '#C4DBF1', 500: '#12348C', 600: '#0A1F6B', 700: '#071650' },
        accent:  { DEFAULT: '#0D52CE', 500: '#0D52CE', 600: '#0A42A8' },
        brand:   { orange: '#E37914', amber: '#F5BA2E', silver: '#CACDD3' },
        success: '#137A4E',
        warning: '#9A5B00',
        danger:  '#B92D2D',
        gray: {
          50: '#F5F7FC', 100: '#EBEFF8', 200: '#DCE3F0', 300: '#C3CEE2', 400: '#8D9BB8',
          500: '#667697', 600: '#4E5E82', 700: '#3A4A70', 800: '#2B3A60', 900: '#0A1F4D',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'] },
      boxShadow: { card: '0 1px 3px rgba(10,31,107,.08)', pop: '0 12px 32px rgba(10,31,107,.14)' },
      borderRadius: { DEFAULT: '8px', lg: '10px', xl: '12px' },
    },
  },
  plugins: [],
}
