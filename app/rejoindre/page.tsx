'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
type Step = 1 | 2 | 3

interface FormData {
  full_name: string; email: string; phone: string; sex: string
  weight_kg: string; height_cm: string; goal: string; level: string
  sports: string; availability: string; lifestyle: string; schedule: string
  food_relation: string; medical: string; password: string; password_confirm: string
}

const INITIAL: FormData = {
  full_name: '', email: '', phone: '', sex: '', weight_kg: '', height_cm: '',
  goal: '', level: '', sports: '', availability: '',
  lifestyle: '', schedule: '', food_relation: '', medical: '',
  password: '', password_confirm: '',
}

const GOALS = ['Prise de masse', 'Perte de poids', 'Sèche / Définition', 'Endurance', 'Remise en forme', 'Compétition', 'Autre']
const LEVELS = ['Débutant (< 1 an)', 'Intermédiaire (1-3 ans)', 'Avancé (3-5 ans)', 'Expert (5+ ans)']
const SEXES = ['Homme', 'Femme', 'Non-binaire', 'Préfère ne pas préciser']

export default function RejoindreePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [error, setError] = useState('')
  const [emailExists, setEmailExists] = useState(false)

  function update(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
    if (field === 'email') setEmailExists(false)
  }

  async function handleNext() {
    setError('')
    if (step === 1) {
      if (!form.full_name.trim()) { setError('Ton prénom et nom sont requis.'); return }
      if (!form.email.trim() || !form.email.includes('@')) { setError('Un email valide est requis.'); return }
      if (!form.sex) { setError('Le sexe est requis.'); return }
      setCheckingEmail(true)
      const { data: existing } = await supabase
        .from('users').select('id').eq('email', form.email.trim().toLowerCase()).maybeSingle()
      setCheckingEmail(false)
      if (existing) { setEmailExists(true); setError('Cet email est déjà associé à un compte.'); return }
      setStep(2); return
    }
    if (step === 2) {
      if (!form.goal) { setError('Sélectionne ton objectif principal.'); return }
      if (!form.level) { setError('Sélectionne ton niveau.'); return }
      if (!form.sports.trim()) { setError('Indique tes 3 sports préférés.'); return }
      setStep(3); return
    }
    if (step === 3) {
      if (!form.password) { setError('Crée un mot de passe.'); return }
      if (form.password.length < 8) { setError('Mot de passe : 8 caractères minimum.'); return }
      if (form.password !== form.password_confirm) { setError('Les mots de passe ne correspondent pas.'); return }
      await submit()
    }
  }

  async function submit() {
    setLoading(true); setError('')
    const res = await fetch('/api/candidature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Une erreur est survenue.'); setLoading(false); return }
    await supabase.auth.signInWithPassword({ email: data.email, password: form.password })
    router.push('/')
  }

  const steps = [
    { n: 1, label: 'Identité' },
    { n: 2, label: 'Sport' },
    { n: 3, label: 'Accès' },
  ]

  return (
    <main className="min-h-screen min-h-dvh flex items-start md:items-center justify-center px-4 py-8 md:py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <Link href="/login" className="text-xs text-dim hover:text-accent transition-colors block mb-3">← Retour</Link>
          <h1 className="font-display text-3xl md:text-4xl tracking-widest text-cream text-glow">
            THE <span className="text-accent">SMART</span> WAY
          </h1>
          <p className="text-muted text-sm mt-1">Démarre ton suivi personnalisé</p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all ${
                step === s.n ? 'bg-accent/20 text-accent border border-accent/30'
                : step > s.n ? 'bg-accent/10 text-accent/60 border border-accent/15'
                : 'bg-white/5 text-dim border border-white/8'
              }`}>
                <span>{step > s.n ? '✓' : s.n}</span>
                <span>{s.label}</span>
              </div>
              {i < steps.length - 1 && <div className={`w-4 h-px ${step > s.n ? 'bg-accent/40' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <div className="glass shadow-glass p-5 md:p-7">

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-xl tracking-wide text-cream">TON IDENTITÉ</h2>
              <Field label="Nom complet *">
                <input type="text" value={form.full_name} onChange={e => update('full_name', e.target.value)}
                  placeholder="Prénom Nom" style={{ fontSize: '16px' }} className="glass-input px-4 py-3 text-sm w-full" />
              </Field>
              <Field label="Email *">
                <div className="relative">
                  <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                    placeholder="ton@email.com" style={{ fontSize: '16px' }}
                    className={`glass-input px-4 py-3 text-sm w-full ${emailExists ? 'border-danger/50' : ''}`} />
                  {checkingEmail && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className="w-3.5 h-3.5 border border-accent/40 border-t-accent rounded-full animate-spin block" />
                    </span>
                  )}
                </div>
                {emailExists && (
                  <div className="glass-light border border-danger/25 rounded-xl p-3.5 flex flex-col gap-2 mt-1">
                    <p className="text-sm text-danger font-medium">⚠ Déjà client The Smart Way</p>
                    <p className="text-xs text-muted">Cet email est déjà utilisé. Connecte-toi pour accéder à ton espace.</p>
                    <Link href="/login" className="btn-primary py-2 text-xs text-center rounded-lg mt-1">Se connecter →</Link>
                  </div>
                )}
              </Field>
              <Field label="Téléphone / WhatsApp">
                <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                  placeholder="+33 6 12 34 56 78" style={{ fontSize: '16px' }} className="glass-input px-4 py-3 text-sm w-full" />
              </Field>
              <Field label="Sexe *">
                <div className="grid grid-cols-2 gap-2">
                  {SEXES.map(s => (
                    <button key={s} type="button" onClick={() => update('sex', s)}
                      className={`px-3 py-2.5 rounded-xl text-xs transition-all ${
                        form.sex === s ? 'bg-accent/20 text-accent border border-accent/30' : 'btn-ghost'
                      }`}>{s}</button>
                  ))}
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Poids (kg)">
                  <input type="number" value={form.weight_kg} onChange={e => update('weight_kg', e.target.value)}
                    placeholder="70" style={{ fontSize: '16px' }} className="glass-input px-4 py-3 text-sm w-full" />
                </Field>
                <Field label="Taille (cm)">
                  <input type="number" value={form.height_cm} onChange={e => update('height_cm', e.target.value)}
                    placeholder="175" style={{ fontSize: '16px' }} className="glass-input px-4 py-3 text-sm w-full" />
                </Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-xl tracking-wide text-cream">SPORT & OBJECTIFS</h2>
              <Field label="Objectif principal *">
                <div className="grid grid-cols-2 gap-2">
                  {GOALS.map(g => (
                    <button key={g} type="button" onClick={() => update('goal', g)}
                      className={`px-3 py-2.5 rounded-xl text-xs transition-all text-left ${
                        form.goal === g ? 'bg-accent/20 text-accent border border-accent/30' : 'btn-ghost'
                      }`}>{g}</button>
                  ))}
                </div>
              </Field>
              <Field label="Niveau sportif *">
                <div className="flex flex-col gap-2">
                  {LEVELS.map(l => (
                    <button key={l} type="button" onClick={() => update('level', l)}
                      className={`px-3 py-2.5 rounded-xl text-xs text-left transition-all ${
                        form.level === l ? 'bg-accent/20 text-accent border border-accent/30' : 'btn-ghost'
                      }`}>{l}</button>
                  ))}
                </div>
              </Field>
              <Field label="Tes 3 sports préférés *">
                <input type="text" value={form.sports} onChange={e => update('sports', e.target.value)}
                  placeholder="ex: Musculation, Course à pied, Natation"
                  style={{ fontSize: '16px' }} className="glass-input px-4 py-3 text-sm w-full" />
              </Field>
              <Field label="Disponibilités">
                <textarea value={form.availability} onChange={e => update('availability', e.target.value)}
                  placeholder="ex: Lundi/Mercredi matin, Sam toute la journée"
                  rows={2} className="glass-input px-4 py-3 text-sm w-full resize-none" style={{ fontSize: '16px' }} />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-xl tracking-wide text-cream">MODE DE VIE & ACCÈS</h2>
              <Field label="Mode de vie actuel">
                <textarea value={form.lifestyle} onChange={e => update('lifestyle', e.target.value)}
                  placeholder="ex: Travail sédentaire, actif le weekend..."
                  rows={2} className="glass-input px-4 py-3 text-sm w-full resize-none" style={{ fontSize: '16px' }} />
              </Field>
              <Field label="Emploi du temps type">
                <textarea value={form.schedule} onChange={e => update('schedule', e.target.value)}
                  placeholder="ex: Lever 7h, boulot 9h-18h, dispo après 19h..."
                  rows={2} className="glass-input px-4 py-3 text-sm w-full resize-none" style={{ fontSize: '16px' }} />
              </Field>
              <Field label="Relation à la nourriture">
                <textarea value={form.food_relation} onChange={e => update('food_relation', e.target.value)}
                  placeholder="ex: Mange équilibré, végétarien, grignote..."
                  rows={2} className="glass-input px-4 py-3 text-sm w-full resize-none" style={{ fontSize: '16px' }} />
              </Field>
              <Field label="Antécédents médicaux">
                <textarea value={form.medical} onChange={e => update('medical', e.target.value)}
                  placeholder="ex: Douleurs genou, hernie discale, aucun..."
                  rows={2} className="glass-input px-4 py-3 text-sm w-full resize-none" style={{ fontSize: '16px' }} />
              </Field>
              <div className="h-px bg-accent/10" />
              <Field label="Mot de passe * (8 caractères min)">
                <input type="password" value={form.password} onChange={e => update('password', e.target.value)}
                  placeholder="••••••••" style={{ fontSize: '16px' }} className="glass-input px-4 py-3 text-sm w-full" />
              </Field>
              <Field label="Confirmer le mot de passe *">
                <input type="password" value={form.password_confirm} onChange={e => update('password_confirm', e.target.value)}
                  placeholder="Répète ton mot de passe" style={{ fontSize: '16px' }} className="glass-input px-4 py-3 text-sm w-full" />
                {form.password && form.password_confirm && (
                  <p className={`text-xs mt-1 ${form.password === form.password_confirm ? 'text-accent' : 'text-danger'}`}>
                    {form.password === form.password_confirm ? '✓ Correspondent' : '✗ Ne correspondent pas'}
                  </p>
                )}
              </Field>
              <p className="text-xs text-dim leading-relaxed">
                En envoyant, tu acceptes que tes informations soient transmises au coach The Smart Way.
              </p>
            </div>
          )}

          {error && !emailExists && (
            <div className="mt-4 glass-light px-4 py-2.5 text-sm text-danger border border-danger/20 rounded-xl">{error}</div>
          )}

          <div className="flex items-center justify-between mt-6">
            {step > 1
              ? <button type="button" onClick={() => { setStep((step - 1) as Step); setError('') }}
                  className="btn-ghost px-4 py-2.5 text-sm rounded-xl">← Retour</button>
              : <div />
            }
            <button type="button" onClick={handleNext}
              disabled={loading || checkingEmail || emailExists}
              className="btn-primary px-6 py-2.5 text-sm rounded-xl flex items-center gap-2 disabled:opacity-40">
              {loading || checkingEmail
                ? <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                : step < 3 ? 'Suivant →' : 'Envoyer 🎯'
              }
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-dim mt-4">Réponse sous 24h · Bilan gratuit</p>
      </div>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs text-muted uppercase tracking-wider pl-1">{label}</label>
      {children}
    </div>
  )
}