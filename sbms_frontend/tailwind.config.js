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
        background: 'var(--bg-primary)',
        card: 'var(--bg-card)',
        text: 'var(--text-primary)',
        textMuted: 'var(--text-muted)',
      },
      backgroundImage: {
        'accent-gradient': 'var(--accent-gradient)',
      },
      boxShadow: {
        neon: '0 0 15px rgba(0,255,255,0.6)',
      },
      animation: {
        pulseGlow: 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        borderRotate: 'borderRotate 4s linear infinite',
        blinkEligible: 'blinkEligible 1s ease-in-out 1',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: .5 },
        },
        borderRotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        blinkEligible: {
          '0%, 100%': { opacity: 1, borderColor: 'rgba(0, 255, 255, 0.1)' },
          '50%': { opacity: 0.8, borderColor: 'rgba(0, 255, 255, 1)' },
        }
      }
    },
  },
  plugins: [],
}
