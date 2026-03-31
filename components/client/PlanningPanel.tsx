'use client'

import { useState, useRef, useCallback } from 'react'
import { CalendarDays, LayoutGrid, ChevronLeft, ChevronRight, Dumbbell, Moon, GripVertical } from 'lucide-react'
import type { Program, CalendarDay, CalendarWeek, ScheduleOverride } from '@/lib/types'

// ─── Helpers ─────────────────────────────────────────────────

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const DAY_NAMES_FULL = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const MONTH_NAMES = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

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
  const diff = day === 0 ? -6 : 1 - day // lundi
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

/**
 * Résout le planning sur une plage de dates.
 * Applique la semaine type (répétée) + les overrides du client.
 */
function resolveCalendar(
  program: Program,
  overrides: ScheduleOverride[],
  from: Date,
  to: Date
): CalendarDay[] {
  if (!program.start_date) return []

  const start = new Date(program.start_date)
  const days: CalendarDay[] = []

  const overrideMap = new Map<string, ScheduleOverride>()
  overrides.forEach(o => overrideMap.set(o.new_date, o))

  // Jours de la semaine type (index 0-6)
  const typicalDays = program.weeks?.[0]?.days ?? []
  const dayByIndex = new Map(typicalDays.map(d => [d.day_index, d]))

  let cursor = new Date(from)
  while (cursor <= to) {
    const iso = toISO(cursor)
    const diffDays = Math.floor((cursor.getTime() - start.getTime()) / 86400000)
    const dayIndex = ((diffDays % 7) + 7) % 7 // 0 = lundi

    const override = overrideMap.get(iso)
    let programDay = dayByIndex.get(dayIndex) ?? null

    // Si un override remplace ce jour par une autre séance
    if (override) {
      const replacingDay = typicalDays.find(d => d.id === override.original_day_id) ?? null
      days.push({ date: iso, day_index: dayIndex, programDay: replacingDay, isOverride: true, overrideId: override.id })
    } else {
      // Vérifier que ce slot n'a pas été déplacé ailleurs
      const movedAway = overrides.some(o => {
        const origDay = typicalDays.find(d => d.id === o.original_day_id)
        return origDay?.day_index === dayIndex && o.new_date !== iso
      })
      days.push({
        date: iso,
        day_index: dayIndex,
        programDay: movedAway ? null : programDay,
        isOverride: false,
      })
    }

    cursor = addDays(cursor, 1)
  }

  return days
}

// ─── Carte séance ─────────────────────────────────────────────

function SessionCard({
  day,
  compact = false,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
  isDragOver = false,
}: {
  day: CalendarDay
  compact?: boolean
  draggable?: boolean
  onDragStart?: () => void
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: () => void
  isDragOver?: boolean
}) {
  const isRest = !day.programDay || day.programDay.type === 'rest'
  const isTraining = day.programDay?.type === 'training'

  if (isRest && compact) {
    return (
      <div className="h-full flex items-center justify-center opacity-30">
        <Moon size={12} className="text-muted" />
      </div>
    )
  }

  return (
    <div
      draggable={draggable && isTraining}
      onDragStart={onDragStart}
      onDragOver={e => { e.preventDefault(); onDragOver?.(e) }}
      onDrop={e => { e.preventDefault(); onDrop?.() }}
      className={`
        rounded-xl border transition-all select-none
        ${isTraining
          ? `bg-accent/8 border-accent/20 ${draggable ? 'cursor-grab active:cursor-grabbing hover:border-accent/35 hover:bg-accent/12' : ''}`
          : 'bg-transparent border-transparent'
        }
        ${isDragOver ? 'border-accent/50 bg-accent/15 scale-[1.02]' : ''}
        ${compact ? 'p-2' : 'p-3'}
      `}
    >
      {isTraining && (
        <>
          <div className="flex items-center gap-1.5 mb-1">
            {draggable && <GripVertical size={11} className="text-dim shrink-0" />}
            <Dumbbell size={compact ? 11 : 12} className="text-accent shrink-0" />
            <span className={`font-medium text-cream truncate ${compact ? 'text-xs' : 'text-sm'}`}>
              {day.programDay!.label}
            </span>
            {day.isOverride && (
              <span className="ml-auto text-[9px] text-accent/70 bg-accent/10 px-1.5 py-0.5 rounded-full shrink-0">
                modifié
              </span>
            )}
          </div>
          {!compact && day.programDay!.exercises.length > 0 && (
            <div className="flex flex-col gap-0.5 mt-2">
              {day.programDay!.exercises.slice(0, 4).map((ex, i) => (
                <div key={i} className="flex items-center justify-between text-xs text-muted">
                  <span className="truncate">{ex.name}</span>
                  <span className="text-dim shrink-0 ml-2">{ex.sets}×{ex.reps}</span>
                </div>
              ))}
              {day.programDay!.exercises.length > 4 && (
                <span className="text-xs text-dim mt-0.5">
                  +{day.programDay!.exercises.length - 4} autres
                </span>
              )}
            </div>
          )}
        </>
      )}

      {isRest && !compact && (
        <div className="flex items-center gap-1.5">
          <Moon size={12} className="text-dim" />
          <span className="text-xs text-dim italic">Repos</span>
        </div>
      )}
    </div>
  )
}

// ─── Vue Semaine ──────────────────────────────────────────────

function WeekView({
  days,
  weekLabel,
  onPrev,
  onNext,
  onMove,
  canPrev,
  canNext,
}: {
  days: CalendarDay[]
  weekLabel: string
  onPrev: () => void
  onNext: () => void
  onMove: (from: string, to: string) => void
  canPrev: boolean
  canNext: boolean
}) {
  const [dragDate, setDragDate] = useState<string | null>(null)
  const [overDate, setOverDate] = useState<string | null>(null)

  function handleDrop(targetDate: string) {
    if (dragDate && dragDate !== targetDate) {
      onMove(dragDate, targetDate)
    }
    setDragDate(null)
    setOverDate(null)
  }

  const today = toISO(new Date())

  return (
    <div>
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onPrev}
          disabled={!canPrev}
          className="p-2 rounded-lg text-muted hover:text-cream disabled:opacity-30 transition"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm text-cream font-medium">{weekLabel}</span>
        <button
          onClick={onNext}
          disabled={!canNext}
          className="p-2 rounded-lg text-muted hover:text-cream disabled:opacity-30 transition"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Grille 7 colonnes */}
      <div className="grid grid-cols-7 gap-2">
        {/* Headers */}
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-xs text-dim uppercase tracking-wider py-1">
            {d}
          </div>
        ))}

        {/* Jours */}
        {days.map(day => {
          const isToday = day.date === today
          return (
            <div key={day.date} className="flex flex-col gap-1.5">
              <div className={`
                text-center text-xs rounded-full w-6 h-6 flex items-center justify-center mx-auto
                ${isToday ? 'bg-accent text-forest font-medium' : 'text-muted'}
              `}>
                {new Date(day.date).getDate()}
              </div>
              <SessionCard
                day={day}
                draggable={day.programDay?.type === 'training'}
                onDragStart={() => setDragDate(day.date)}
                onDragOver={() => setOverDate(day.date)}
                onDrop={() => handleDrop(day.date)}
                isDragOver={overDate === day.date && dragDate !== day.date}
              />
            </div>
          )
        })}
      </div>

      <p className="text-xs text-dim text-center mt-4 opacity-60">
        Glisse une séance pour la déplacer
      </p>
    </div>
  )
}

// ─── Vue Mois ─────────────────────────────────────────────────

function MonthView({
  year,
  month,
  days,
  onPrev,
  onNext,
}: {
  year: number
  month: number
  days: CalendarDay[]
  onPrev: () => void
  onNext: () => void
}) {
  const today = toISO(new Date())

  const dayMap = new Map(days.map(d => [d.date, d]))

  // Construire la grille du mois
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPad = (firstDay.getDay() + 6) % 7 // décalage lundi
  const totalCells = Math.ceil((startPad + lastDay.getDate()) / 7) * 7

  const cells: (CalendarDay | null)[] = []
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startPad + 1
    if (dayNum < 1 || dayNum > lastDay.getDate()) {
      cells.push(null)
    } else {
      const date = toISO(new Date(year, month, dayNum))
      cells.push(dayMap.get(date) ?? {
        date,
        day_index: (i % 7),
        programDay: null,
        isOverride: false,
      })
    }
  }

  return (
    <div>
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onPrev} className="p-2 rounded-lg text-muted hover:text-cream transition">
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm text-cream font-medium">
          {MONTH_NAMES[month]} {year}
        </span>
        <button onClick={onNext} className="p-2 rounded-lg text-muted hover:text-cream transition">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-xs text-dim uppercase tracking-wider py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Grille */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} className="aspect-square rounded-lg" />
          const isToday = day.date === today
          const isTraining = day.programDay?.type === 'training'

          return (
            <div
              key={day.date}
              className={`
                aspect-square rounded-lg p-1 flex flex-col gap-0.5 relative
                ${isTraining ? 'bg-accent/8 border border-accent/15' : 'border border-white/3'}
                ${isToday ? 'ring-1 ring-accent/60' : ''}
              `}
            >
              <span className={`text-[10px] font-medium ${isToday ? 'text-accent' : 'text-muted'}`}>
                {new Date(day.date).getDate()}
              </span>
              {isTraining && (
                <>
                  <Dumbbell size={10} className="text-accent mx-auto mt-auto mb-0.5" />
                  <span className="text-[9px] text-dim text-center truncate leading-tight">
                    {day.programDay!.label}
                  </span>
                  {day.isOverride && (
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-accent rounded-full" />
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>

      {/* Légende */}
      <div className="flex items-center gap-4 mt-4 text-xs text-dim">
        <span className="flex items-center gap-1.5">
          <Dumbbell size={11} className="text-accent" /> Entraînement
        </span>
        <span className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 bg-accent rounded-full" /> Séance déplacée
        </span>
      </div>
    </div>
  )
}

// ─── PlanningPanel principal ──────────────────────────────────

interface Props {
  program: Program | null
  overrides: ScheduleOverride[]
  clientId: string
  onOverrideCreated?: (override: ScheduleOverride) => void
}

export default function PlanningPanel({
  program,
  overrides,
  clientId,
  onOverrideCreated,
}: Props) {
  const [view, setView] = useState<'week' | 'month'>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [pendingMove, setPendingMove] = useState(false)

  // ── Calcul de la fenêtre à afficher ──────────────────────
  const weekStart = startOfWeek(currentDate)
  const weekEnd = addDays(weekStart, 6)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

  const from = view === 'week' ? weekStart : monthStart
  const to = view === 'week' ? weekEnd : monthEnd

  const calendarDays = program
    ? resolveCalendar(program, overrides, from, to)
    : []

  // ── Navigation ────────────────────────────────────────────
  function goNext() {
    if (view === 'week') setCurrentDate(d => addDays(d, 7))
    else setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  }

  function goPrev() {
    if (view === 'week') setCurrentDate(d => addDays(d, -7))
    else setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  }

  // ── Drag & drop → override ────────────────────────────────
  const handleMove = useCallback(async (fromDate: string, toDate: string) => {
    if (!program || pendingMove) return

    const fromDay = calendarDays.find(d => d.date === fromDate)
    if (!fromDay?.programDay) return

    setPendingMove(true)
    try {
      const res = await fetch('/api/programs/schedule-override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId: program.id,
          clientId,
          originalDayId: fromDay.programDay.id,
          newDate: toDate,
        }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      onOverrideCreated?.(data.override)
    } catch {
      // Silently fail — l'UI revient à son état
    } finally {
      setPendingMove(false)
    }
  }, [program, calendarDays, clientId, pendingMove])

  // ── Semaine courante label ────────────────────────────────
  const weekLabel = (() => {
    const s = weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    const e = weekEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    return `${s} — ${e}`
  })()

  // ── Programme absent ──────────────────────────────────────
  if (!program) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <CalendarDays size={32} className="text-dim opacity-40" />
        <p className="text-muted text-sm">
          Ton coach n&apos;a pas encore publié de programme.
        </p>
      </div>
    )
  }

  // ── Rendu ─────────────────────────────────────────────────
  return (
    <div>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl tracking-wide text-cream">
            MON PLANNING
          </h2>
          <p className="text-muted text-sm mt-0.5">
            {program.phase_name} — Semaine {program.week_current ?? '—'}/{program.week_total ?? '—'}
          </p>
        </div>

        {/* Toggle semaine / mois */}
        <div className="flex items-center gap-1 glass-pill p-1">
          <button
            onClick={() => setView('week')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
              view === 'week'
                ? 'bg-accent/15 text-cream border border-accent/20'
                : 'text-muted hover:text-cream'
            }`}
          >
            <CalendarDays size={13} />
            Semaine
          </button>
          <button
            onClick={() => setView('month')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
              view === 'month'
                ? 'bg-accent/15 text-cream border border-accent/20'
                : 'text-muted hover:text-cream'
            }`}
          >
            <LayoutGrid size={13} />
            Mois
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="glass shadow-glass-sm p-4">
        {view === 'week' ? (
          <WeekView
            days={calendarDays}
            weekLabel={weekLabel}
            onPrev={goPrev}
            onNext={goNext}
            onMove={handleMove}
            canPrev={true}
            canNext={true}
          />
        ) : (
          <MonthView
            year={currentDate.getFullYear()}
            month={currentDate.getMonth()}
            days={calendarDays}
            onPrev={goPrev}
            onNext={goNext}
          />
        )}
      </div>
    </div>
  )
}