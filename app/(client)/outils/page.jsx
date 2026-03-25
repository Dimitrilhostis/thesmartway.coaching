import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const TOOLS = [
  {
    id: 'timer',
    label: 'Timer',
    description: 'Chronomètre, minuteur et intervalles (Pomodoro) pour structurer tes séances.',
    icon: '⏱',
    href: '/outils/timer',
    clientOnly: true,
  },
  {
    id: 'calculateur-macro',
    label: 'Calculateur de macros',
    description: 'Calcule tes besoins en protéines, glucides et lipides selon ton objectif.',
    icon: '🥗',
    href: '/outils/macros',
    clientOnly: true,
    comingSoon: true,
  }
]

export default async function OutilsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isClient = false
  if (user) {
    const { data: client } = await supabase
      .from('clients')
      .select('status')
      .eq('user_id', user.id)
      .single()

    isClient = client?.status === 'active'
  }

  return (
    <div>
      {/* Header */}
      <div className="px-6 pt-8 pb-5 border-b border-accent/10">
        <h1 className="font-display text-4xl tracking-wide text-cream">OUTILS</h1>
        <p className="text-muted text-sm mt-1">
          Des outils conçus pour optimiser ton entraînement et ta nutrition
        </p>

        {!user && (
          <div className="mt-4 glass-light inline-flex items-center gap-2 px-4 py-2 rounded-xl">
            <span className="text-xs text-muted">
              🔒 Certains outils sont réservés aux clients avec suivi perso.
            </span>
            <Link href="/login" className="text-xs text-accent hover:underline">
              Se connecter →
            </Link>
          </div>
        )}

        {user && !isClient && (
          <div className="mt-4 glass-light inline-flex items-center gap-2 px-4 py-2 rounded-xl">
            <span className="text-xs text-muted">
              🔒 Certains outils nécessitent un suivi perso actif.
            </span>
            <Link href="/boutique" className="text-xs text-accent hover:underline">
              Voir les programmes →
            </Link>
          </div>
        )}
      </div>

      {/* Grille */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
        {TOOLS.map((tool) => {
          const locked = tool.clientOnly && !isClient
          const soon = tool.comingSoon
          const disabled = locked || soon

          const cardClassName = `
            glass shadow-glass overflow-hidden border border-accent/10
            transition-all duration-200
            ${disabled ? 'opacity-70' : 'group cursor-pointer hover:-translate-y-[2px]'}
          `

          const content = (
            <>
              {/* Thumb */}
              <div className="h-28 flex items-center justify-center relative bg-white/3">
                <span className="text-5xl">{tool.icon}</span>

                {locked && !soon && (
                  <span className="absolute top-2 right-2 glass-pill text-xs px-2.5 py-0.5 text-amber-400 border-amber-500/25">
                    🔒 Clients uniquement
                  </span>
                )}

                {soon && (
                  <span className="absolute top-2 right-2 glass-pill text-xs px-2.5 py-0.5 text-muted">
                    Bientôt
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="p-4 border-t border-accent/10">
                <h3 className="text-sm font-medium text-cream mb-1">{tool.label}</h3>
                <p className="text-xs text-muted leading-relaxed mb-4">{tool.description}</p>

                {soon ? (
                  <span className="text-xs text-dim">En développement</span>
                ) : locked ? (
                  <span className="text-xs text-amber-400/70">
                    Réservé aux clients avec suivi perso
                  </span>
                ) : (
                  <span className="text-xs text-accent transition-colors hover:text-cream   ">
                    Ouvrir →
                  </span>
                )}
              </div>
            </>
          )

          if (disabled) {
            return (
              <div key={tool.id} className={cardClassName}>
                {content}
              </div>
            )
          }

          return (
            <Link
              key={tool.id}
              href={tool.href}
              className={cardClassName}
            >
              {content}
            </Link>
          )
        })}
      </div>
    </div>
  )
}