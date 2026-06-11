/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        night: {
          900: '#030712',
          800: '#0a0f1e',
          700: '#0d1b2a',
          600: '#1a2744',
          500: '#243553',
        },
        gold: {
          300: '#fef08a',
          400: '#fde047',
          500: '#FFD700',
          600: '#F59E0B',
          700: '#D97706',
        },
        sapphire: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      animation: {
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.36,0.07,0.19,0.97) forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '60%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255,215,0,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255,215,0,0.7)' },
        },
      },
    },
  },
  plugins: [],
}
