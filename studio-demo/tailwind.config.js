/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neural-dark': '#0A0E27',
        'neural-purple': '#1A0B2E',
        'neural-cyan': '#00FFF5',
        'neural-blue': '#00D9FF',
        'glass': 'rgba(255, 255, 255, 0.05)',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { 'box-shadow': '0 0 20px rgba(0, 255, 245, 0.3)' },
          '50%': { 'box-shadow': '0 0 40px rgba(0, 255, 245, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
