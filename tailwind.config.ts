import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        },
        secondary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        accent: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        love: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
        }
      },
      fontFamily: {
        'display': ['Inter', 'system-ui', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'gradient': 'gradient 15s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'heart-beat': 'heartbeat 1.5s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'fade-in': 'fadeIn 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': {
            transform: 'translateY(0px) rotate(0deg)',
            opacity: '0.7'
          },
          '50%': {
            transform: 'translateY(-20px) rotate(180deg)',
            opacity: '1'
          }
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' }
        },
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        shimmer: {
          '0%': {
            'background-position': '-200px 0'
          },
          '100%': {
            'background-position': 'calc(200px + 100%) 0'
          }
        },
        heartbeat: {
          '0%': {
            transform: 'scale(1)',
          },
          '14%': {
            transform: 'scale(1.1)',
          },
          '28%': {
            transform: 'scale(1)',
          },
          '42%': {
            transform: 'scale(1.1)',
          },
          '70%': {
            transform: 'scale(1)',
          }
        },
        slideUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        slideDown: {
          '0%': {
            opacity: '0',
            transform: 'translateY(-20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        fadeIn: {
          '0%': {
            opacity: '0'
          },
          '100%': {
            opacity: '1'
          }
        },
        scaleIn: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.9)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)'
          }
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(236, 72, 153, 0.3)',
        'glow-lg': '0 0 40px rgba(236, 72, 153, 0.4)',
        'inner-glow': 'inset 0 2px 4px 0 rgba(236, 72, 153, 0.1)',
        'love': '0 4px 14px 0 rgba(236, 72, 153, 0.25)',
        'love-lg': '0 10px 25px -3px rgba(236, 72, 153, 0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'love-gradient': 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 25%, #fbcfe8 50%, #f9a8d4 75%, #f472b6 100%)',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [],
}
export default config
