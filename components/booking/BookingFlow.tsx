'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ChevronLeft, ChevronRight, Clock, Check,
  CalendarDays, User, Loader2, CheckCircle2,
} from 'lucide-react'
import type { MassageService, TimeSlot } from '@/lib/types'

// ─── Helpers ─────────────────────────────────────────────────

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 })
}

function formatDateFR(date: Date) {
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatTimeFR(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function toISO(date: Date) {
  return date.toISOString().split('T')[0]
}

function addDays(date: Date, n: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  d.setHours(0, 0, 0, 0)
  return d
}

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const DAYS_SHORT = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']

type Step = 'service' | 'datetime' | 'info' | 'confirm'

interface BookingForm {
  clientName: string
  clientEmail: string
  clientPhone: string
  notes: string
}

// ─── Étape 1 : Choix de la prestation ────────────────────────

function StepService({
  services,
  selected,
  onSelect,
}: {
  services: MassageService[]
  selected: MassageService | null
  onSelect: (s: MassageService) => void
}) {
  return (
    <div>
      <h2 className="font-display text-2xl tracking-wide text-cream mb-1">CHOISIR UNE PRESTATION</h2>
      <p className="text-muted text-sm mb-6">Sélectionne le massage qui te correspond.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {services.map(service => {
          const isSelected = selected?.id === service.id
          return (
            <button
              key={service.id}
              onClick={() => onSelect(service)}
              className={`text-left p-4 rounded-xl border transition-all ${
                isSelected
                  ? 'border-accent/40 bg-accent/10 ring-1 ring-accent/20'
                  : 'border-accent/10 bg-white/2 hover:border-accent/25 hover:bg-white/4'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-sm font-medium text-cream">{service.name}</h3>
                {isSelected && <Check size={15} className="text-accent shrink-0 mt-0.5" />}
              </div>
              {service.description && (
                <p className="text-xs text-muted leading-relaxed mb-3 line-clamp-2">
                  {service.description}
                </p>
              )}
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs text-dim">
                  <Clock size={11} /> {service.duration_min} min
                </span>
                <span className="text-xs text-accent font-medium">
                  {formatPrice(service.price_cents)}
                </span>
                <span className="text-xs text-dim ml-auto">Règlement sur place</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Étape 2 : Calendrier + créneaux ─────────────────────────

function StepDateTime({
  service,
  selectedSlot,
  onSelect,
}: {
  service: MassageService
  selectedSlot: TimeSlot | null
  onSelect: (slot: TimeSlot) => void
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [viewDate, setViewDate]   = useState(today)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [slots, setSlots]         = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const weekStart = startOfWeek(viewDate)
  const weekDays  = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  // Charger les créneaux quand une date est sélectionnée
  useEffect(() => {
    if (!selectedDate) return
    setLoadingSlots(true)
    setSlots([])
    fetch(`/api/booking/slots?date=${toISO(selectedDate)}&serviceId=${service.id}`)
      .then(r => r.json())
      .then(d => setSlots(d.slots ?? []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [selectedDate, service.id])

  const isPast = (d: Date) => d < today
  const isSelected = (d: Date) => selectedDate && toISO(d) === toISO(selectedDate)

  return (
    <div>
      <h2 className="font-display text-2xl tracking-wide text-cream mb-1">CHOISIR UN CRÉNEAU</h2>
      <p className="text-muted text-sm mb-6">
        {service.name} · {service.duration_min} min
      </p>

      {/* Navigation semaine */}
      <div className="glass shadow-glass-sm p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setViewDate(d => addDays(d, -7))}
            disabled={addDays(weekStart, -1) < today}
            className="p-1.5 rounded-lg text-muted hover:text-cream disabled:opacity-30 transition"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-cream font-medium">
            {MONTHS[weekStart.getMonth()]} {weekStart.getFullYear()}
          </span>
          <button
            onClick={() => setViewDate(d => addDays(d, 7))}
            className="p-1.5 rounded-lg text-muted hover:text-cream transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Jours */}
        <div className="grid grid-cols-7 gap-1">
          {DAYS_SHORT.map(d => (
            <div key={d} className="text-center text-xs text-dim py-1">{d}</div>
          ))}
          {weekDays.map(day => {
            const past     = isPast(day)
            const selected = isSelected(day)
            return (
              <button
                key={day.toISOString()}
                disabled={past}
                onClick={() => { setSelectedDate(day); }}
                className={`
                  aspect-square rounded-lg flex items-center justify-center text-sm transition-all
                  ${past ? 'text-dim opacity-30 cursor-not-allowed' : ''}
                  ${selected ? 'bg-accent text-forest font-medium' : ''}
                  ${!past && !selected ? 'text-muted hover:bg-white/8 hover:text-cream' : ''}
                `}
              >
                {day.getDate()}
              </button>
            )
          })}
        </div>
      </div>

      {/* Créneaux */}
      {selectedDate && (
        <div className="glass shadow-glass-sm p-4">
          <p className="text-xs text-dim uppercase tracking-wider mb-3">
            {formatDateFR(selectedDate)}
          </p>

          {loadingSlots ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="text-dim animate-spin" />
            </div>
          ) : slots.length === 0 ? (
            <p className="text-sm text-muted text-center py-6">
              Aucun créneau disponible ce jour.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {slots.map(slot => {
                const isChosen = selectedSlot?.start === slot.start
                return (
                  <button
                    key={slot.start}
                    disabled={!slot.available}
                    onClick={() => onSelect(slot)}
                    className={`
                      py-2 rounded-lg text-sm transition-all border
                      ${!slot.available ? 'opacity-25 cursor-not-allowed border-white/5 text-dim' : ''}
                      ${isChosen ? 'bg-accent/15 border-accent/40 text-cream font-medium' : ''}
                      ${slot.available && !isChosen ? 'border-accent/15 text-muted hover:border-accent/30 hover:text-cream' : ''}
                    `}
                  >
                    {formatTimeFR(slot.start)}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {!selectedDate && (
        <div className="glass shadow-glass-sm p-6 text-center text-sm text-muted">
          Sélectionne une date pour voir les créneaux disponibles.
        </div>
      )}
    </div>
  )
}

// ─── Étape 3 : Informations client ───────────────────────────

function StepInfo({
  form,
  onChange,
}: {
  form: BookingForm
  onChange: (f: BookingForm) => void
}) {
  const field = (key: keyof BookingForm) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...form, [key]: e.target.value }),
  })

  return (
    <div>
      <h2 className="font-display text-2xl tracking-wide text-cream mb-1">VOS INFORMATIONS</h2>
      <p className="text-muted text-sm mb-6">Ces informations nous permettent de confirmer votre réservation.</p>

      <div className="flex flex-col gap-4">
        <div className="glass shadow-glass-sm p-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-dim uppercase tracking-wider">Nom complet *</label>
              <input
                type="text"
                placeholder="Jean Dupont"
                required
                {...field('clientName')}
                className="bg-transparent border border-accent/15 rounded-xl px-3 py-2.5 text-sm text-cream placeholder:text-dim focus:outline-none focus:border-accent/40 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-dim uppercase tracking-wider">Téléphone</label>
              <input
                type="tel"
                placeholder="06 12 34 56 78"
                {...field('clientPhone')}
                className="bg-transparent border border-accent/15 rounded-xl px-3 py-2.5 text-sm text-cream placeholder:text-dim focus:outline-none focus:border-accent/40 transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-dim uppercase tracking-wider">Email *</label>
            <input
              type="email"
              placeholder="jean@exemple.fr"
              required
              {...field('clientEmail')}
              className="bg-transparent border border-accent/15 rounded-xl px-3 py-2.5 text-sm text-cream placeholder:text-dim focus:outline-none focus:border-accent/40 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-dim uppercase tracking-wider">Demandes particulières</label>
            <textarea
              rows={3}
              placeholder="Zone à travailler, contre-indications, préférences…"
              {...field('notes')}
              className="bg-transparent border border-accent/15 rounded-xl px-3 py-2.5 text-sm text-cream placeholder:text-dim focus:outline-none focus:border-accent/40 transition-colors resize-none"
            />
          </div>
        </div>

        <p className="text-xs text-dim px-1">
          * Champs obligatoires. Règlement sur place le jour du rendez-vous.
        </p>
      </div>
    </div>
  )
}

// ─── Étape 4 : Récapitulatif ──────────────────────────────────

function StepConfirm({
  service,
  slot,
  form,
  onSubmit,
  loading,
  error,
}: {
  service: MassageService
  slot: TimeSlot
  form: BookingForm
  onSubmit: () => void
  loading: boolean
  error: string | null
}) {
  return (
    <div>
      <h2 className="font-display text-2xl tracking-wide text-cream mb-1">RÉCAPITULATIF</h2>
      <p className="text-muted text-sm mb-6">Vérifiez les informations avant de confirmer.</p>

      <div className="flex flex-col gap-3">
        <div className="glass shadow-glass-sm p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between py-2 border-b border-accent/10">
            <span className="text-xs text-dim uppercase tracking-wider">Prestation</span>
            <span className="text-sm text-cream font-medium">{service.name}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-accent/10">
            <span className="text-xs text-dim uppercase tracking-wider">Durée</span>
            <span className="text-sm text-cream">{service.duration_min} min</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-accent/10">
            <span className="text-xs text-dim uppercase tracking-wider">Date</span>
            <span className="text-sm text-cream">{formatDateFR(new Date(slot.start))}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-accent/10">
            <span className="text-xs text-dim uppercase tracking-wider">Horaire</span>
            <span className="text-sm text-cream">{formatTimeFR(slot.start)} — {formatTimeFR(slot.end)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-accent/10">
            <span className="text-xs text-dim uppercase tracking-wider">Prix</span>
            <span className="text-sm text-accent font-medium">{formatPrice(service.price_cents)} · sur place</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-dim uppercase tracking-wider">Client</span>
            <div className="text-right">
              <p className="text-sm text-cream">{form.clientName}</p>
              <p className="text-xs text-muted">{form.clientEmail}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="glass-pill px-4 py-2.5 text-sm text-red-400 border border-red-500/20">
            {error}
          </div>
        )}

        <button
          onClick={onSubmit}
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-accent/15 text-cream border border-accent/25 hover:bg-accent/25 transition text-sm font-medium"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          {loading ? 'Confirmation en cours…' : 'Confirmer la réservation'}
        </button>

        <p className="text-xs text-dim text-center">
          Un email de confirmation avec le fichier agenda vous sera envoyé.
        </p>
      </div>
    </div>
  )
}

// ─── Succès ───────────────────────────────────────────────────

function StepSuccess({
  service,
  slot,
  clientName,
}: {
  service: MassageService
  slot: TimeSlot
  clientName: string
}) {
  return (
    <div className="flex flex-col items-center text-center py-12 gap-5">
      <div className="w-16 h-16 rounded-2xl bg-accent/15 border border-accent/25 flex items-center justify-center">
        <CheckCircle2 size={28} className="text-accent" />
      </div>
      <div>
        <h2 className="font-display text-2xl tracking-wide text-cream mb-2">RÉSERVATION CONFIRMÉE</h2>
        <p className="text-muted text-sm max-w-sm">
          Merci {clientName.split(' ')[0]}. Un email de confirmation vous a été envoyé avec un fichier à ajouter à votre agenda.
        </p>
      </div>
      <div className="glass shadow-glass-sm p-4 w-full max-w-sm text-left">
        <p className="text-sm font-medium text-cream mb-1">{service.name}</p>
        <p className="text-xs text-muted">{formatDateFR(new Date(slot.start))}</p>
        <p className="text-xs text-muted">{formatTimeFR(slot.start)} — {formatTimeFR(slot.end)}</p>
        <p className="text-xs text-dim mt-2">Règlement sur place · {formatPrice(service.price_cents)}</p>
      </div>
      <a href="/" className="text-xs text-accent hover:text-cream transition">
        ← Retour à l'accueil
      </a>
    </div>
  )
}

// ─── BookingFlow principal ────────────────────────────────────

const STEPS: { id: Step; label: string; icon: typeof CalendarDays }[] = [
  { id: 'service',  label: 'Prestation', icon: Clock         },
  { id: 'datetime', label: 'Créneau',    icon: CalendarDays  },
  { id: 'info',     label: 'Infos',      icon: User          },
  { id: 'confirm',  label: 'Confirmation', icon: Check       },
]

export default function BookingFlow({ services }: { services: MassageService[] }) {
  const [step, setStep]               = useState<Step>('service')
  const [done, setDone]               = useState(false)
  const [selectedService, setSelectedService] = useState<MassageService | null>(null)
  const [selectedSlot, setSelectedSlot]       = useState<TimeSlot | null>(null)
  const [form, setForm]               = useState<BookingForm>({ clientName: '', clientEmail: '', clientPhone: '', notes: '' })
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const stepIndex = STEPS.findIndex(s => s.id === step)

  function canNext() {
    if (step === 'service')  return !!selectedService
    if (step === 'datetime') return !!selectedSlot
    if (step === 'info')     return !!form.clientName.trim() && !!form.clientEmail.trim()
    return false
  }

  function goNext() {
    const order: Step[] = ['service', 'datetime', 'info', 'confirm']
    const idx = order.indexOf(step)
    if (idx < order.length - 1) setStep(order[idx + 1])
  }

  function goPrev() {
    const order: Step[] = ['service', 'datetime', 'info', 'confirm']
    const idx = order.indexOf(step)
    if (idx > 0) setStep(order[idx - 1])
  }

  const handleSubmit = useCallback(async () => {
    if (!selectedService || !selectedSlot) return
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId:   selectedService.id,
          startsAt:    selectedSlot.start,
          endsAt:      selectedSlot.end,
          clientName:  form.clientName,
          clientEmail: form.clientEmail,
          clientPhone: form.clientPhone || null,
          notes:       form.notes || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erreur lors de la réservation.')
      }
      setDone(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }, [selectedService, selectedSlot, form])

  if (done && selectedService && selectedSlot) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <StepSuccess service={selectedService} slot={selectedSlot} clientName={form.clientName} />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Stepper */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => {
          const past    = i < stepIndex
          const current = i === stepIndex
          return (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all
                  ${current ? 'bg-accent/20 border border-accent/40 text-accent' : ''}
                  ${past ? 'bg-accent/10 border border-accent/20 text-accent' : ''}
                  ${!current && !past ? 'bg-white/5 border border-white/10 text-dim' : ''}
                `}>
                  {past ? <Check size={13} /> : <span>{i + 1}</span>}
                </div>
                <span className={`text-xs hidden sm:block ${current ? 'text-cream' : 'text-dim'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 mb-4 ${i < stepIndex ? 'bg-accent/30' : 'bg-white/8'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Contenu de l'étape */}
      <div className="mb-8">
        {step === 'service' && (
          <StepService services={services} selected={selectedService} onSelect={s => { setSelectedService(s); setSelectedSlot(null) }} />
        )}
        {step === 'datetime' && selectedService && (
          <StepDateTime service={selectedService} selectedSlot={selectedSlot} onSelect={setSelectedSlot} />
        )}
        {step === 'info' && (
          <StepInfo form={form} onChange={setForm} />
        )}
        {step === 'confirm' && selectedService && selectedSlot && (
          <StepConfirm service={selectedService} slot={selectedSlot} form={form} onSubmit={handleSubmit} loading={submitting} error={error} />
        )}
      </div>

      {/* Navigation */}
      {step !== 'confirm' && (
        <div className="flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={step === 'service'}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-cream disabled:opacity-30 transition"
          >
            <ChevronLeft size={16} /> Retour
          </button>
          <button
            onClick={goNext}
            disabled={!canNext()}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-accent/15 text-cream border border-accent/25 hover:bg-accent/25 disabled:opacity-30 disabled:cursor-not-allowed transition text-sm font-medium"
          >
            Continuer <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  )
}