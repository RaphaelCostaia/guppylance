/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        abyss: {
          50: '#eefbfb',
          100: '#d4f3f4',
          200: '#aee6ea',
          300: '#76d2da',
          400: '#38b4c1',
          500: '#1c98a7',
          600: '#1a7a8c',
          700: '#1b6272',
          800: '#1d515e',
          900: '#0b3a4a',
          950: '#062530',
        },
        coral: {
          50: '#fff3f0',
          100: '#ffe3dc',
          200: '#ffcabe',
          300: '#ffa591',
          400: '#ff7556',
          500: '#f9512d',
          600: '#e6361a',
          700: '#c22913',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(6,37,48,0.04), 0 8px 24px -12px rgba(6,37,48,0.18)',
        lift: '0 2px 4px rgba(6,37,48,0.06), 0 20px 40px -16px rgba(6,37,48,0.28)',
      },
    },
  },
  plugins: [],
}
