import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest:           '#0E130E',
        'forest-mid':     '#141C14',
        'forest-light':   '#1C271C',
        sage:             '#1A4D2A',
        'sage-light':     '#245E35',
        accent:           '#4ADE80',
        cream:            '#F0F4F0',
        mist:             '#B0C4B0',
        muted:            '#78907A',
        dim:              '#475A48',
        border:           'rgba(255,255,255,0.08)',
        'border-light':   'rgba(255,255,255,0.14)',
        card:             'rgba(255,255,255,0.03)',
        'card-dark':      'rgba(0,0,0,0.42)',
        'card-dark-full': '#090D09',
        danger:           '#FF6B6B',
      },
      fontFamily: {
        display: ['Bebas Neue', 'sans-serif'],
        sans:    ['DM Sans', 'sans-serif'],
      },
      backdropBlur: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        glass:      '0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)',
        'glass-sm': '0 4px 20px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.04)',
      },
    },
  },
  plugins: [],
}

export default config
