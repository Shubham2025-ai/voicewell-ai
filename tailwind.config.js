/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'neon-green': '#00e87a',
        'neon-cyan': '#06b6d4',
        'glass': 'rgba(17, 17, 17, 0.6)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 232, 122, 0.3)',
        'glow-lg': '0 0 40px rgba(0, 232, 122, 0.5)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        '3d': '0 20px 50px rgba(0, 232, 122, 0.15)',
      },
      backdropFilter: {
        'blur': 'blur(20px)',
        'blur-xl': 'blur(30px)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow-pulse 2.5s ease-in-out infinite',
        'shimmer': 'shimmer-pro 2s infinite',
        'tilt': 'tilt-enter 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'card-flip': 'card-flip 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      transformStyle: {
        '3d': 'preserve-3d',
      },
      perspective: {
        '1200': '1200px',
      },
    },
  },
  plugins: [],
}
