import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        biryani: {
          50: '#fef9ee',
          100: '#fdf0d3',
          200: '#f9dea5',
          300: '#f5c66d',
          400: '#f0a633',
          500: '#ec8e14',
          600: '#dd720c',
          700: '#b7550c',
          800: '#924312',
          900: '#783812',
          950: '#411b07',
        },
        saffron: {
          50: '#fff8ed',
          100: '#fff0d4',
          200: '#fddda8',
          300: '#fcc471',
          400: '#f9a038',
          500: '#f78312',
          600: '#e86908',
          700: '#c04f09',
          800: '#993f10',
          900: '#7b3510',
          950: '#431906',
        },
        spice: {
          50: '#fdf3f3',
          100: '#fce4e4',
          200: '#fbcdcd',
          300: '#f6aaaa',
          400: '#ef7878',
          500: '#e34d4d',
          600: '#cf3030',
          700: '#ae2424',
          800: '#902121',
          900: '#782222',
          950: '#410d0d',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'pop-in': 'pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-up': 'slide-up 0.5s ease-out',
        'confetti': 'confetti 3s ease-in-out forwards',
        'crown-bounce': 'crown-bounce 1s ease-in-out infinite',
        'spotlight': 'spotlight 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(236, 142, 20, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(236, 142, 20, 0.6)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'confetti': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        'crown-bounce': {
          '0%, 100%': { transform: 'translateY(0) rotate(-5deg)' },
          '50%': { transform: 'translateY(-15px) rotate(5deg)' },
        },
        'spotlight': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.8' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
export default config;
