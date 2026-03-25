'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/lib/types'

export default function ClientNav({ user }: { user: User | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const links = [
    { href: '/espace',   label: 'Mon Espace', authRequired: true  },
    { href: '/outils',   label: 'Outils',     authRequired: false },
    { href: '/boutique', label: 'Boutique',   authRequired: false },
  ]

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? ''

  return (
    <>
      <nav className="glass-nav sticky top-0 z-50 h-14 flex items-center justify-between px-4 md:px-6">
        <Link href="/" className="font-display text-xl tracking-widest text-cream">
          THE <span className="text-accent">SMART</span> WAY
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(link => {
            if (link.authRequired && !user) return null
            return (
              <Link key={link.href} href={link.href}
                className={`px-3.5 py-1.5 rounded-xl text-sm transition-all ${
                  pathname.startsWith(link.href)
                    ? 'bg-accent/15 text-cream border border-accent/25'
                    : 'text-muted hover:text-cream hover:bg-white/5'
                }`}>
                {link.label}
              </Link>
            )
          })}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link href="/compte"
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all ${
                  pathname.startsWith('/compte') ? 'bg-accent/15 border border-accent/25' : 'hover:bg-white/5'
                }`}>
                <div className="w-7 h-7 rounded-full bg-sage/60 border border-accent/20 flex items-center justify-center text-xs font-medium text-cream">
                  {initials}
                </div>
                <span className="text-sm text-muted hover:text-cream transition-colors">Compte</span>
              </Link>
            </>
          ) : (
            <Link href="/login" className="btn-primary px-4 py-1.5 text-sm">Connexion</Link>
          )}
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Menu"
        >
          <span className={`block w-5 h-0.5 bg-cream transition-all duration-200 ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-cream transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-cream transition-all duration-200 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setOpen(false)}>
          <div
            className="absolute top-14 left-0 right-0 glass-dark border-b border-accent/10 px-4 py-4 flex flex-col gap-2"
            onClick={e => e.stopPropagation()}
          >
            {links.map(link => {
              if (link.authRequired && !user) return null
              return (
                <Link key={link.href} href={link.href}
                  onClick={() => setOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm transition-all ${
                    pathname.startsWith(link.href)
                      ? 'bg-accent/15 text-cream border border-accent/25'
                      : 'text-muted hover:text-cream hover:bg-white/5'
                  }`}>
                  {link.label}
                </Link>
              )
            })}

            <div className="h-px bg-accent/10 my-1" />

            {user ? (
              <>
                <Link href="/compte" onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm text-muted hover:text-cream hover:bg-white/5 transition-all flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-sage/60 border border-accent/20 flex items-center justify-center text-xs font-medium text-cream">
                    {initials}
                  </div>
                  Compte
                </Link>
                <button onClick={() => { setOpen(false); logout() }}
                  className="px-4 py-3 rounded-xl text-sm text-danger hover:bg-danger/10 transition-all text-left">
                  Déconnexion
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)}
                className="btn-primary px-4 py-3 text-sm text-center rounded-xl">
                Connexion
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  )
}