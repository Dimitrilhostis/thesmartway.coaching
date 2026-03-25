'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

type Step = 1 | 2 | 3

interface FormData {
  // Étape 1 — Identité
  full_name: string
  email: string
  phone: string
  sex: string
  weight_kg: string
  height_cm: string
  // Étape 2 — Sport & objectifs
  goal: string
  level: string
  sports: string
  availability: string
  // Étape 3 — Mode de vie
  lifestyle: string
  schedule: string
  food_relation: string
  medical: string
  password: string
  password_confirm: string
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

export default function InvitePage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')
  const [invalid, setInvalid] = useState(false)

  // Vérifier le token
  useEffect(() => {
    async function checkToken() {
      const { data } = await supabase
        .from('invitations')
        .select('email, used, expires_at')
        .eq('token', token)
        .single()

      if (!data || data.used || new Date(data.expires_at) < new Date()) {
        setInvalid(true)
      } else {
        setForm(prev => ({ ...prev, email: data.email }))
      }
      setChecking(false)
    }
    checkToken()
  }, [token])

  function update(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  function validateStep(): boolean {
    if (step === 1) {
      if (!form.full_name.trim()) { setError('Ton prénom et nom sont requis.'); return false }
      if (!form.email.trim()) { setError('L\'email est requis.'); return false }
      if (!form.phone.trim()) { setError('Le téléphone est requis.'); return false }
      if (!form.sex) { setError('Le sexe est requis.'); return false }
    }
    if (step === 2) {
      if (!form.goal) { setError('Sélectionne ton objectif principal.'); return false }
      if (!form.level) { setError('Sélectionne ton niveau.'); return false }
      if (!form.sports.trim()) { setError('Indique tes 3 sports préférés.'); return false }
    }
    if (step === 3) {
      if (!form.password) { setError('Crée un mot de passe.'); return false }
      if (form.password.length < 8) { setError('Mot de passe : 8 caractères minimum.'); return false }
      if (form.password !== form.password_confirm) { setError('Les mots de passe ne correspondent pas.'); return false }
    }
    return true
  }

  async function handleSubmit() {
    if (!validateStep()) return
    if (step < 3) { setStep((step + 1) as Step); return }

    setLoading(true)
    setError('')

    // 1. Créer le compte Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: { full_name: form.full_name.trim() },
      },
    })

    if (authError || !authData.user) {
      setError(authError?.message ?? 'Erreur lors de la création du compte.')
      setLoading(false)
      return
    }

    const userId = authData.user.id

    // 2. Mettre à jour le profil users (le trigger crée la ligne)
    await supabase.from('users').upsert({
      id: userId,
      email: form.email.trim(),
      full_name: form.full_name.trim(),
      role: 'client',
    })

    // 3. Créer le profil client avec toutes les infos
    await supabase.from('clients').upsert({
      user_id: userId,
      phone: form.phone.trim(),
      whatsapp_id: form.phone.trim().replace(/\D/g, ''),
      goal: form.goal,
      status: 'active',
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
      height_cm: form.height_cm ? parseInt(form.height_cm) : null,
      notes_public: [
        form.sex && `Sexe : ${form.sex}`,
        form.level && `Niveau : ${form.level}`,
        form.sports && `Sports : ${form.sports}`,
        form.availability && `Disponibilités : ${form.availability}`,
        form.lifestyle && `Mode de vie : ${form.lifestyle}`,
        form.schedule && `Emploi du temps : ${form.schedule}`,
        form.food_relation && `Relation à la nourriture : ${form.food_relation}`,
        form.medical && `Antécédents médicaux : ${form.medical}`,
      ].filter(Boolean).join('\n'),
    })

    // 4. Marquer l'invitation comme utilisée
    await supabase
      .from('invitations')
      .update({ used: true, used_at: new Date().toISOString() })
      .eq('token', token)

    router.push('/espace')
  }

  if (checking) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </main>
    )
  }

  if (invalid) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="glass shadow-glass p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">⛔</div>
          <h2 className="font-display text-2xl text-cream mb-2">Lien invalide</h2>
          <p className="text-muted text-sm leading-relaxed">
            Ce lien d'invitation a expiré ou a déjà été utilisé. Contacte le coach pour en obtenir un nouveau.
          </p>
          <a
            href="/login"
            className="inline-block mt-5 btn-primary px-5 py-2.5 text-sm rounded-xl"
          >
            Retour
          </a>
        </div>
      </main>
    )
  }

  const steps = [
    { n: 1, label: 'Identité' },
    { n: 2, label: 'Sport & objectifs' },
    { n: 3, label: 'Mode de vie & accès' },
  ]

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl tracking-widest text-cream text-glow">
            THE <span className="text-accent">SMART</span> WAY
          </h1>
          <p className="text-muted text-sm mt-2">Création de ton espace personnel</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs transition-all ${
                step === s.n
                  ? 'bg-accent/20 text-accent border border-accent/30'
                  : step > s.n
                    ? 'bg-accent/10 text-accent/60 border border-accent/15'
                    : 'bg-white/5 text-dim border border-white/8'
              }`}>
                <span>{step > s.n ? '✓' : s.n}</span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-6 h-px ${step > s.n ? 'bg-accent/40' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="glass shadow-glass p-7">

          {/* ── ÉTAPE 1 : Identité ── */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-xl tracking-wide text-cream">TON IDENTITÉ</h2>

              <Field label="Nom complet *">
                <input type="text" value={form.full_name}
                  onChange={e => update('full_name', e.target.value)}
                  placeholder="Prénom Nom" className="glass-input px-4 py-2.5 text-sm w-full" />
              </Field>

              <Field label="Email *">
                <input type="email" value={form.email}
                  onChange={e => update('email', e.target.value)}
                  placeholder="ton@email.com" className="glass-input px-4 py-2.5 text-sm w-full"
                  readOnly={!!form.email} />
              </Field>

              <Field label="Téléphone / WhatsApp *">
                <input type="tel" value={form.phone}
                  onChange={e => update('phone', e.target.value)}
                  placeholder="+33 6 12 34 56 78" className="glass-input px-4 py-2.5 text-sm w-full" />
              </Field>

              <Field label="Sexe *">
                <div className="flex flex-wrap gap-2">
                  {SEXES.map(s => (
                    <button key={s} onClick={() => update('sex', s)}
                      className={`px-3 py-1.5 rounded-xl text-xs transition-all ${
                        form.sex === s
                          ? 'bg-accent/20 text-accent border border-accent/30'
                          : 'btn-ghost'
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Poids (kg)">
                  <input type="number" value={form.weight_kg}
                    onChange={e => update('weight_kg', e.target.value)}
                    placeholder="70" className="glass-input px-4 py-2.5 text-sm w-full" />
                </Field>
                <Field label="Taille (cm)">
                  <input type="number" value={form.height_cm}
                    onChange={e => update('height_cm', e.target.value)}
                    placeholder="175" className="glass-input px-4 py-2.5 text-sm w-full" />
                </Field>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 2 : Sport & objectifs ── */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-xl tracking-wide text-cream">SPORT & OBJECTIFS</h2>

              <Field label="Objectif principal *">
                <div className="flex flex-wrap gap-2">
                  {GOALS.map(g => (
                    <button key={g} onClick={() => update('goal', g)}
                      className={`px-3 py-1.5 rounded-xl text-xs transition-all ${
                        form.goal === g
                          ? 'bg-accent/20 text-accent border border-accent/30'
                          : 'btn-ghost'
                      }`}>
                      {g}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Niveau sportif actuel *">
                <div className="flex flex-col gap-2">
                  {LEVELS.map(l => (
                    <button key={l} onClick={() => update('level', l)}
                      className={`px-3 py-2 rounded-xl text-xs text-left transition-all ${
                        form.level === l
                          ? 'bg-accent/20 text-accent border border-accent/30'
                          : 'btn-ghost'
                      }`}>
                      {l}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Tes 3 sports préférés *">
                <input type="text" value={form.sports}
                  onChange={e => update('sports', e.target.value)}
                  placeholder="ex: Musculation, Course à pied, Natation"
                  className="glass-input px-4 py-2.5 text-sm w-full" />
              </Field>

              <Field label="Disponibilités (jours & horaires)">
                <textarea value={form.availability}
                  onChange={e => update('availability', e.target.value)}
                  placeholder="ex: Lundi/Mercredi/Vendredi matin, Samedi toute la journée"
                  rows={2} className="glass-input px-4 py-2.5 text-sm w-full resize-none" />
              </Field>
            </div>
          )}

          {/* ── ÉTAPE 3 : Mode de vie & accès ── */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-xl tracking-wide text-cream">MODE DE VIE & ACCÈS</h2>

              <Field label="Mode de vie actuel">
                <textarea value={form.lifestyle}
                  onChange={e => update('lifestyle', e.target.value)}
                  placeholder="ex: Travail sédentaire, actif le weekend, stressé en semaine..."
                  rows={2} className="glass-input px-4 py-2.5 text-sm w-full resize-none" />
              </Field>

              <Field label="Emploi du temps type">
                <textarea value={form.schedule}
                  onChange={e => update('schedule', e.target.value)}
                  placeholder="ex: Lever 7h, boulot 9h-18h, dispo après 19h..."
                  rows={2} className="glass-input px-4 py-2.5 text-sm w-full resize-none" />
              </Field>

              <Field label="Relation à la nourriture">
                <textarea value={form.food_relation}
                  onChange={e => update('food_relation', e.target.value)}
                  placeholder="ex: Mange équilibré mais grignote, pas d'allergies, végétarien..."
                  rows={2} className="glass-input px-4 py-2.5 text-sm w-full resize-none" />
              </Field>

              <Field label="Antécédents médicaux à signaler">
                <textarea value={form.medical}
                  onChange={e => update('medical', e.target.value)}
                  placeholder="ex: Douleurs au genou, hernie discale, aucun... (rester concis)"
                  rows={2} className="glass-input px-4 py-2.5 text-sm w-full resize-none" />
              </Field>

              <div className="h-px bg-accent/10 my-1" />
              <p className="text-xs text-muted">Crée ton mot de passe pour accéder à ton espace</p>

              <Field label="Mot de passe *">
                <input type="password" value={form.password}
                  onChange={e => update('password', e.target.value)}
                  placeholder="8 caractères minimum" className="glass-input px-4 py-2.5 text-sm w-full" />
              </Field>

              <Field label="Confirmer le mot de passe *">
                <input type="password" value={form.password_confirm}
                  onChange={e => update('password_confirm', e.target.value)}
                  placeholder="Répète ton mot de passe" className="glass-input px-4 py-2.5 text-sm w-full" />
              </Field>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="mt-4 glass-light px-4 py-2.5 text-sm text-danger border border-danger/20 rounded-xl">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            {step > 1 ? (
              <button onClick={() => setStep((step - 1) as Step)} className="btn-ghost px-4 py-2 text-sm rounded-xl">
                ← Retour
              </button>
            ) : <div />}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary px-6 py-2.5 text-sm rounded-xl flex items-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
              ) : step < 3 ? (
                <>Suivant →</>
              ) : (
                <>Créer mon compte 🎯</>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-dim mt-4">
          Tes données sont sécurisées et accessibles uniquement par toi et ton coach.
        </p>
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