'use client'

import { useState, useCallback } from 'react'
import {
  Plus, Trash2, ChevronDown, ChevronUp, Save, BookmarkPlus,
  Dumbbell, Moon, GripVertical, Check, Loader2, X, RefreshCw, LayoutList,
} from 'lucide-react'
import type { Program, DayType, Exercise } from '@/lib/types'

// ─── Types locaux ────────────────────────────────────────────

type ScheduleMode = 'recurring' | 'free'

type DraftExercise = Omit<Exercise, 'id' | 'day_id'> & { _id: string }

type DraftDay = {
  _id: string
  day_index: number   // 0-6, utilisé en mode recurring (lundi=0)
  day_number: number  // 1-based absolu, utilisé en mode free
  label: string
  type: DayType
  exercises: DraftExercise[]
}

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function makeExercise(order = 0): DraftExercise {
  return { _id: uid(), name: '', sets: 3, reps: '8-12', notes: null, order }
}

function makeRecurringDays(): DraftDay[] {
  return Array.from({ length: 7 }, (_, i) => ({
    _id: uid(), day_index: i, day_number: i + 1,
    label: '', type: 'rest' as DayType, exercises: [],
  }))
}

function makeFreeDays(count: number): DraftDay[] {
  return Array.from({ length: count }, (_, i) => ({
    _id: uid(), day_index: i % 7, day_number: i + 1,
    label: '', type: 'rest' as DayType, exercises: [],
  }))
}

// ─── ExerciseRow ─────────────────────────────────────────────

function ExerciseRow({ ex, onChange, onRemove }: {
  ex: DraftExercise
  onChange: (u: DraftExercise) => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-2 group">
      <GripVertical size={14} className="text-dim shrink-0 opacity-40" />
      <input
        type="text" value={ex.name}
        onChange={e => onChange({ ...ex, name: e.target.value })}
        placeholder="Exercice…"
        className="flex-1 min-w-0 bg-transparent border border-accent/10 rounded-lg px-3 py-1.5 text-sm text-cream placeholder:text-dim focus:outline-none focus:border-accent/40 transition-colors"
      />
      <input
        type="number" value={ex.sets} min={1}
        onChange={e => onChange({ ...ex, sets: Number(e.target.value) })}
        className="w-14 shrink-0 bg-transparent border border-accent/10 rounded-lg px-2 py-1.5 text-sm text-cream text-center focus:outline-none focus:border-accent/40 transition-colors"
        title="Séries"
      />
      <span className="text-dim text-xs shrink-0">×</span>
      <input
        type="text" value={ex.reps}
        onChange={e => onChange({ ...ex, reps: e.target.value })}
        placeholder="8-12"
        className="w-20 shrink-0 bg-transparent border border-accent/10 rounded-lg px-2 py-1.5 text-sm text-cream text-center focus:outline-none focus:border-accent/40 transition-colors"
        title="Reps"
      />
      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-red-400 transition-all rounded shrink-0"
      >
        <X size={14} />
      </button>
    </div>
  )
}

// ─── DayCard ─────────────────────────────────────────────────

function DayCard({ day, onChange, onRemove, showRemove, label }: {
  day: DraftDay
  onChange: (u: DraftDay) => void
  onRemove?: () => void
  showRemove?: boolean
  label: string
}) {
  const isTraining = day.type === 'training'

  function toggleType() {
    const next: DayType = isTraining ? 'rest' : 'training'
    onChange({ ...day, type: next, label: next === 'rest' ? 'Repos' : '', exercises: next === 'rest' ? [] : day.exercises })
  }

  return (
    <div className={`rounded-xl border transition-colors ${isTraining ? 'border-accent/20 bg-accent/3' : 'border-white/5 bg-white/2'}`}>
      <div className="flex items-center gap-2.5 p-3">
        <span className="text-xs font-medium text-dim w-8 shrink-0 uppercase">{label}</span>
        <button
          onClick={toggleType}
          className={`p-1.5 rounded-lg transition-colors shrink-0 ${isTraining ? 'bg-accent/15 text-accent' : 'bg-white/5 text-dim hover:text-muted'}`}
        >
          {isTraining ? <Dumbbell size={13} /> : <Moon size={13} />}
        </button>
        {isTraining ? (
          <input
            type="text" value={day.label}
            onChange={e => onChange({ ...day, label: e.target.value })}
            placeholder="Push A, Full Body…"
            className="flex-1 min-w-0 bg-transparent text-sm text-cream placeholder:text-dim focus:outline-none"
          />
        ) : (
          <span className="flex-1 text-sm text-dim italic">Repos</span>
        )}
        {showRemove && onRemove && (
          <button onClick={onRemove} className="p-1 text-dim hover:text-red-400 transition shrink-0">
            <Trash2 size={13} />
          </button>
        )}
      </div>
      {isTraining && (
        <div className="px-3 pb-3 flex flex-col gap-2">
          {day.exercises.map((ex, i) => (
            <ExerciseRow
              key={ex._id} ex={ex}
              onChange={u => { const arr = [...day.exercises]; arr[i] = u; onChange({ ...day, exercises: arr }) }}
              onRemove={() => onChange({ ...day, exercises: day.exercises.filter((_, j) => j !== i) })}
            />
          ))}
          <button
            onClick={() => onChange({ ...day, exercises: [...day.exercises, makeExercise(day.exercises.length)] })}
            className="flex items-center gap-1.5 text-xs text-dim hover:text-accent transition mt-1 pl-1"
          >
            <Plus size={12} /> Ajouter un exercice
          </button>
        </div>
      )}
    </div>
  )
}

// ─── ProgramEditor principal ─────────────────────────────────

interface Props {
  clientId: string
  clientName: string
  existingProgram?: Program | null
  onSaved?: (program: Program) => void
  onCancel?: () => void
}

export default function ProgramEditor({ clientId, clientName, existingProgram, onSaved, onCancel }: Props) {
  const [phaseName, setPhaseName] = useState(existingProgram?.phase_name ?? '')
  const [weekCount, setWeekCount] = useState(existingProgram?.week_count ?? 4)
  const [startDate, setStartDate] = useState(existingProgram?.start_date ?? '')
  const [mode, setMode]           = useState<ScheduleMode>((existingProgram as any)?.schedule_mode ?? 'recurring')
  const [weekExpanded, setWeekExpanded] = useState(true)

  const [recurringDays, setRecurringDays] = useState<DraftDay[]>(() => {
    if (existingProgram?.schedule_mode === 'recurring' && existingProgram.weeks?.[0]?.days) {
      return existingProgram.weeks[0].days.map(d => ({
        _id: uid(), day_index: d.day_index, day_number: d.day_index + 1,
        label: d.label, type: d.type,
        exercises: d.exercises.map(e => ({ _id: uid(), name: e.name, sets: e.sets, reps: e.reps, notes: e.notes, order: e.order })),
      }))
    }
    return makeRecurringDays()
  })

  const [freeDays, setFreeDays] = useState<DraftDay[]>(() => {
    if ((existingProgram as any)?.schedule_mode === 'free' && (existingProgram as any)?.free_days) {
      return (existingProgram as any).free_days.map((d: any) => ({
        _id: uid(), day_index: (d.day_number - 1) % 7, day_number: d.day_number,
        label: d.label, type: d.type,
        exercises: d.exercises.map((e: any) => ({ _id: uid(), name: e.name, sets: e.sets, reps: e.reps, notes: e.notes, order: e.order })),
      }))
    }
    return makeFreeDays(14)
  })

  const [saving, setSaving]     = useState(false)
  const [savingTpl, setSavingTpl] = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState<string | null>(null)

  // ── Free days helpers ────────────────────────────────────
  function addFreeDay() {
    setFreeDays(prev => [...prev, { _id: uid(), day_index: prev.length % 7, day_number: prev.length + 1, label: '', type: 'rest', exercises: [] }])
  }

  function removeFreeDay(idx: number) {
    setFreeDays(prev => prev.filter((_, i) => i !== idx).map((d, i) => ({ ...d, day_number: i + 1, day_index: i % 7 })))
  }

  function addFullWeek() {
    setFreeDays(prev => {
      const remainder = prev.length % 7
      const toAdd = remainder === 0 ? 7 : 7 - remainder
      return [...prev, ...Array.from({ length: toAdd }, (_, i) => ({
        _id: uid(), day_index: (prev.length + i) % 7, day_number: prev.length + i + 1,
        label: '', type: 'rest' as DayType, exercises: [],
      }))]
    })
  }

  // ── Validation ───────────────────────────────────────────
  function validate() {
    if (!phaseName.trim()) return 'Donne un nom à la phase.'
    if (mode === 'recurring') {
      if (weekCount < 1 || weekCount > 52) return 'Entre 1 et 52 semaines.'
      const training = recurringDays.filter(d => d.type === 'training')
      if (!training.length) return 'Ajoute au moins une séance.'
      for (const d of training) if (!d.label.trim()) return `Nomme la séance du ${DAY_LABELS[d.day_index]}.`
    } else {
      if (!freeDays.length) return 'Ajoute au moins un jour.'
      for (const d of freeDays.filter(d => d.type === 'training')) if (!d.label.trim()) return `Nomme la séance du Jour ${d.day_number}.`
    }
    return null
  }

  // ── Payload ──────────────────────────────────────────────
  function buildPayload(asTemplate = false) {
    const base = { clientId: asTemplate ? null : clientId, phaseName: phaseName.trim(), scheduleMode: mode, startDate: startDate || null, status: startDate ? 'active' : 'draft', asTemplate }
    if (mode === 'recurring') {
      return { ...base, weekCount, week: { days: recurringDays.map(d => ({ day_index: d.day_index, label: d.label.trim() || (d.type === 'rest' ? 'Repos' : ''), type: d.type, exercises: d.exercises.map((e, order) => ({ name: e.name.trim(), sets: e.sets, reps: e.reps.trim(), notes: e.notes, order })) })) } }
    }
    return { ...base, weekCount: Math.ceil(freeDays.length / 7), freeDays: freeDays.map(d => ({ day_number: d.day_number, label: d.label.trim() || (d.type === 'rest' ? 'Repos' : ''), type: d.type, exercises: d.exercises.map((e, order) => ({ name: e.name.trim(), sets: e.sets, reps: e.reps.trim(), notes: e.notes, order })) })) }
  }

  // ── Save ─────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    const err = validate()
    if (err) { setError(err); return }
    setError(null); setSaving(true)
    try {
      const method = existingProgram ? 'PATCH' : 'POST'
      const url = existingProgram ? `/api/programs/${existingProgram.id}` : '/api/programs'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buildPayload(false)) })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setSaved(true); setTimeout(() => setSaved(false), 2000)
      onSaved?.(data.program)
    } catch (e: any) { setError(e.message ?? 'Erreur lors de la sauvegarde.') }
    finally { setSaving(false) }
  }, [phaseName, weekCount, startDate, mode, recurringDays, freeDays, existingProgram, clientId])

  const handleSaveTemplate = useCallback(async () => {
    const err = validate()
    if (err) { setError(err); return }
    setSavingTpl(true)
    try {
      const res = await fetch('/api/program-templates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...buildPayload(true), name: phaseName.trim() }) })
      if (!res.ok) throw new Error(await res.text())
    } catch (e: any) { setError(e.message ?? 'Erreur template.') }
    finally { setSavingTpl(false) }
  }, [phaseName, weekCount, mode, recurringDays, freeDays])

  const days        = mode === 'recurring' ? recurringDays : freeDays
  const trainingCnt = days.filter(d => d.type === 'training').length

  // ─── Rendu ───────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">

      {/* En-tête */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-2xl tracking-wide text-cream">
            {existingProgram ? 'MODIFIER LE PROGRAMME' : 'NOUVEAU PROGRAMME'}
          </h2>
          <p className="text-sm text-muted mt-0.5">Pour <span className="text-cream">{clientName}</span></p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {onCancel && <button onClick={onCancel} className="glass-pill px-4 py-2 text-sm text-muted hover:text-cream transition">Annuler</button>}
          <button onClick={handleSaveTemplate} disabled={savingTpl} className="glass-pill px-4 py-2 text-sm text-dim hover:text-cream transition flex items-center gap-2">
            {savingTpl ? <Loader2 size={14} className="animate-spin" /> : <BookmarkPlus size={14} />} Template
          </button>
          <button onClick={handleSave} disabled={saving || saved} className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all ${saved ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-accent/15 text-cream border border-accent/25 hover:bg-accent/25'}`}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
            {saved ? 'Sauvegardé' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="glass-pill px-4 py-2.5 text-sm text-red-400 border border-red-500/20 flex items-center justify-between gap-3">
          {error} <button onClick={() => setError(null)}><X size={14} /></button>
        </div>
      )}

      {/* Métadonnées */}
      <div className="glass shadow-glass-sm p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="flex flex-col gap-1.5 lg:col-span-2">
          <label className="text-xs text-dim uppercase tracking-wider">Nom de la phase</label>
          <input type="text" value={phaseName} onChange={e => setPhaseName(e.target.value)} placeholder="Prise de masse, Sèche…"
            className="bg-transparent border border-accent/15 rounded-xl px-3 py-2.5 text-sm text-cream placeholder:text-dim focus:outline-none focus:border-accent/40 transition-colors" />
        </div>

        {/* Toggle mode */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-dim uppercase tracking-wider">Mode</label>
          <div className="flex items-center gap-1 bg-white/3 border border-accent/10 rounded-xl p-1 h-[42px]">
            <button onClick={() => { setMode('recurring'); setError(null) }}
              className={`flex-1 flex items-center justify-center gap-1.5 h-full rounded-lg text-xs transition-all ${mode === 'recurring' ? 'bg-accent/15 text-cream border border-accent/20' : 'text-muted hover:text-cream'}`}>
              <RefreshCw size={12} /> Récurrence
            </button>
            <button onClick={() => { setMode('free'); setError(null) }}
              className={`flex-1 flex items-center justify-center gap-1.5 h-full rounded-lg text-xs transition-all ${mode === 'free' ? 'bg-accent/15 text-cream border border-accent/20' : 'text-muted hover:text-cream'}`}>
              <LayoutList size={12} /> Libre
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-dim uppercase tracking-wider">Date de départ</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="bg-transparent border border-accent/15 rounded-xl px-3 py-2.5 text-sm text-cream focus:outline-none focus:border-accent/40 transition-colors" />
          <span className="text-xs text-dim">Vide = brouillon</span>
        </div>
      </div>

      {/* ── RÉCURRENCE ── */}
      {mode === 'recurring' && (
        <>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-dim uppercase tracking-wider">Durée (semaines)</label>
              <input type="number" value={weekCount} min={1} max={52} onChange={e => setWeekCount(Number(e.target.value))}
                className="w-32 bg-transparent border border-accent/15 rounded-xl px-3 py-2.5 text-sm text-cream focus:outline-none focus:border-accent/40 transition-colors" />
            </div>
            <div className="flex items-center gap-3 text-xs text-dim mt-5">
              <span className="flex items-center gap-1.5"><Dumbbell size={12} className="text-accent" /> Entraînement</span>
              <span className="flex items-center gap-1.5"><Moon size={12} /> Repos</span>
              <span className="opacity-60">Séries × Reps</span>
            </div>
          </div>

          <div className="glass shadow-glass-sm overflow-hidden">
            <button onClick={() => setWeekExpanded(e => !e)} className="flex items-center justify-between w-full px-4 py-3 border-b border-accent/10">
              <div className="flex items-center gap-3">
                <span className="text-xs text-accent uppercase tracking-wider font-medium">Semaine type</span>
                <span className="text-xs text-dim">{trainingCnt} séance{trainingCnt !== 1 ? 's' : ''}</span>
              </div>
              {weekExpanded ? <ChevronUp size={14} className="text-dim" /> : <ChevronDown size={14} className="text-dim" />}
            </button>
            {weekExpanded && (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {recurringDays.map((day, idx) => (
                  <DayCard key={day._id} day={day} label={DAY_LABELS[day.day_index]}
                    onChange={u => { const a = [...recurringDays]; a[idx] = u; setRecurringDays(a) }} />
                ))}
              </div>
            )}
          </div>

          <div className="glass shadow-glass-sm p-4 flex items-center justify-between">
            <p className="text-sm text-muted">
              Semaine type répétée <span className="text-cream font-medium">{weekCount} fois</span>
              {startDate && <> · dès le <span className="text-cream font-medium">{new Date(startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span></>}
            </p>
            <span className="text-xs text-dim">{trainingCnt} entr. / sem.</span>
          </div>
        </>
      )}

      {/* ── LIBRE ── */}
      {mode === 'free' && (
        <>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3 text-xs text-dim">
              <span className="text-cream font-medium">{freeDays.length} jours</span>
              <span className="flex items-center gap-1"><Dumbbell size={11} className="text-accent" /> {trainingCnt}</span>
              <span className="flex items-center gap-1"><Moon size={11} /> {freeDays.length - trainingCnt}</span>
            </div>
            <button onClick={addFreeDay} className="flex items-center gap-1.5 glass-pill px-3 py-1.5 text-xs text-cream hover:border-accent/30 transition">
              <Plus size={12} /> Ajouter un jour
            </button>
          </div>

          {/* Semaines groupées */}
          {Array.from({ length: Math.ceil(freeDays.length / 7) }, (_, wIdx) => {
            const slice = freeDays.slice(wIdx * 7, wIdx * 7 + 7)
            return (
              <div key={wIdx} className="glass shadow-glass-sm overflow-hidden">
                <div className="px-4 py-2.5 border-b border-accent/10 flex items-center gap-2">
                  <span className="text-xs text-accent uppercase tracking-wider font-medium">Semaine {wIdx + 1}</span>
                  <span className="text-xs text-dim">Jours {wIdx * 7 + 1}–{Math.min(wIdx * 7 + slice.length, freeDays.length)}</span>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {slice.map((day, lIdx) => {
                    const gIdx = wIdx * 7 + lIdx
                    return (
                      <DayCard key={day._id} day={day} label={`J${day.day_number}`}
                        onChange={u => { const a = [...freeDays]; a[gIdx] = u; setFreeDays(a) }}
                        onRemove={() => removeFreeDay(gIdx)}
                        showRemove={freeDays.length > 1}
                      />
                    )
                  })}
                  {/* Slot vide dans la dernière semaine incomplète */}
                  {wIdx === Math.ceil(freeDays.length / 7) - 1 && slice.length < 7 && (
                    <button onClick={addFreeDay}
                      className="rounded-xl border border-dashed border-accent/20 flex items-center justify-center gap-2 text-xs text-dim hover:text-accent hover:border-accent/40 transition min-h-[80px]">
                      <Plus size={13} /> Jour {freeDays.length + 1}
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          <button onClick={addFullWeek}
            className="w-full rounded-xl border border-dashed border-accent/15 py-3 text-xs text-dim hover:text-accent hover:border-accent/30 transition flex items-center justify-center gap-2">
            <Plus size={12} /> Ajouter une semaine complète
          </button>

          <div className="glass shadow-glass-sm p-4 flex items-center justify-between">
            <p className="text-sm text-muted">
              <span className="text-cream font-medium">{freeDays.length} jours</span> uniques
              {startDate && <> · dès le <span className="text-cream font-medium">{new Date(startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span></>}
            </p>
            <span className="text-xs text-dim">{trainingCnt} entr. au total</span>
          </div>
        </>
      )}
    </div>
  )
}