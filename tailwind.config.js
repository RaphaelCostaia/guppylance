/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Tons escuros/neutros (preto Boroski)
        abyss: {
          50: '#f7f5f0',
          100: '#ece8de',
          200: '#d9d1bf',
          300: '#bcae8f',
          400: '#9c8a64',
          500: '#7e6d4b',
          600: '#62543a',
          700: '#483e2c',
          800: '#2b261d',
          900: '#171511',
          950: '#0a0907',
        },
        // Dourado Boroski (acento)
        coral: {
          50: '#fdf8ea',
          100: '#f9edc6',
          200: '#f2da8c',
          300: '#e9c45a',
          400: '#ddae3a',
          500: '#c99526',
          600: '#a5761b',
          700: '#7f5916',
        },
      },
      fontFamily: {
        display: ['"Cinzel"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(10,9,7,0.04), 0 8px 24px -12px rgba(10,9,7,0.18)',
        lift: '0 2px 4px rgba(10,9,7,0.06), 0 20px 40px -16px rgba(10,9,7,0.28)',
      },
    },
  },
  plugins: [],
}
