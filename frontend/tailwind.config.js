/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: '#0D1117',
        darkCard: '#1F2937',
        accentOrange: '#F97316',
        accentOrangeLight: '#FB923C',
        neonBlue: '#3b82f6',
        neonPurple: '#8b5cf6',
      },
      boxShadow: {
        'neon-blue': '0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)',
        'neon-purple': '0 0 10px rgba(139, 92, 246, 0.5), 0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-orange': '0 0 15px rgba(249, 115, 22, 0.4), 0 0 30px rgba(249, 115, 22, 0.2)',
      },
      animation: {
        'border-flow': 'border-flow 3s linear infinite',
      },
      keyframes: {
        'border-flow': {
          '0%, 100%': { 'border-color': 'rgba(249, 115, 22, 0.2)' },
          '50%': { 'border-color': 'rgba(249, 115, 22, 1)' },
        }
      }
    },
  },
  plugins: [],
}
