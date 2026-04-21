import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Timer The Smart Way',
    short_name: 'Timer TSW',
    description: 'Timer d\'entraînement pour les clients de The Smart Way',
    start_url: '/outils/timer',
    scope: '/',
    display: 'standalone',
    background_color: '#1E1E1E',
    theme_color: '#1E1E1E',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}