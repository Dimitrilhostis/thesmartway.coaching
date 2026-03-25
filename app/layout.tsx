import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'The Smart Way | Coaching Fitness, Nutrition & Performance',

  description:
    'Transforme ton corps et ton esprit avec un coaching sur mesure. Programmes personnalisés, nutrition optimisée, suivi complet. Rejoins The Smart Way.',

  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png' },
    ],
  },

  keywords: [
    'coaching sportif',
    'nutrition',
    'fitness',
    'programme personnalisé',
    'coach en ligne',
    'remise en forme',
    'musculation',
    'perte de poids',
    'prise de masse',
    'performance'
  ],

  authors: [{ name: 'The Smart Way' }],

  creator: 'The Smart Way',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
