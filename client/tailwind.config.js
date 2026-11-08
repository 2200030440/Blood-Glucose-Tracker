/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7665E8',
          deep: '#5B4BC4',
          hover: '#6454D6',
          light: '#F0EDFF',
        },
        lavender: {
          DEFAULT: '#F0EDFF',
          soft: '#F6F4FF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          background: '#F8F9FD',
          subtle: '#F3F4FA',
        },
        accent: {
          pink: '#FCEBF3',
          'pink-deep': '#D6467B',
        },
        health: {
          success: '#2EAD83',
          'success-light': '#E9F8F3',
          warning: '#E9A23B',
          'warning-light': '#FEF7ED',
          danger: '#E45C70',
          'danger-light': '#FDF2F4',
        },
        content: {
          primary: '#20243A',
          secondary: '#85899D',
          muted: '#A5A9BC',
        },
        border: {
          DEFAULT: '#ECECF3',
          subtle: '#E2E3ED',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 12px -2px rgba(32, 36, 58, 0.04), 0 4px 20px -2px rgba(118, 101, 232, 0.05)',
        'card-hover': '0 8px 24px -4px rgba(32, 36, 58, 0.08), 0 6px 16px -2px rgba(118, 101, 232, 0.08)',
        'modal': '0 20px 40px -8px rgba(32, 36, 58, 0.16)',
        'dropdown': '0 10px 25px -5px rgba(32, 36, 58, 0.1), 0 8px 10px -6px rgba(32, 36, 58, 0.06)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}

