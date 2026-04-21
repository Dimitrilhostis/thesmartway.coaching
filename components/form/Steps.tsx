'use client'

import { useState } from 'react'
import { Field, TextArea, Title, Text, Option } from './Fields'
import Link from 'next/link'
import { FormData, INITIAL, STEPS, GOALS, GOAL_LABELS, COMMITMENT_LABELS, LEVEL_LABELS } from './types'


/* -------------------- RECAP ROW -------------------- */

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

/* -------------------- COMPONENT -------------------- */

export default function Steps() {
  const [step, setStep] = useState(0)
  const [goal, setGoal] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormData>(INITIAL)

  function isStepValid(step: number) {
    switch (step) {
      case 1:  return !!(form.identity && form.age && form.situation)
      case 2:  return !!(form.sex && form.poids && form.taille)
      case 3:  return !!(form.job && form.time_extra && form.equipment)
      case 4:  return !!(form.level && form.injuries && form.sports)
      case 5:  return !!(form.sleep_hours && form.sleep_quality && form.sleep_schedule)
      case 6:  return !!(form.meals && form.food_quality && form.cravings)
      case 7:  return goal !== ''
      case 8:  return !!(form.why && form.commitment && form.quitting)
      case 9:  return !!(form.short_goal && form.dream && form.why_me)
      case 10: return !!(form.email && form.number)
      default: return true
    }
  }

  function updateField(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/candidature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, goal }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error ?? 'Une erreur est survenue. Réessaie.')
        setLoading(false)
        return
      }

      setSubmitted(true)
    } catch {
      setError('Erreur réseau. Vérifie ta connexion et réessaie.')
    }

    setLoading(false)
  }

  // ── SUCCESS STATE ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 min-h-[400px] text-center animate-fade">
        <div className="text-5xl">🔥</div>
        <Title>C'est parti, {form.identity.split(' ')[1]} !</Title>
        <Text>
          Tes informations ont bien été transmises. Surveille ta boîte mail —
          je vais analyser ton profil et te contacter personnellement très vite.
        </Text>
        <p className="text-xs text-dim tracking-widest uppercase">The Smart Way Coaching</p>
        <Link href="/" className='text-xs text-dim tracking-widest border-b border-dim mt-10 hover:text-dim/80 hover:border-dim/80'>Revenir au site</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">

      {/* PROGRESS */}
      <div className="space-y-2">
        <p className="text-xs tracking-[0.3em] text-dim uppercase text-center">
          {STEPS[step]}
        </p>
        <div className="h-[2px] bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className="min-h-[340px] font-medium flex items-center justify-center">
        <div className="w-full max-w-xl text-center space-y-6 animate-fade">

          {step === 0 && (
            <>
              <Title>Formulaire - 10 min</Title>
              <Text>
                The Smart Way n'est pas juste une agence de coaching basique.
                Nous suivons une méthode précise, arrangée en fonction des objectifs et des sportifs avec lesquels nous travaillons.
              </Text>
              <Text>La santé mentale et physique, la longévité, le développement musculaire et l'évolution personnelle sont maîtres de notre accompagnement.</Text>
              <Text>
                Dans tous les cas, nous développerons ensemble un corps plus esthétique, de meilleures capacités, une énergie nouvelle, une routine contrôlée et plaisante, et pour finir, une indépendance pour continuer ce voyage dans les meilleures conditions.
              </Text>
            </>
          )}

          {step === 1 && (
            <>
              <Title>Qui es-tu ?</Title>
              <Field placeholder="Nom / Prénom"
                     value={form.identity}
                     onChange={(e) => updateField('identity', e.target.value)}
              />
              <select
                value={form.age}
                onChange={(e) => updateField('age', e.target.value)}
                className={`w-full p-3 font-medium text-s rounded-xl bg-white/5 border border-white/10 ${form.age ? 'text-cream' : 'text-dim'}`}
              >
                <Option value="" disabled>Âge</Option>
                <Option value="15-">15-</Option>
                <Option value="15-18">15-18</Option>
                <Option value="18-21">18-21</Option>
                <Option value="22-30">22-30</Option>
                <Option value="31-50">31-50</Option>
                <Option value="51-70">51-70</Option>
                <Option value="70+">71+</Option>
              </select>
              <select
                value={form.situation}
                onChange={(e) => updateField('situation', e.target.value)}
                className={`w-full p-3 font-medium text-s rounded-xl bg-white/5 border border-white/10 ${form.situation ? 'text-cream' : 'text-dim'}`}
              >
                <Option value="" disabled>Situation</Option>
                <Option value="Célib">Célibataire</Option>
                <Option value="En couple">En couple</Option>
                <Option value="Enfants">Avec enfants</Option>
              </select>
            </>
          )}

          {step === 2 && (
            <>
              <Title>Infos globales</Title>
              <select value={form.sex}
                      onChange={(e) => updateField('sex', e.target.value)}
                      className={`w-full p-3 font-medium text-s rounded-xl bg-white/5 border border-white/10 ${form.sex ? 'text-cream' : 'text-dim'}`}
              >
                <Option value="" disabled>Sexe</Option>
                <Option value="Homme">Homme</Option>
                <Option value="Femme">Femme</Option>
              </select>
              <select
                value={form.poids}
                onChange={(e) => updateField('poids', e.target.value)}
                className={`w-full p-3 font-medium text-s rounded-xl bg-white/5 border border-white/10 ${form.poids ? 'text-cream' : 'text-dim'}`}
              >
                <Option value="" disabled>Poids</Option>
                <Option value="40-">40kg-</Option>
                <Option value="40-50">40-50kg</Option>
                <Option value="50-60">50-60kg</Option>
                <Option value="60-70">60-70kg</Option>
                <Option value="70-80">70-80kg</Option>
                <Option value="80-90">80-90kg</Option>
                <Option value="90-100">90-100kg</Option>
                <Option value="100+">100kg+</Option>
              </select>
              <select
                value={form.taille}
                onChange={(e) => updateField('taille', e.target.value)}
                className={`w-full p-3 font-medium text-s rounded-xl bg-white/5 border border-white/10 ${form.taille ? 'text-cream' : 'text-dim'}`}
              >
                <Option value="" disabled>Taille</Option>
                <Option value="1m50-">1m50-</Option>
                <Option value="1m50-1m60">1m50-1m60</Option>
                <Option value="1m60-1m70">1m60-1m70</Option>
                <Option value="1m70-1m80">1m70-1m80</Option>
                <Option value="1m80-1m90">1m80-1m90</Option>
                <Option value="1m90-2m">1m90-2m</Option>
                <Option value="2m+">2m+</Option>
              </select>
            </>
          )}

          {step === 3 && (
            <>
              <Title>Organisation</Title>
              <TextArea placeholder="Job + horaires semaine"
                        value={form.job}
                        onChange={(e) => updateField('job', e.target.value)}
              />
              <select value={form.time_extra}
                      onChange={(e) => updateField('time_extra', e.target.value)}
                      className={`w-full p-3 font-medium text-s rounded-xl bg-white/5 border border-white/10 ${form.time_extra ? 'text-cream' : 'text-dim'}`}
              >
                <Option value="" disabled>Temps dispo par semaine</Option>
                <Option value="0-2h">0-2h</Option>
                <Option value="2-4h">2-4h</Option>
                <Option value="4-6h">4-6h</Option>
                <Option value="6-8h">6-8h</Option>
                <Option value="8-10h">8-10h</Option>
                <Option value="10-12h">10h-12h</Option>
                <Option value="12h+">12h+</Option>
              </select>
              <TextArea placeholder="Matériel et salles dispo"
                        value={form.equipment}
                        onChange={(e) => updateField('equipment', e.target.value)}
              />
            </>
          )}

          {step === 4 && (
            <>
              <Title>Sport</Title>
              <select
                value={form.level}
                onChange={(e) => updateField('level', e.target.value)}
                className={`w-full p-3 font-medium text-s rounded-xl bg-white/5 border border-white/10 ${form.level ? 'text-cream' : 'text-dim'}`}
              >
                <Option value="" disabled>Niveau (1-5)</Option>
                <Option value="1">1 - Non Sportif</Option>
                <Option value="2">2 - Sportif Débutant</Option>
                <Option value="3">3 - Sportif Loisir</Option>
                <Option value="4">4 - Sportif de Compétition</Option>
                <Option value="5">5 - Athlète</Option>
              </select>
              <TextArea placeholder="Blessures"
                        value={form.injuries}
                        onChange={(e) => updateField('injuries', e.target.value)}
              />
              <TextArea placeholder="Sports préférés (5 max)"
                        value={form.sports}
                        onChange={(e) => updateField('sports', e.target.value)}
              />
            </>
          )}

          {step === 5 && (
            <>
              <Title>Sommeil</Title>
              <select value={form.sleep_hours}
                      onChange={(e) => updateField('sleep_hours', e.target.value)}
                      className={`w-full p-3 font-medium text-s rounded-xl bg-white/5 border border-white/10 ${form.sleep_hours ? 'text-cream' : 'text-dim'}`}
              >
                <Option value="" disabled>Heures sommeil par nuit</Option>
                <Option value="0-3h">0-3h</Option>
                <Option value="3-5h">3-5h</Option>
                <Option value="5-7h">5-7h</Option>
                <Option value="7-9h">7-9h</Option>
                <Option value="9h+">9h+</Option>
              </select>
              <select value={form.sleep_quality}
                      onChange={(e) => updateField('sleep_quality', e.target.value)}
                      className={`w-full p-3 font-medium text-s rounded-xl bg-white/5 border border-white/10 ${form.sleep_quality ? 'text-cream' : 'text-dim'}`}
              >
                <Option value="" disabled>Qualité du sommeil</Option>
                <Option value="1">1 - Un cauchemar</Option>
                <Option value="2">2 - Compliqué</Option>
                <Option value="3">3 - Basique</Option>
                <Option value="4">4 - Réveil en forme</Option>
                <Option value="5">5 - Comme un bébé</Option>
              </select>
              <select value={form.sleep_schedule}
                      onChange={(e) => updateField('sleep_schedule', e.target.value)}
                      className={`w-full p-3 font-medium text-s rounded-xl bg-white/5 border border-white/10 ${form.sleep_schedule ? 'text-cream' : 'text-dim'}`}
              >
                <Option value="" disabled>Horaires de coucher</Option>
                <Option value="20h-22h">20h-22h</Option>
                <Option value="22h-00h">22h-00h</Option>
                <Option value="00h-2h">00h-2h</Option>
                <Option value="2h-4h">2h-4h</Option>
                <Option value="4h+">4h+</Option>
              </select>
            </>
          )}

          {step === 6 && (
            <>
              <Title>Nutrition</Title>
              <select value={form.meals}
                      onChange={(e) => updateField('meals', e.target.value)}
                      className={`w-full p-3 font-medium text-s rounded-xl bg-white/5 border border-white/10 ${form.meals ? 'text-cream' : 'text-dim'}`}
              >
                <Option value="" disabled>Nombre de repas par jour</Option>
                <Option value="1">1</Option>
                <Option value="2">2</Option>
                <Option value="3">3</Option>
                <Option value="4">4</Option>
                <Option value="5+">5+</Option>
              </select>
              <TextArea placeholder="Composition d'un repas type"
                        value={form.food_quality}
                        onChange={(e) => updateField('food_quality', e.target.value)}
              />
              <TextArea placeholder="Craquages (combien et quoi)"
                        value={form.cravings}
                        onChange={(e) => updateField('cravings', e.target.value)}
              />
            </>
          )}

          {step === 7 && (
            <>
              <Title>Ton objectif principal</Title>
              <div className="grid grid-cols-2 gap-3 mt-5">
                {GOALS.map((g) => {
                  const active = goal === g.id
                  return (
                    <button
                      key={g.id}
                      onClick={() => setGoal(g.id)}
                      className={`
                        group relative h-[100px] rounded-2xl border overflow-hidden
                        transition-all duration-300 ease-out backdrop-blur-md
                        ${active
                          ? 'border-accent bg-accent/10 shadow-[0_0_0_1px_rgba(123,175,110,0.35)]'
                          : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                        }
                      `}
                    >
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
              <TextArea placeholder="Pourquoi cet objectif ?"
                        value={form.why}
                        onChange={(e) => updateField('why', e.target.value)}
              />
              <select value={form.commitment}
                      onChange={(e) => updateField('commitment', e.target.value)}
                      className={`w-full p-3 font-medium text-s rounded-xl bg-white/5 border border-white/10 ${form.commitment ? 'text-cream' : 'text-dim'}`}
              >
                <Option value="" disabled>À combien es-tu prêt à t'engager ?</Option>
                <Option value="5">5 - À FOND !</Option>
                <Option value="4">4 - Carrément</Option>
                <Option value="3">3 - Ça va</Option>
                <Option value="2">2 - Pas tant</Option>
                <Option value="1">1 - Pas du tout</Option>
              </select>
              <TextArea placeholder="Quand est-ce que tu abandonnes le plus souvent ?"
                        value={form.quitting}
                        onChange={(e) => updateField('quitting', e.target.value)}
              />
            </>
          )}

          {step === 9 && (
            <>
              <Title>Vision</Title>
              <TextArea placeholder="Comment te vois-tu dans 3 mois ?"
                        value={form.short_goal}
                        onChange={(e) => updateField('short_goal', e.target.value)}
              />
              <TextArea placeholder="Quels sont tes 3 grands rêves ?"
                        value={form.dream}
                        onChange={(e) => updateField('dream', e.target.value)}
              />
              <TextArea placeholder="Pourquoi je te coacherais toi ?"
                        value={form.why_me}
                        onChange={(e) => updateField('why_me', e.target.value)}
              />
            </>
          )}

          {step === 10 && (
            <>
              <Title>Prêt à démarrer ?</Title>
              <Field placeholder="Email"
                     type="email"
                     value={form.email}
                     onChange={(e) => updateField('email', e.target.value)}
              />
              <Field placeholder="Numéro de téléphone"
                     type="tel"
                     value={form.number}
                     onChange={(e) => updateField('number', e.target.value)}
              />
            </>
          )}

          {/* ── STEP 11 : RÉCAP ───────────────────────────────────────────── */}
          {step === 11 && (
            <>
              <Title>Vérifie tes infos</Title>
              <p className="text-dim text-sm -mt-2">
                Tout est bon ? Tu peux encore revenir corriger.
              </p>

              <div className="text-left mt-2 max-h-[320px] overflow-y-auto pr-1 space-y-4
                              scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">

                <RecapSection title="👤 Identité">
                  <RecapRow label="Nom"       value={form.identity} />
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
                  <RecapRow label="Dans 3 mois"   value={form.short_goal} />
                  <RecapRow label="3 grands rêves" value={form.dream} />
                  <RecapRow label="Pourquoi moi ?" value={form.why_me} />
                </RecapSection>

                <RecapSection title="📬 Contact">
                  <RecapRow label="Email"     value={form.email} />
                  <RecapRow label="Téléphone" value={form.number} />
                </RecapSection>

              </div>

              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-accent text-black font-semibold mt-4 hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? 'Envoi en cours...'
                  : <><span className="font-bold text-2xl">→</span> Envoyer au coach</>
                }
              </button>
            </>
          )}

        </div>
      </div>

      {/* NAV */}
      <div className="flex justify-between items-center">

        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          className={`text-sm text-dim transition ${step === 0 ? 'opacity-0 pointer-events-none' : ''}`}
        >
          ← Retour
        </button>

        {step < STEPS.length - 1 && (
          <button
            onClick={() => {
              if (!isStepValid(step)) return
              setStep(s => Math.min(STEPS.length - 1, s + 1))
            }}
            disabled={!isStepValid(step)}
            className={`px-6 py-2 rounded-xl text-sm transition
              ${isStepValid(step)
                ? 'bg-white/10 hover:bg-white/15'
                : 'bg-white/5 opacity-40 cursor-not-allowed'
              }`}
          >
            Continuer →
          </button>
        )}

      </div>

      {/* animation */}
      <style jsx>{`
        .animate-fade {
          animation: fade 0.35s ease-out;
        }
        @keyframes fade {
          from { opacity: 0; transform: translateY(8px); filter: blur(6px); }
          to   { opacity: 1; transform: translateY(0);   filter: blur(0); }
        }
      `}</style>

    </div>
  )
}