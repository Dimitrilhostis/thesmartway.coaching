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
        forest:        '#1C2B1C',
        'forest-mid':  '#243324',
        'forest-light':'#2E4230',
        sage:          '#4A6741',
        'sage-light':  '#5C7D52',
        accent:        '#7BAF6E',
        cream:         '#EDF0E8',
        mist:          '#B8C9B0',
        muted:         '#8FA888',
        dim:           '#5A6E56',
        border:        'rgba(123,175,110,0.15)',
        'border-light':'rgba(123,175,110,0.25)',
        card:          'rgba(20,38,20,0.45)',
        'card-dark':   'rgba(13,22,13,0.60)',
        'card-dark-full': 'rgba(13,22,13)',
        danger:        '#D96B4E',
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
        glass:      '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        'glass-sm': '0 4px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)',
      },
    },
  },
  plugins: [],
}

export default config