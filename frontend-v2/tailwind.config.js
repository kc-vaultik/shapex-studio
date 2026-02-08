/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cyberpunk theme colors - Cyan/Green accents
        primary: {
          50: '#e0fffe',
          100: '#b3fcfb',
          200: '#80f9f8',
          300: '#4df6f5',
          400: '#26f4f2',
          500: '#00f1ef', // Main cyan
          600: '#00d9d7',
          700: '#00bfbd',
          800: '#00a5a3',
          900: '#007f7d',
        },
        accent: {
          50: '#e6ffe6',
          100: '#b3ffb3',
          200: '#80ff80',
          300: '#4dff4d',
          400: '#26ff26',
          500: '#00ff00', // Main green
          600: '#00e600',
          700: '#00cc00',
          800: '#00b300',
          900: '#008000',
        },
        dark: {
          50: '#f5f5f5',
          100: '#e0e0e0',
          200: '#c2c2c2',
          300: '#a3a3a3',
          400: '#858585',
          500: '#666666',
          600: '#525252',
          700: '#3d3d3d',
          800: '#292929',
          900: '#0a0a0a', // Main dark background
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 241, 239, 0.5), 0 0 10px rgba(0, 241, 239, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 241, 239, 0.8), 0 0 30px rgba(0, 241, 239, 0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
