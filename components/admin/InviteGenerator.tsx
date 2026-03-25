'use client'

import { useState } from 'react'

export default function InviteGenerator() {
  const [email, setEmail] = useState('')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [reused, setReused] = useState(false)

  async function generate() {
    if (!email.trim()) { setError('Entre un email.'); return }
    setLoading(true)
    setError('')
    setUrl('')

    const res = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Erreur')
      setLoading(false)
      return
    }

    setUrl(data.url)
    setReused(data.reused ?? false)
    setLoading(false)
  }

  async function copy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Générer le lien mailto pour envoyer directement
  const mailtoLink = url
    ? `mailto:${email}?subject=${encodeURIComponent('The Smart Way — Ton espace coaching')}&body=${encodeURIComponent(
        `Bonjour,\n\nTon accès à l'espace coaching The Smart Way est prêt.\n\nClique sur ce lien pour créer ton compte et remplir ton profil :\n${url}\n\nLe lien est valable 7 jours.\n\nÀ très vite,\nCoach Alex`
      )}`
    : ''

  return (
    <div className="glass shadow-glass p-5 max-w-lg">
      <h3 className="text-sm font-medium text-cream mb-1">Inviter un nouveau client</h3>
      <p className="text-xs text-muted mb-4">
        Génère un lien d'inscription personnalisé à envoyer par email.
      </p>

      <div className="flex gap-2 mb-3">
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); setUrl('') }}
          onKeyDown={e => e.key === 'Enter' && generate()}
          placeholder="email@duclient.com"
          className="glass-input flex-1 px-3.5 py-2 text-sm"
        />
        <button
          onClick={generate}
          disabled={loading}
          className="btn-primary px-4 py-2 text-sm shrink-0"
        >
          {loading ? '...' : 'Générer'}
        </button>
      </div>

      {error && (
        <p className="text-xs text-danger mb-3">{error}</p>
      )}

      {url && (
        <div className="flex flex-col gap-3">
          {reused && (
            <p className="text-xs text-amber-400">
              ⚠ Une invitation active existait déjà pour cet email — même lien renvoyé.
            </p>
          )}

          {/* Lien à copier */}
          <div className="glass-dark rounded-xl p-3 flex items-center gap-2">
            <p className="text-xs text-muted font-mono flex-1 truncate">{url}</p>
            <button
              onClick={copy}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all shrink-0 ${
                copied ? 'bg-accent/20 text-accent' : 'btn-ghost'
              }`}
            >
              {copied ? '✓ Copié' : 'Copier'}
            </button>
          </div>

          {/* Bouton mailto */}
          <a
            href={mailtoLink}
            className="btn-primary py-2.5 text-sm text-center rounded-xl flex items-center justify-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            Envoyer par email
          </a>

          <p className="text-xs text-dim text-center">Lien valable 7 jours</p>
        </div>
      )}
    </div>
  )
}