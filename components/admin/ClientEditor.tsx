'use client'

import { useState, useCallback } from 'react'
import {
  Plus, Trash2, ChevronDown, ChevronUp, Save, BookmarkPlus,
  Dumbbell, Moon, GripVertical, Check, Loader2, X
} from 'lucide-react'
import type { Program, ProgramWeek, ProgramDay, Exercise, DayType } from '@/lib/types'

// ─── Types locaux pour l'éditeur ────────────────────────────

type DraftExercise = Omit<Exercise, 'id' | 'day_id'> & { _id: string }
type DraftDay = Omit<ProgramDay, 'id' | 'week_id' | 'exercises'> & {
  _id: string
  exercises: DraftExercise[]
}
type DraftWeek = Omit<ProgramWeek, 'id' | 'program_id' | 'days'> & {
  _id: string
  days: DraftDay[]
  expanded: boolean
}

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function makeDay(day_index: number): DraftDay {
  return {
    _id: uid(),
    day_index,
    label: '',
    type: 'rest',
    exercises: [],
  }
}

function makeWeek(week_number: number): DraftWeek {
  return {
    _id: uid(),
    week_number,
    expanded: true,
    days: Array.from({ length: 7 }, (_, i) => makeDay(i)),
  }
}

function makeExercise(): DraftExercise {
  return { _id: uid(), name: '', sets: 3, reps: '8-12', notes: null, order: 0 }
}

// ─── Sous-composants ────────────────────────────────────────

function ExerciseRow({
  ex,
  onChange,
  onRemove,
}: {
  ex: DraftExercise
  onChange: (updated: DraftExercise) => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-2 group">
      <GripVertical size={14} className="text-dim shrink-0 opacity-50" />

      <input
        type="text"
        value={ex.name}
        onChange={e => onChange({ ...ex, name: e.target.value })}
        placeholder="Exercice…"
        className="flex-1 bg-transparent border border-accent/10 rounded-lg px-3 py-1.5 text-sm text-cream placeholder:text-dim focus:outline-none focus:border-accent/40 transition-colors"
      />

      <input
        type="number"
        value={ex.sets}
        min={1}
        onChange={e => onChange({ ...ex, sets: Number(e.target.value) })}
        className="w-14 bg-transparent border border-accent/10 rounded-lg px-2 py-1.5 text-sm text-cream text-center focus:outline-none focus:border-accent/40 transition-colors"
        title="Séries"
      />

      <span className="text-dim text-xs shrink-0">×</span>

      <input
        type="text"
        value={ex.reps}
        onChange={e => onChange({ ...ex, reps: e.target.value })}
        placeholder="8-12"
        className="w-20 bg-transparent border border-accent/10 rounded-lg px-2 py-1.5 text-sm text-cream text-center focus:outline-none focus:border-accent/40 transition-colors"
        title="Répétitions"
      />

      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 p-1 text-muted hover:text-red-400 transition-all rounded"
        title="Supprimer"
      >
        <X size={14} />
      </button>
    </div>
  )
}

function DayCard({
  day,
  onChange,
}: {
  day: DraftDay
  onChange: (updated: DraftDay) => void
}) {
  const isTraining = day.type === 'training'

  function toggleType() {
    const next: DayType = isTraining ? 'rest' : 'training'
    onChange({
      ...day,
      type: next,
      label: next === 'rest' ? 'Repos' : '',
      exercises: next === 'rest' ? [] : day.exercises,
    })
  }

  function addExercise() {
    onChange({
      ...day,
      exercises: [...day.exercises, { ...makeExercise(), order: day.exercises.length }],
    })
  }

  function updateExercise(idx: number, updated: DraftExercise) {
    const exercises = [...day.exercises]
    exercises[idx] = updated
    onChange({ ...day, exercises })
  }

  function removeExercise(idx: number) {
    onChange({
      ...day,
      exercises: day.exercises.filter((_, i) => i !== idx),
    })
  }

  return (
    <div
      className={`rounded-xl border transition-colors ${
        isTraining
          ? 'border-accent/20 bg-accent/3'
          : 'border-white/5 bg-white/2'
      }`}
    >
      {/* Header du jour */}
      <div className="flex items-center gap-2.5 p-3">
        <span className="text-xs font-medium text-dim w-7 shrink-0 uppercase">
          {DAY_LABELS[day.day_index]}
        </span>

        {/* Toggle training / repos */}
        <button
          onClick={toggleType}
          className={`p-1.5 rounded-lg transition-colors ${
            isTraining
              ? 'bg-accent/15 text-accent'
              : 'bg-white/5 text-dim hover:text-muted'
          }`}
          title={isTraining ? 'Passer en repos' : 'Passer en entraînement'}
        >
          {isTraining ? <Dumbbell size={13} /> : <Moon size={13} />}
        </button>

        {/* Label de séance */}
        {isTraining ? (
          <input
            type="text"
            value={day.label}
            onChange={e => onChange({ ...day, label: e.target.value })}
            placeholder="Push A, Full Body…"
            className="flex-1 bg-transparent text-sm text-cream placeholder:text-dim focus:outline-none"
          />
        ) : (
          <span className="flex-1 text-sm text-dim italic">Repos</span>
        )}
      </div>

      {/* Exercices */}
      {isTraining && (
        <div className="px-3 pb-3 flex flex-col gap-2">
          {day.exercises.map((ex, idx) => (
            <ExerciseRow
              key={ex._id}
              ex={ex}
              onChange={updated => updateExercise(idx, updated)}
              onRemove={() => removeExercise(idx)}
            />
          ))}

          <button
            onClick={addExercise}
            className="flex items-center gap-1.5 text-xs text-dim hover:text-accent transition-colors mt-1 pl-1"
          >
            <Plus size={12} />
            Ajouter un exercice
          </button>
        </div>
      )}
    </div>
  )
}

function WeekBlock({
  week,
  onChange,
  onRemove,
  canRemove,
}: {
  week: DraftWeek
  onChange: (updated: DraftWeek) => void
  onRemove: () => void
  canRemove: boolean
}) {
  function updateDay(idx: number, updated: DraftDay) {
    const days = [...week.days]
    days[idx] = updated
    onChange({ ...week, days })
  }

  const trainingCount = week.days.filter(d => d.type === 'training').length

  return (
    <div className="glass shadow-glass-sm overflow-hidden">
      {/* Header semaine */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-accent/10">
        <button
          onClick={() => onChange({ ...week, expanded: !week.expanded })}
          className="flex items-center gap-3 flex-1 text-left"
        >
          <span className="text-xs text-accent uppercase tracking-wider font-medium">
            Semaine type
          </span>

          <span className="text-xs text-dim">
            {trainingCount} séance{trainingCount !== 1 ? 's' : ''}
          </span>

          {week.expanded
            ? <ChevronUp size={14} className="text-dim ml-auto" />
            : <ChevronDown size={14} className="text-dim ml-auto" />
          }
        </button>

        {canRemove && (
          <button
            onClick={onRemove}
            className="p-1.5 text-dim hover:text-red-400 transition-colors rounded ml-2"
            title="Supprimer cette semaine"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Jours */}
      {week.expanded && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {week.days.map((day, idx) => (
            <DayCard
              key={day._id}
              day={day}
              onChange={updated => updateDay(idx, updated)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Composant principal ─────────────────────────────────────

interface Props {
  clientId: string
  clientName: string
  existingProgram?: Program | null
  onSaved?: (program: Program) => void
  onCancel?: () => void
}

export default function ProgramEditor({
  clientId,
  clientName,
  existingProgram,
  onSaved,
  onCancel,
}: Props) {
  const [phaseName, setPhaseName] = useState(existingProgram?.phase_name ?? '')
  const [weekCount, setWeekCount] = useState(existingProgram?.week_count ?? 4)
  const [startDate, setStartDate] = useState(existingProgram?.start_date ?? '')

  // On garde une seule semaine type dans l'éditeur
  // (la logique de répétition est côté serveur)
  const [week, setWeek] = useState<DraftWeek>(() => {
    if (existingProgram?.weeks?.length) {
      const w = existingProgram.weeks[0]
      return {
        _id: uid(),
        week_number: 1,
        expanded: true,
        days: w.days.map(d => ({
          _id: uid(),
          day_index: d.day_index,
          label: d.label,
          type: d.type,
          exercises: d.exercises.map(e => ({
            _id: uid(),
            name: e.name,
            sets: e.sets,
            reps: e.reps,
            notes: e.notes,
            order: e.order,
          })),
        })),
      }
    }
    return makeWeek(1)
  })

  const [saving, setSaving] = useState(false)
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Validation ──────────────────────────────────────────
  function validate() {
    if (!phaseName.trim()) return 'Donne un nom à la phase.'
    if (weekCount < 1 || weekCount > 52) return 'Entre 1 et 52 semaines.'
    const trainingDays = week.days.filter(d => d.type === 'training')
    if (trainingDays.length === 0) return 'Ajoute au moins une séance.'
    for (const d of trainingDays) {
      if (!d.label.trim()) return `Nomme toutes les séances (${DAY_LABELS[d.day_index]}).`
    }
    return null
  }

  // ── Payload → API ───────────────────────────────────────
  function buildPayload(asTemplate = false) {
    return {
      clientId: asTemplate ? null : clientId,
      phaseName: phaseName.trim(),
      weekCount,
      startDate: startDate || null,
      status: startDate ? 'active' : 'draft',
      asTemplate,
      week: {
        days: week.days.map(d => ({
          day_index: d.day_index,
          label: d.label.trim() || (d.type === 'rest' ? 'Repos' : ''),
          type: d.type,
          exercises: d.exercises.map((e, order) => ({
            name: e.name.trim(),
            sets: e.sets,
            reps: e.reps.trim(),
            notes: e.notes,
            order,
          })),
        })),
      },
    }
  }

  // ── Sauvegarde programme ─────────────────────────────────
  const handleSave = useCallback(async () => {
    const err = validate()
    if (err) { setError(err); return }
    setError(null)
    setSaving(true)

    try {
      const method = existingProgram ? 'PATCH' : 'POST'
      const url = existingProgram
        ? `/api/programs/${existingProgram.id}`
        : '/api/programs'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(false)),
      })

      if (!res.ok) throw new Error(await res.text())

      const data = await res.json()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onSaved?.(data.program)
    } catch (e: any) {
      setError(e.message ?? 'Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }, [phaseName, weekCount, startDate, week, existingProgram, clientId])

  // ── Sauvegarde template ──────────────────────────────────
  const handleSaveTemplate = useCallback(async () => {
    const err = validate()
    if (err) { setError(err); return }
    setError(null)
    setSavingTemplate(true)

    try {
      const res = await fetch('/api/program-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...buildPayload(true), name: phaseName.trim() }),
      })
      if (!res.ok) throw new Error(await res.text())
    } catch (e: any) {
      setError(e.message ?? 'Erreur lors de la sauvegarde du template.')
    } finally {
      setSavingTemplate(false)
    }
  }, [phaseName, weekCount, week])

  // ─── Rendu ───────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">

      {/* En-tête */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-display text-2xl tracking-wide text-cream">
            {existingProgram ? 'MODIFIER LE PROGRAMME' : 'NOUVEAU PROGRAMME'}
          </h2>
          <p className="text-sm text-muted mt-0.5">
            Pour <span className="text-cream">{clientName}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="glass-pill px-4 py-2 text-sm text-muted hover:text-cream transition"
            >
              Annuler
            </button>
          )}

          <button
            onClick={handleSaveTemplate}
            disabled={savingTemplate}
            className="glass-pill px-4 py-2 text-sm text-dim hover:text-cream transition flex items-center gap-2"
            title="Sauvegarder comme template réutilisable"
          >
            {savingTemplate
              ? <Loader2 size={14} className="animate-spin" />
              : <BookmarkPlus size={14} />
            }
            Template
          </button>

          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all ${
              saved
                ? 'bg-accent/20 text-accent border border-accent/30'
                : 'bg-accent/15 text-cream border border-accent/25 hover:bg-accent/25'
            }`}
          >
            {saving
              ? <Loader2 size={14} className="animate-spin" />
              : saved
                ? <Check size={14} />
                : <Save size={14} />
            }
            {saved ? 'Sauvegardé' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="glass-pill px-4 py-2.5 text-sm text-red-400 border border-red-500/20 flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Métadonnées de la phase */}
      <div className="glass shadow-glass-sm p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-dim uppercase tracking-wider">
            Nom de la phase
          </label>
          <input
            type="text"
            value={phaseName}
            onChange={e => setPhaseName(e.target.value)}
            placeholder="Prise de masse, Sèche…"
            className="bg-transparent border border-accent/15 rounded-xl px-3 py-2.5 text-sm text-cream placeholder:text-dim focus:outline-none focus:border-accent/40 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-dim uppercase tracking-wider">
            Durée (semaines)
          </label>
          <input
            type="number"
            value={weekCount}
            min={1}
            max={52}
            onChange={e => setWeekCount(Number(e.target.value))}
            className="bg-transparent border border-accent/15 rounded-xl px-3 py-2.5 text-sm text-cream focus:outline-none focus:border-accent/40 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-dim uppercase tracking-wider">
            Date de départ
          </label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="bg-transparent border border-accent/15 rounded-xl px-3 py-2.5 text-sm text-cream focus:outline-none focus:border-accent/40 transition-colors"
          />
          <span className="text-xs text-dim">Laisser vide = brouillon</span>
        </div>
      </div>

      {/* Légende */}
      <div className="flex items-center gap-4 text-xs text-dim px-1">
        <span className="flex items-center gap-1.5">
          <Dumbbell size={12} className="text-accent" /> Entraînement
        </span>
        <span className="flex items-center gap-1.5">
          <Moon size={12} /> Repos
        </span>
        <span className="ml-auto opacity-60">
          Séries × Répétitions (ex: 4 × 8-12)
        </span>
      </div>

      {/* Semaine type */}
      <WeekBlock
        week={week}
        onChange={setWeek}
        onRemove={() => {}}
        canRemove={false}
      />

      {/* Récap */}
      <div className="glass shadow-glass-sm p-4 flex items-center justify-between">
        <div className="text-sm text-muted">
          Cette semaine type se répètera{' '}
          <span className="text-cream font-medium">{weekCount} fois</span>
          {startDate && (
            <>
              {' '}à partir du{' '}
              <span className="text-cream font-medium">
                {new Date(startDate).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </span>
            </>
          )}
          .
        </div>
        <span className="text-xs text-dim">
          {week.days.filter(d => d.type === 'training').length} entr. / semaine
        </span>
      </div>
    </div>
  )
}