/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: {
          light: '#F5F6FA',
          dark: '#0F0F13',
        },
        card: {
          light: '#FFFFFF',
          dark: '#1A1A24',
        },
        sidebar: {
          light: '#FFFFFF',
          dark: '#15151F',
        },
        header: {
          light: '#FFFFFF',
          dark: '#15151F',
        },
        text: {
          primary: {
            light: '#18181B',
            dark: '#F4F4F6',
          },
          secondary: {
            light: '#71717A',
            dark: '#8B8B9E',
          },
        },
        border: {
          light: '#E8E8EE',
          dark: '#2A2A38',
        },
        accent: {
          light: '#6366F1',
          dark: '#818CF8',
        },
        revenue: {
          light: '#10B981',
          dark: '#34D399',
        },
        expense: {
          light: '#F43F5E',
          dark: '#FB7185',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
}
