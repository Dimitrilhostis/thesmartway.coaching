'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Speech } from 'lucide-react'

const supabase = createClient()

export default function LoginPage() {
  const [view, setView] = useState<'signup' | 'login'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  function switchView(v: 'signup' | 'login') {
    setView(v); setError(''); setEmail(''); setPassword('')
  }

  async function handleLogin() {
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email ou mot de passe incorrect.'); setLoading(false); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Erreur de session.'); setLoading(false); return }
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
    await new Promise(r => setTimeout(r, 300))
    window.location.href = profile?.role === 'admin' ? '/dashboard' : '/espace'
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <h1 className="font-display text-4xl tracking-widest text-cream text-glow">
            THE <span className="text-accent">SMART</span> WAY
          </h1>
          <p className="text-muted text-sm mt-2">Coaching fitness & nutrition</p>
        </div>

        {view === 'signup' && (
          <div style={{ animation: 'fadeSlideIn .25s ease' }}>
            <div className="glass shadow-glass p-6 md:p-7 flex flex-col gap-5 mb-4">
              <div>
                <h2 className="font-display text-2xl tracking-wide text-cream mb-1">COMMENCER</h2>
                <p className="text-xs text-muted leading-relaxed">
                  Remplis le formulaire de candidature en 3 minutes. Réponse sous 24h.
                </p>
              </div>
              <Link href="/rejoindre" className="btn-primary py-3.5 text-sm w-full text-center rounded-xl">
                Remplir le formulaire →
              </Link>
              <p className="text-xs text-dim text-center">Bilan gratuit · Sans engagement</p>
            </div>
            <button onClick={() => switchView('login')}
              className="w-full glass border border-accent/10 py-4 rounded-2xl text-center group transition-all hover:border-accent/25 active:scale-[0.98]">
              <p className="text-sm text-muted group-hover:text-cream transition-colors">Déjà client The Smart Way ?</p>
              <p className="text-xs text-accent mt-1">Se connecter →</p>
            </button>
          </div>
        )}

        {view === 'login' && (
          <div style={{ animation: 'fadeSlideIn .25s ease' }}>
            <div className="glass shadow-glass p-6 md:p-7 flex flex-col gap-4 mb-4">
              <h2 className="font-display text-2xl tracking-wide text-cream">MON ESPACE</h2>
              <button onClick={handleGoogle} disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 btn-ghost py-3 rounded-xl text-sm font-medium">
                {googleLoading
                  ? <span className="w-4 h-4 border-2 border-muted border-t-cream rounded-full animate-spin" />
                  : <GoogleIcon />}
                Continuer avec Google
              </button>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-accent/10" />
                <span className="text-xs text-dim">ou</span>
                <div className="flex-1 h-px bg-accent/10" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted uppercase tracking-widest pl-1">Email</label>
                <input type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="ton@email.com" autoFocus
                  style={{ fontSize: '16px' }}
                  className="glass-input px-4 py-3 w-full" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-muted uppercase tracking-widest pl-1">Mot de passe</label>
                <input type="password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  placeholder="••••••••"
                  style={{ fontSize: '16px' }}
                  className="glass-input px-4 py-3 w-full" />
              </div>
              {error && (
                <div className="glass-light px-4 py-2.5 text-sm text-danger border border-danger/20 rounded-xl">
                  {error}
                </div>
              )}
              <button onClick={handleLogin} disabled={loading} className="btn-primary py-3.5 text-sm w-full mt-1">
                {loading
                  ? <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                      Connexion...
                    </span>
                  : 'Se connecter'}
              </button>
            </div>
            <button onClick={() => switchView('signup')}
              className="w-full glass border border-accent/10 py-4 rounded-2xl text-center group transition-all hover:border-accent/25 active:scale-[0.98]">
              <p className="text-sm text-muted group-hover:text-cream transition-colors">Pas encore de compte ?</p>
              <p className="text-xs text-accent mt-1">Commencer mon suivi →</p>
            </button>
          </div>
        )}
      </div>

        {/* Contact */}
      <Link href="/contact" className="mt-6 text-xs flex text-muted border-muted hover:border-b tracking-wide"><Speech className='h-4 w-4 mr-2'/> Contacter le coach</Link>

        {/* Accueil */}
      <Link href="/" className="fixed bottom-8 text-xs text-dim hover:text-muted transition-colors tracking-wide">Revenir à l’accueil</Link>
      
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}