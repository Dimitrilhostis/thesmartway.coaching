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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || "Une erreur s'est produite.")
      }

      setSuccess('Ton message a bien été envoyé.')
      setForm(initialState)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'envoyer le message."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-cream mb-2">Prénom</label>
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-border bg-forest-mid/40 px-4 py-3 text-sm text-cream placeholder:text-dim outline-none transition focus:border-accent"
            placeholder="Ton prénom"
          />
        </div>

        <div>
          <label className="block text-sm text-cream mb-2">Nom</label>
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-border bg-forest-mid/40 px-4 py-3 text-sm text-cream placeholder:text-dim outline-none transition focus:border-accent"
            placeholder="Ton nom"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-cream mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-border bg-forest-mid/40 px-4 py-3 text-sm text-cream placeholder:text-dim outline-none transition focus:border-accent"
            placeholder="ton@email.com"
          />
        </div>

        <div>
          <label className="block text-sm text-cream mb-2">Téléphone</label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full rounded-xl border border-border bg-forest-mid/40 px-4 py-3 text-sm text-cream placeholder:text-dim outline-none transition focus:border-accent"
            placeholder="07 00 00 00 00"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-cream mb-2">Type de demande</label>
        <select
          name="subject"
          value={form.subject}
          onChange={handleChange}
          required
          className="w-full rounded-xl border border-border bg-forest-mid/40 px-4 py-3 text-sm text-cream outline-none transition focus:border-accent"
        >
          <option value="">Choisir</option>
          <option value="Coaching">Coaching</option>
          <option value="Nutrition">Nutrition</option>
          <option value="Massage">Massage</option>
          <option value="Produit / Ebook">Produit / Ebook</option>
          <option value="Autre">Autre</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-cream mb-2">Message</label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          required
          rows={7}
          className="w-full rounded-xl border border-border bg-forest-mid/40 px-4 py-3 text-sm text-cream placeholder:text-dim outline-none transition focus:border-accent resize-none"
          placeholder="Explique ta demande, ton besoin ou ton objectif."
        />
      </div>

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

      <button
        type="submit"
        disabled={loading}
        className="btn-primary py-3 px-5 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Envoi...' : 'Envoyer la demande'}
      </button>
    </form>
  )
}