'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/lib/types'

export default function AdminNav({ user }: { user: User }) {
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
    { href: '/dashboard',      label: 'Vue d\'ensemble' },
    { href: '/clients',        label: 'Clients' },
    { href: '/admin/boutique', label: 'Boutique' },
  ]

  return (
    <>
      <nav className="glass-nav sticky top-0 z-50 h-14 flex items-center justify-between px-4 md:px-6">
        <Link href="/dashboard" className="font-display text-xl tracking-widest text-cream">
          THE <span className="text-accent">SMART</span> WAY
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(link => (
            <Link key={link.href} href={link.href}
              className={`px-3.5 py-1.5 rounded-xl text-sm transition-all ${
                pathname.startsWith(link.href)
                  ? 'bg-accent/15 text-cream border border-accent/25'
                  : 'text-muted hover:text-cream hover:bg-white/5'
              }`}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <span className="glass-pill text-xs text-accent px-3 py-1">Coach Admin</span>
          <button onClick={logout} className="text-xs text-dim hover:text-danger transition-colors">Quitter</button>
        </div>

        {/* Mobile burger */}
        <button onClick={() => setOpen(!open)}
          className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-white/5 transition-colors">
          <span className={`block w-5 h-0.5 bg-cream transition-all duration-200 ${open ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-cream transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-cream transition-all duration-200 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </nav>

      {open && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setOpen(false)}>
          <div className="absolute top-14 left-0 right-0 glass-dark border-b border-accent/10 px-4 py-4 flex flex-col gap-2"
            onClick={e => e.stopPropagation()}>
            {links.map(link => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm transition-all ${
                  pathname.startsWith(link.href)
                    ? 'bg-accent/15 text-cream border border-accent/25'
                    : 'text-muted hover:text-cream hover:bg-white/5'
                }`}>
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-accent/10 my-1" />
            <div className="flex items-center justify-between px-4 py-2">
              <span className="glass-pill text-xs text-accent px-3 py-1">Coach Admin</span>
              <button onClick={() => { setOpen(false); logout() }}
                className="text-sm text-danger">Déconnexion</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}