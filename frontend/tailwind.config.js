/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // RAO'S THRIFT Brand Identity Tokens
        brand: {
          bg: '#F2EFE8',         // Warm off-white
          fg: '#151515',         // Near-black
          accent: '#CCFF00',     // Acid lime
          neutral: '#787873',    // Concrete gray
          surface: '#FFFFFF',    // Pure surface white
          border: '#D6D3CD',     // Concrete border
          dark: '#0D0D0D',       // Underground dark
          card: '#ECE8DF',       // Elevated off-white card
          muted: '#9E9C96',      // Muted label
        },
        primary: {
          50: '#F7F6F3',
          100: '#EFECE5',
          200: '#DED9CE',
          300: '#CDC6B7',
          400: '#AFA490',
          500: '#787873',
          600: '#4A4A46',
          700: '#2E2E2C',
          800: '#1D1D1C',
          900: '#151515',
        },
        lime: {
          DEFAULT: '#CCFF00',
          50: '#F9FFE6',
          100: '#F3FFCC',
          200: '#E7FF99',
          300: '#DBFF66',
          400: '#CF3300',
          500: '#CCFF00',
          600: '#B5E600',
          700: '#8EB500',
          800: '#678400',
          900: '#405200',
        },
        accent: {
          DEFAULT: '#CCFF00',
          hover: '#B5E600',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Space Grotesk"', 'Impact', '"Arial Black"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        widest: '0.2em',
        mega: '0.3em',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      boxShadow: {
        'brutal': '4px 4px 0px #151515',
        'brutal-lime': '4px 4px 0px #CCFF00',
        'brutal-sm': '2px 2px 0px #151515',
      },
    },
  },
  plugins: [],
};
