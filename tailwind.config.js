/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold: '#F5A623',
        'gold-dark': '#D4901A',
        'gold-light': '#FFD080',
        dark: '#0A0A0A',
        surface: '#111111',
        card: '#1A1A1A',
        border: '#252525',
        'border-light': '#333333',
      },
      fontFamily: {
        sans: ['Barlow', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
