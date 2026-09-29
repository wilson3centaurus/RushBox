/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{html,js}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ec',
          100: '#fdecd3',
          200: '#fad5a5',
          300: '#f7b96d',
          400: '#f39c12', // Main orange
          500: '#e67e22',
          600: '#d35400',
          700: '#b7472a',
          800: '#92542a',
          900: '#744725',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#2c3e50', // Main dark
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      }
    },
  },
  plugins: [],
}
