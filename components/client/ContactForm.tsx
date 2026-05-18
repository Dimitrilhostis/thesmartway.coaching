'use client'

import { useState } from 'react'

type FormState = {
  firstName: string
  lastName: string
  email: string
  phone: string
  subject: string
  message: string
}

const initialState: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
}

const inputClass =
  'w-full rounded-xl border border-border bg-forest-mid/40 px-4 py-3 text-sm text-cream placeholder:text-dim outline-none transition focus:border-accent'

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setSuccess(null)
    setError(null)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Une erreur s'est produite.")
      setSuccess('Ton message a bien été envoyé.')
      setForm(initialState)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Impossible d'envoyer le message."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">

      {/* Prénom + Nom — toujours côte à côte */}
      <div className="flex gap-3">
        <input
          type="text"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          required
          placeholder="Prénom"
          className={inputClass}
        />
        <input
          type="text"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          required
          placeholder="Nom"
          className={inputClass}
        />
      </div>

      {/* Email */}
      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        required
        placeholder="Email"
        className={inputClass}
      />

      {/* Téléphone */}
      <input
        type="tel"
        name="phone"
        value={form.phone}
        onChange={handleChange}
        placeholder="Téléphone (optionnel)"
        className={inputClass}
      />

      {/* Sujet */}
      <select
        name="subject"
        value={form.subject}
        onChange={handleChange}
        required
        className={`${inputClass} ${!form.subject ? 'text-dim' : 'text-cream'}`}
      >
        <option value="" disabled>Type de demande</option>
        <option value="Massage">Massage</option>
        <option value="Coaching">Coaching</option>
        <option value="Nutrition">Nutrition</option>
        <option value="Produit / Ebook">Produit / Ebook</option>
        <option value="Autre">Autre</option>
      </select>

      {/* Message */}
      <textarea
        name="message"
        value={form.message}
        onChange={handleChange}
        required
        rows={5}
        placeholder="Ton message…"
        className={`${inputClass} resize-none`}
      />

      {success && (
        <div className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-cream">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-cream">
          {error}
        </div>
      )}
      <div className='flex justify-between items-center'>
      <button
        type="submit"
        disabled={loading}
        className="btn-primary py-3 px-5 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Envoi…' : 'Envoyer la demande'}
      </button>

          {/* petit retour */}
          <a
            href="/"
            className="text-xs text-dim hover:text-accent transition mt-6"
          >
            ← Retour au site
          </a>
          </div>
    </form>
  )
}