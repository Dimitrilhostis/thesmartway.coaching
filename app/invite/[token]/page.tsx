'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const supabase = createClient()

// ── Types ─────────────────────────────────────────────────────────

interface FormData {
  nom: string
  prénom: string
  age: string
  situation: string
  sex: string
  poids: string
  taille: string
  job: string
  time_extra: string
  equipment: string
  level: string
  injuries: string
  sports: string
  sleep_hours: string
  sleep_quality: string
  sleep_schedule: string
  meals: string
  food_quality: string
  cravings: string
  why: string
  commitment: string
  quitting: string
  short_goal: string
  dream: string
  why_me: string
  email: string
  number: string
  password: string
  password_confirm: string
}

const INITIAL: FormData = {
  nom: '', prénom: '', age: '', situation: '',
  sex: '', poids: '', taille: '',
  job: '', time_extra: '', equipment: '',
  level: '', injuries: '', sports: '',
  sleep_hours: '', sleep_quality: '', sleep_schedule: '',
  meals: '', food_quality: '', cravings: '',
  why: '', commitment: '', quitting: '',
  short_goal: '', dream: '', why_me: '',
  email: '', number: '', password: '', password_confirm: '',
}

const STEPS = [
  'Bienvenue',
  'Qui es-tu ?',
  'Infos globales',
  'Organisation',
  'Sport',
  'Sommeil',
  'Nutrition',
  'Objectif principal',
  'Engagement',
  'Vision',
  'Contact',
  'Récapitulatif',
]

const GOALS = [
  { id: 'masse',     title: 'Prise de masse',    desc: 'Construire du muscle et gagner en volume.' },
  { id: 'poids',     title: 'Perte de poids',     desc: 'Réduire la masse grasse de façon durable.' },
  { id: 'seche',     title: 'Sèche / Définition', desc: 'Affiner le physique en gardant le muscle.' },
  { id: 'endurance', title: 'Endurance',           desc: 'Améliorer cardio et capacités aérobies.' },
  { id: 'forme',     title: 'Remise en forme',     desc: 'Retrouver énergie et bien-être général.' },
  { id: 'comp',      title: 'Compétition',         desc: 'Préparer une compétition sportive précise.' },
  { id: 'autre',     title: 'Autre',               desc: 'Un objectif sur-mesure défini ensemble.' },
]

const GOAL_LABELS: Record<string, string> = Object.fromEntries(GOALS.map(g => [g.id, g.title]))
const LEVEL_LABELS: Record<string, string> = {
  '1': '1 - Non Sportif', '2': '2 - Sportif Débutant', '3': '3 - Sportif Loisir',
  '4': '4 - Sportif de Compétition', '5': '5 - Athlète',
}
const COMMITMENT_LABELS: Record<string, string> = {
  '5': '5 - À FOND !', '4': '4 - Carrément', '3': '3 - Ça va', '2': '2 - Pas tant', '1': '1 - Pas du tout',
}

// ── Sub-components ────────────────────────────────────────────────

function Field({ placeholder, type = 'text', value, onChange, readOnly }: {
  placeholder: string; type?: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; readOnly?: boolean
}) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} readOnly={readOnly}
      className={`w-full p-3 font-medium text-s rounded-xl bg-white/5 border border-white/10 ${value ? 'text-cream' : 'text-dim'} ${readOnly ? 'opacity-60 cursor-not-allowed' : ''}`} />
  )
}

function TextArea({ placeholder, value, onChange }: {
  placeholder: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
}) {
  return (
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={2}
      className={`w-full p-3 font-medium text-s rounded-xl bg-white/5 border border-white/10 resize-none ${value ? 'text-cream' : 'text-dim'}`} />
  )
}

function Opt({ value, disabled, children }: { value: string; disabled?: boolean; children: React.ReactNode }) {
  return <option value={value} disabled={disabled}>{children}</option>
}

function Title({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-xl tracking-wide text-cream">{children}</h2>
}

function Text({ children }: { children: React.ReactNode }) {
  return <p className="text-dim text-sm leading-relaxed">{children}</p>
}

function RecapRow({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-white/5 text-sm">
      <span className="text-dim shrink-0">{label}</span>
      <span className="text-cream text-right">{value}</span>
    </div>
  )
}

function RecapSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="text-xs tracking-[0.25em] uppercase text-accent mb-2">{title}</p>
      {children}
    </div>
  )
}

function CredentialRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-white/5">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-dim uppercase tracking-wider">{label}</span>
        <span className={`text-sm text-cream ${mono ? 'font-mono' : ''}`}>{value}</span>
      </div>
      <button onClick={copy}
        className="shrink-0 text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-dim hover:text-cream transition-colors">
        {copied ? '✓' : 'Copier'}
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────

export default function InvitePage() {
  const { token } = useParams<{ token: string }>()

  const [step, setStep] = useState(0)
  const [goal, setGoal] = useState('')
  const [form, setForm] = useState<FormData>(INITIAL)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')
  const [invalid, setInvalid] = useState(false)
  const [submitted, setSubmitted] = useState(false)

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

  function updateField(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  function isStepValid(s: number): boolean {
    switch (s) {
      case 1:  return !!(form.nom && form.prénom && form.age && form.situation)
      case 2:  return !!(form.sex && form.poids && form.taille)
      case 3:  return !!(form.job && form.time_extra && form.equipment)
      case 4:  return !!(form.level && form.injuries && form.sports)
      case 5:  return !!(form.sleep_hours && form.sleep_quality && form.sleep_schedule)
      case 6:  return !!(form.meals && form.food_quality && form.cravings)
      case 7:  return goal !== ''
      case 8:  return !!(form.why && form.commitment && form.quitting)
      case 9:  return !!(form.short_goal && form.dream && form.why_me)
      case 10: return !!(form.email && form.number && form.password && form.password.length >= 8 && form.password === form.password_confirm)
      default: return true
    }
  }

  function goNext() {
    if (!isStepValid(step)) return
    setError('')
    setStep(s => Math.min(STEPS.length - 1, s + 1))
  }

  function goBack() {
    setError('')
    setStep(s => Math.max(0, s - 1))
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: { data: { name: form.prénom.trim(), last_name: form.nom.trim() } },
    })

    if (authError || !authData.user) {
      setError(authError?.message ?? 'Erreur lors de la création du compte.')
      setLoading(false)
      return
    }

    const userId = authData.user.id

    await supabase.from('users').upsert({
      id: userId, email: form.email.trim(),
      name: form.prénom.trim(), last_name: form.nom.trim(), role: 'client',
    })

    await supabase.from('clients').upsert({
      user_id: userId,
      phone: form.number.trim(),
      whatsapp_id: form.number.trim().replace(/\D/g, ''),
      goal: GOAL_LABELS[goal] ?? goal,
      status: 'active',
      notes_public: [
        form.sex         && `Sexe : ${form.sex}`,
        form.poids       && `Poids : ${form.poids}`,
        form.taille      && `Taille : ${form.taille}`,
        form.age         && `Âge : ${form.age}`,
        form.situation   && `Situation : ${form.situation}`,
        form.job         && `Job : ${form.job}`,
        form.time_extra  && `Temps dispo : ${form.time_extra}`,
        form.equipment   && `Matériel : ${form.equipment}`,
        form.level       && `Niveau : ${LEVEL_LABELS[form.level] ?? form.level}`,
        form.injuries    && `Blessures : ${form.injuries}`,
        form.sports      && `Sports : ${form.sports}`,
        form.sleep_hours    && `Sommeil : ${form.sleep_hours}`,
        form.sleep_quality  && `Qualité sommeil : ${form.sleep_quality}/5`,
        form.sleep_schedule && `Coucher : ${form.sleep_schedule}`,
        form.meals          && `Repas/jour : ${form.meals}`,
        form.food_quality   && `Repas type : ${form.food_quality}`,
        form.cravings       && `Craquages : ${form.cravings}`,
        form.why         && `Pourquoi : ${form.why}`,
        form.commitment  && `Engagement : ${COMMITMENT_LABELS[form.commitment] ?? form.commitment}`,
        form.quitting    && `Abandons : ${form.quitting}`,
        form.short_goal  && `Objectif 3 mois : ${form.short_goal}`,
        form.dream       && `Rêves : ${form.dream}`,
        form.why_me      && `Pourquoi moi : ${form.why_me}`,
      ].filter(Boolean).join('\n'),
    })

    await supabase
      .from('invitations')
      .update({ used: true, used_at: new Date().toISOString() })
      .eq('token', token)

    setSubmitted(true)
    setLoading(false)
  }

  // ── States ────────────────────────────────────────────────────────

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
          <a href="/login" className="inline-block mt-5 btn-primary px-5 py-2.5 text-sm rounded-xl">Retour</a>
        </div>
      </main>
    )
  }

  // ── SUCCESS : Credentials screen ──────────────────────────────────

  if (submitted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm animate-fade">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl tracking-widest text-cream text-glow">
              THE <span className="text-accent">SMART</span> WAY
            </h1>
          </div>

          <div className="glass shadow-glass p-7 flex flex-col gap-5">
            <div className="text-center">
              <div className="text-4xl mb-3">🎯</div>
              <h2 className="font-display text-xl tracking-wide text-cream">Compte créé !</h2>
              <p className="text-dim text-sm mt-1">
                Bienvenue {form.prénom}. Voici tes informations de connexion — note-les bien.
              </p>
            </div>

            <div className="glass-light rounded-2xl px-4 py-1 border border-white/5">
              <CredentialRow label="Nom d'utilisateur" value={`${form.prénom} ${form.nom}`} />
              <CredentialRow label="Email" value={form.email} />
              <CredentialRow label="Mot de passe" value={form.password} mono />
              <div className="py-3">
                <span className="text-xs text-dim uppercase tracking-wider">Connexion Google</span>
                <p className="text-sm text-cream mt-0.5">Disponible avec {form.email}</p>
              </div>
            </div>

            <div className="glass-light rounded-2xl px-4 py-3 border border-accent/15">
              <p className="text-xs text-accent uppercase tracking-wider mb-1">À retenir</p>
              <p className="text-xs text-dim leading-relaxed">
                Connecte-toi sur <span className="text-cream">/login</span> avec ton email et ton mot de passe,
                ou via Google si tu utilises la même adresse.
              </p>
            </div>

            <Link href="/login?view=login"
              className="w-full py-3 rounded-2xl bg-accent text-black font-semibold text-sm text-center hover:opacity-90 transition">
              Accéder à mon espace →
            </Link>
          </div>

          <p className="text-center text-xs text-dim mt-4">
            Tes données sont sécurisées et accessibles uniquement par toi et ton coach.
          </p>
        </div>

        <style jsx>{`
          .animate-fade { animation: fade 0.4s ease-out; }
          @keyframes fade {
            from { opacity: 0; transform: translateY(12px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </main>
    )
  }

  // ── Main render ───────────────────────────────────────────────────

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl tracking-widest text-cream text-glow">
            THE <span className="text-accent">SMART</span> WAY
          </h1>
          <p className="text-muted text-sm mt-2">Création de ton espace personnel</p>
        </div>

        <div className="space-y-2 mb-8">
          <p className="text-xs tracking-[0.3em] text-dim uppercase text-center">{STEPS[step]}</p>
          <div className="h-[2px] bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-accent transition-all duration-500"
              style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }} />
          </div>
        </div>

        <div className="glass shadow-glass p-7">
          <div className="min-h-[340px] font-medium flex items-center justify-center">
            <div className="w-full max-w-xl text-center space-y-6 animate-fade">

              {step === 0 && (
                <>
                  <Title>Formulaire - 10 min</Title>
                  <Text>The Smart Way n'est pas juste une agence de coaching basique. Nous suivons une méthode précise, arrangée en fonction des objectifs et des sportifs avec lesquels nous travaillons.</Text>
                  <Text>La santé mentale et physique, la longévité, le développement musculaire et l'évolution personnelle sont maîtres de notre accompagnement.</Text>
                  <Text>Dans tous les cas, nous développerons ensemble un corps plus esthétique, de meilleures capacités, une énergie nouvelle, une routine contrôlée et plaisante, et pour finir, une indépendance pour continuer ce voyage dans les meilleures conditions.</Text>
                </>
              )}

              {step === 1 && (
                <>
                  <Title>Qui es-tu ?</Title>
                  <div className="inline-flex gap-4 w-full justify-center">
                    <Field placeholder="Nom"    value={form.nom}    onChange={e => updateField('nom', e.target.value)} />
                    <Field placeholder="Prénom" value={form.prénom} onChange={e => updateField('prénom', e.target.value)} />
                  </div>
                  <input type="number" inputMode="numeric" pattern="[0-9]*" min="0" max="120"
                    value={form.age} onChange={e => updateField('age', e.target.value)} placeholder="Âge"
                    className={`w-full p-3 font-medium text-s rounded-xl bg-white/5 border border-white/10 ${form.age ? 'text-cream' : 'text-dim'}`} />
                  <select value={form.situation} onChange={e => updateField('situation', e.target.value)}
                    className={`w-full p-3 font-medium text-s rounded-xl bg-white/5 border border-white/10 ${form.situation ? 'text-cream' : 'text-dim'}`}>
                    <Opt value="" disabled>Situation</Opt>
                    <Opt value="Célib">Célibataire</Opt>
                    <Opt value="En couple">En couple</Opt>
                    <Opt value="Enfants">Avec enfants</Opt>
                  </select>
                </>
              )}

              {step === 2 && (
                <>
                  <Title>Infos globales</Title>
                  <select value={form.sex} onChange={e => updateField('sex', e.target.value)}
                    className={`w-full p-3 font-medium text-s rounded-xl bg-white/5 border border-white/10 ${form.sex ? 'text-cream' : 'text-dim'}`}>
                    <Opt value="" disabled>Sexe</Opt>
                    <Opt value="Homme">Homme</Opt>
                    <Opt value="Femme">Femme</Opt>
                  </select>
                  <select value={form.poids} onChange={e => updateField('poids', e.target.value)}
                    className={`w-full p-3 font-medium text-s rounded-xl bg-white/5 border border-white/10 ${form.poids ? 'text-cream' : 'text-dim'}`}>
                    <Opt value="" disabled>Poids</Opt>
                    <Opt value="40-">40kg-</Opt><Opt value="40-50">40-50kg</Opt><Opt value="50-60">50-60kg</Opt>
                    <Opt value="60-70">60-70kg</Opt><Opt value="70-80">70-80kg</Opt><Opt value="80-90">80-90kg</Opt>
                    <Opt value="90-100">90-100kg</Opt><Opt value="100+">100kg+</Opt>
                  </select>
                  <select value={form.taille} onChange={e => updateField('taille', e.target.value)}
                    className={`w-full p-3 font-medium text-s rounded-xl bg-white/5 border border-white/10 ${form.taille ? 'text-cream' : 'text-dim'}`}>
                    <Opt value="" disabled>Taille</Opt>
                    <Opt value="1m50-">1m50-</Opt><Opt value="1m50-1m60">1m50-1m60</Opt><Opt value="1m60-1m70">1m60-1m70</Opt>
                    <Opt value="1m70-1m80">1m70-1m80</Opt><Opt value="1m80-1m90">1m80-1m90</Opt>
                    <Opt value="1m90-2m">1m90-2m</Opt><Opt value="2m+">2m+</Opt>
                  </select>
                </>
              )}

              {step === 3 && (
                <>
                  <Title>Organisation</Title>
                  <TextArea placeholder="Job + horaires semaine" value={form.job} onChange={e => updateField('job', e.target.value)} />
                  <select value={form.time_extra} onChange={e => updateField('time_extra', e.target.value)}
                    className={`w-full p-3 font-medium text-s rounded-xl bg-white/5 border border-white/10 ${form.time_extra ? 'text-cream' : 'text-dim'}`}>
                    <Opt value="" disabled>Temps dispo par semaine</Opt>
                    <Opt value="0-2h">0-2h</Opt><Opt value="2-4h">2-4h</Opt><Opt value="4-6h">4-6h</Opt>
                    <Opt value="6-8h">6-8h</Opt><Opt value="8-10h">8-10h</Opt><Opt value="10-12h">10h-12h</Opt>
                    <Opt value="12h+">12h+</Opt>
                  </select>
                  <TextArea placeholder="Matériel et salles dispo" value={form.equipment} onChange={e => updateField('equipment', e.target.value)} />
                </>
              )}

              {step === 4 && (
                <>
                  <Title>Sport</Title>
                  <select value={form.level} onChange={e => updateField('level', e.target.value)}
                    className={`w-full p-3 font-medium text-s rounded-xl bg-white/5 border border-white/10 ${form.level ? 'text-cream' : 'text-dim'}`}>
                    <Opt value="" disabled>Niveau (1-5)</Opt>
                    <Opt value="1">1 - Non Sportif</Opt><Opt value="2">2 - Sportif Débutant</Opt>
                    <Opt value="3">3 - Sportif Loisir</Opt><Opt value="4">4 - Sportif de Compétition</Opt>
                    <Opt value="5">5 - Athlète</Opt>
                  </select>
                  <TextArea placeholder="Blessures" value={form.injuries} onChange={e => updateField('injuries', e.target.value)} />
                  <TextArea placeholder="Sports préférés (5 max)" value={form.sports} onChange={e => updateField('sports', e.target.value)} />
                </>
              )}

              {step === 5 && (
                <>
                  <Title>Sommeil</Title>
                  <select value={form.sleep_hours} onChange={e => updateField('sleep_hours', e.target.value)}
                    className={`w-full p-3 font-medium text-s rounded-xl bg-white/5 border border-white/10 ${form.sleep_hours ? 'text-cream' : 'text-dim'}`}>
                    <Opt value="" disabled>Heures sommeil par nuit</Opt>
                    <Opt value="0-3h">0-3h</Opt><Opt value="3-5h">3-5h</Opt><Opt value="5-7h">5-7h</Opt>
                    <Opt value="7-9h">7-9h</Opt><Opt value="9h+">9h+</Opt>
                  </select>
                  <select value={form.sleep_quality} onChange={e => updateField('sleep_quality', e.target.value)}
                    className={`w-full p-3 font-medium text-s rounded-xl bg-white/5 border border-white/10 ${form.sleep_quality ? 'text-cream' : 'text-dim'}`}>
                    <Opt value="" disabled>Qualité du sommeil</Opt>
                    <Opt value="1">1 - Un cauchemar</Opt><Opt value="2">2 - Compliqué</Opt>
                    <Opt value="3">3 - Basique</Opt><Opt value="4">4 - Réveil en forme</Opt>
                    <Opt value="5">5 - Comme un bébé</Opt>
                  </select>
                  <select value={form.sleep_schedule} onChange={e => updateField('sleep_schedule', e.target.value)}
                    className={`w-full p-3 font-medium text-s rounded-xl bg-white/5 border border-white/10 ${form.sleep_schedule ? 'text-cream' : 'text-dim'}`}>
                    <Opt value="" disabled>Horaires de coucher</Opt>
                    <Opt value="20h-22h">20h-22h</Opt><Opt value="22h-00h">22h-00h</Opt>
                    <Opt value="00h-2h">00h-2h</Opt><Opt value="2h-4h">2h-4h</Opt><Opt value="4h+">4h+</Opt>
                  </select>
                </>
              )}

              {step === 6 && (
                <>
                  <Title>Nutrition</Title>
                  <select value={form.meals} onChange={e => updateField('meals', e.target.value)}
                    className={`w-full p-3 font-medium text-s rounded-xl bg-white/5 border border-white/10 ${form.meals ? 'text-cream' : 'text-dim'}`}>
                    <Opt value="" disabled>Nombre de repas par jour</Opt>
                    <Opt value="1">1</Opt><Opt value="2">2</Opt><Opt value="3">3</Opt>
                    <Opt value="4">4</Opt><Opt value="5+">5+</Opt>
                  </select>
                  <TextArea placeholder="Composition d'un repas type" value={form.food_quality} onChange={e => updateField('food_quality', e.target.value)} />
                  <TextArea placeholder="Craquages (combien et quoi)" value={form.cravings} onChange={e => updateField('cravings', e.target.value)} />
                </>
              )}

              {step === 7 && (
                <>
                  <Title>Ton objectif principal</Title>
                  <div className="grid grid-cols-2 gap-3 mt-5">
                    {GOALS.map(g => {
                      const active = goal === g.id
                      return (
                        <button key={g.id} onClick={() => setGoal(g.id)}
                          className={`group relative h-[100px] rounded-2xl border overflow-hidden transition-all duration-300 ease-out backdrop-blur-md ${
                            active ? 'border-accent bg-accent/10 shadow-[0_0_0_1px_rgba(123,175,110,0.35)]'
                                   : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'}`}>
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
                          <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out opacity-100 group-hover:opacity-30 blur-0 group-hover:blur-[10px] scale-100 group-hover:scale-95">
                            <p className="text-sm font-semibold text-cream tracking-wide">{g.title}</p>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center text-center px-4 transition-all duration-300 ease-out opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 blur-[6px] group-hover:blur-0">
                            <p className="text-xs md:text-sm text-cream/90 leading-snug font-medium">{g.desc}</p>
                          </div>
                          {active && <div className="absolute inset-0 bg-accent/5 pointer-events-none" />}
                          <div className="absolute inset-0 rounded-2xl ring-1 ring-white/0 group-hover:ring-white/10 transition-all duration-300" />
                        </button>
                      )
                    })}
                  </div>
                </>
              )}

              {step === 8 && (
                <>
                  <Title>Engagement</Title>
                  <TextArea placeholder="Pourquoi cet objectif ?" value={form.why} onChange={e => updateField('why', e.target.value)} />
                  <select value={form.commitment} onChange={e => updateField('commitment', e.target.value)}
                    className={`w-full p-3 font-medium text-s rounded-xl bg-white/5 border border-white/10 ${form.commitment ? 'text-cream' : 'text-dim'}`}>
                    <Opt value="" disabled>À combien es-tu prêt à t'engager ?</Opt>
                    <Opt value="5">5 - À FOND !</Opt><Opt value="4">4 - Carrément</Opt>
                    <Opt value="3">3 - Ça va</Opt><Opt value="2">2 - Pas tant</Opt><Opt value="1">1 - Pas du tout</Opt>
                  </select>
                  <TextArea placeholder="Quand est-ce que tu abandonnes le plus souvent ?" value={form.quitting} onChange={e => updateField('quitting', e.target.value)} />
                </>
              )}

              {step === 9 && (
                <>
                  <Title>Vision</Title>
                  <TextArea placeholder="Comment te vois-tu dans 3 mois ?" value={form.short_goal} onChange={e => updateField('short_goal', e.target.value)} />
                  <TextArea placeholder="Quels sont tes 3 grands rêves ?" value={form.dream} onChange={e => updateField('dream', e.target.value)} />
                  <TextArea placeholder="Pourquoi je te coacherais toi ?" value={form.why_me} onChange={e => updateField('why_me', e.target.value)} />
                </>
              )}

              {step === 10 && (
                <>
                  <Title>Prêt à démarrer ?</Title>
                  <Field placeholder="Email" type="email" value={form.email} readOnly={!!form.email}
                    onChange={e => updateField('email', e.target.value)} />
                  <Field placeholder="Numéro de téléphone" type="tel" value={form.number}
                    onChange={e => updateField('number', e.target.value)} />
                  <div className="h-px bg-white/5" />
                  <Field placeholder="Mot de passe (8 caractères min.)" type="password" value={form.password}
                    onChange={e => updateField('password', e.target.value)} />
                  <Field placeholder="Confirmer le mot de passe" type="password" value={form.password_confirm}
                    onChange={e => updateField('password_confirm', e.target.value)} />
                  {form.password && form.password_confirm && form.password !== form.password_confirm && (
                    <p className="text-xs text-danger">Les mots de passe ne correspondent pas.</p>
                  )}
                  {form.password && form.password.length > 0 && form.password.length < 8 && (
                    <p className="text-xs text-danger">8 caractères minimum.</p>
                  )}
                </>
              )}

              {step === 11 && (
                <>
                  <Title>Vérifie tes infos</Title>
                  <p className="text-dim text-sm -mt-2">Tout est bon ? Tu peux encore revenir corriger.</p>
                  <div className="text-left mt-2 max-h-[320px] overflow-y-auto pr-1 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                    <RecapSection title="👤 Identité">
                      <RecapRow label="Nom"       value={form.nom} />
                      <RecapRow label="Prénom"    value={form.prénom} />
                      <RecapRow label="Âge"       value={form.age} />
                      <RecapRow label="Situation" value={form.situation} />
                      <RecapRow label="Sexe"      value={form.sex} />
                      <RecapRow label="Poids"     value={form.poids} />
                      <RecapRow label="Taille"    value={form.taille} />
                    </RecapSection>
                    <RecapSection title="📅 Organisation">
                      <RecapRow label="Job"         value={form.job} />
                      <RecapRow label="Temps dispo" value={form.time_extra} />
                      <RecapRow label="Matériel"    value={form.equipment} />
                    </RecapSection>
                    <RecapSection title="🏃 Sport">
                      <RecapRow label="Niveau"    value={LEVEL_LABELS[form.level] ?? form.level} />
                      <RecapRow label="Blessures" value={form.injuries} />
                      <RecapRow label="Sports"    value={form.sports} />
                    </RecapSection>
                    <RecapSection title="😴 Sommeil">
                      <RecapRow label="Heures / nuit" value={form.sleep_hours} />
                      <RecapRow label="Qualité"       value={form.sleep_quality} />
                      <RecapRow label="Coucher"       value={form.sleep_schedule} />
                    </RecapSection>
                    <RecapSection title="🥗 Nutrition">
                      <RecapRow label="Repas / jour" value={form.meals} />
                      <RecapRow label="Repas type"   value={form.food_quality} />
                      <RecapRow label="Craquages"    value={form.cravings} />
                    </RecapSection>
                    <RecapSection title="🎯 Objectif & Engagement">
                      <RecapRow label="Objectif"   value={GOAL_LABELS[goal] ?? goal} />
                      <RecapRow label="Pourquoi"   value={form.why} />
                      <RecapRow label="Engagement" value={COMMITMENT_LABELS[form.commitment] ?? form.commitment} />
                      <RecapRow label="Abandons"   value={form.quitting} />
                    </RecapSection>
                    <RecapSection title="🌟 Vision">
                      <RecapRow label="Dans 3 mois"    value={form.short_goal} />
                      <RecapRow label="3 grands rêves" value={form.dream} />
                      <RecapRow label="Pourquoi moi ?" value={form.why_me} />
                    </RecapSection>
                    <RecapSection title="📬 Contact">
                      <RecapRow label="Email"     value={form.email} />
                      <RecapRow label="Téléphone" value={form.number} />
                    </RecapSection>
                  </div>

                  {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

                  <button onClick={handleSubmit} disabled={loading}
                    className="w-full py-3 rounded-2xl bg-accent text-black font-semibold mt-4 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading
                      ? 'Création du compte...'
                      : <><span className="font-bold text-2xl">→</span> Créer mon compte 🎯</>}
                  </button>
                </>
              )}

            </div>
          </div>

          {error && step < 11 && (
            <div className="mt-4 glass-light px-4 py-2.5 text-sm text-danger border border-danger/20 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex justify-between items-center mt-6">
            <button onClick={goBack}
              className={`text-sm text-dim transition ${step === 0 ? 'opacity-0 pointer-events-none' : ''}`}>
              ← Retour
            </button>
            {step < STEPS.length - 1 && (
              <button onClick={goNext} disabled={!isStepValid(step)}
                className={`px-6 py-2 rounded-xl text-sm transition ${
                  isStepValid(step) ? 'bg-white/10 hover:bg-white/15' : 'bg-white/5 opacity-40 cursor-not-allowed'}`}>
                Continuer →
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-dim mt-4">
          Tes données sont sécurisées et accessibles uniquement par toi et ton coach.
        </p>
      </div>

      <style jsx>{`
        .animate-fade { animation: fade 0.35s ease-out; }
        @keyframes fade {
          from { opacity: 0; transform: translateY(8px); filter: blur(6px); }
          to   { opacity: 1; transform: translateY(0);   filter: blur(0); }
        }
      `}</style>
    </main>
  )
}