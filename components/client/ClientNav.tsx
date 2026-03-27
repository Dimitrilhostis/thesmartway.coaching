'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/lib/types'

export default function ClientNav({ user }: { user: User | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)

  const hiddenNavRoutes = ['/outils/timer']
  const shouldHideNav = hiddenNavRoutes.includes(pathname)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (shouldHideNav) return null

  async function logout() {
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/login')
    router.refresh()
  }

  const links = [
    { href: '/espace', label: 'Mon Espace', authRequired: true },
    { href: '/outils', label: 'Outils', authRequired: false },
    { href: '/boutique', label: 'Boutique', authRequired: false },
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
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-xl text-sm transition-all ${
                  pathname.startsWith(link.href)
                    ? 'bg-accent/15 text-cream border border-accent/25'
                    : 'text-muted hover:text-cream hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link
              href="/compte"
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all ${
                pathname.startsWith('/compte')
                  ? 'bg-accent/15 border border-accent/25'
                  : 'hover:bg-white/5'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-sage/60 border border-accent/20 flex items-center justify-center text-xs font-medium text-cream">
                {initials}
              </div>
              <span className="text-sm text-muted hover:text-cream transition-colors">
                Compte
              </span>
            </Link>
          ) : (
            <Link href="/login" className="btn-primary px-4 py-1.5 text-sm">
              Connexion
            </Link>
          )}
        </div>

        {/* Mobile burger */}
        <button
          onClick={() => setOpen(prev => !prev)}
          className="md:hidden relative z-[70] flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Menu"
          aria-expanded={open}
        >
          <span
            className={`block w-5 h-0.5 bg-cream transition-all duration-200 ${
              open ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-cream transition-all duration-200 ${
              open ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-cream transition-all duration-200 ${
              open ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </button>
      </nav>

      {/* Mobile fullscreen menu */}
      <div
        className={`md:hidden fixed inset-x-0 top-0 bottom-0 z-[40] transition-all duration-300 ${
          open
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/45 backdrop-blur-xl"
          onClick={() => setOpen(false)}
        />

        {/* Panel */}
        <div className="absolute inset-0 flex flex-col px-4 pt-[calc(3.5rem+1rem)] pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div
            className="glass-dark border border-accent/10 shadow-glass flex-1 rounded-[2rem] p-4 flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Top links */}
            <div className="flex flex-col gap-2">
              {links.map(link => {
                if (link.authRequired && !user) return null
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`w-full rounded-2xl px-4 py-4 text-base transition-all ${
                      pathname.startsWith(link.href)
                        ? 'bg-accent/15 text-cream border border-accent/25'
                        : 'text-muted hover:text-cream hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Bottom account / login */}
            <div className="pt-4 border-t border-accent/10">
              {user ? (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/compte"
                    onClick={() => setOpen(false)}
                    className={`w-full rounded-2xl px-4 py-4 text-base transition-all flex items-center gap-3 ${
                      pathname.startsWith('/compte')
                        ? 'bg-accent/15 text-cream border border-accent/25'
                        : 'text-muted hover:text-cream hover:bg-white/5'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-sage/60 border border-accent/20 flex items-center justify-center text-xs font-medium text-cream shrink-0">
                      {initials}
                    </div>
                    <span>Compte</span>
                  </Link>

                  <button
                    onClick={logout}
                    className="w-full rounded-2xl px-4 py-4 text-base text-left text-danger hover:bg-danger/10 transition-all"
                  >
                    Déconnexion
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="btn-primary w-full rounded-2xl px-4 py-4 text-base text-center"
                >
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}