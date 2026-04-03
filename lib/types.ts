// ─────────────────────────────────────────────
// lib/types.ts  —  ajouts pour le système programme
// ─────────────────────────────────────────────

// ── Exercice ─────────────────────────────────
export interface Exercise {
  id: string
  day_id: string
  name: string
  sets: number
  reps: string        // "8-12" ou "AMRAP" ou "60s"
  notes: string | null
  order: number
}

// ── Jour ─────────────────────────────────────
export type DayType = 'training' | 'rest'

export interface ProgramDay {
  id: string
  week_id: string | null    // null en mode free
  program_id: string | null // renseigné en mode free
  day_index: number         // 0-6, utilisé en mode recurring
  day_number: number        // 1-based absolu, utilisé en mode free
  label: string
  type: DayType
  exercises: Exercise[]
}

// ── Semaine type (répétée N fois dans la phase) ──
export interface ProgramWeek {
  id: string
  program_id: string
  week_number: number // 1-based, ordre d'affichage
  days: ProgramDay[]
}

// ── Programme / Phase ─────────────────────────
export type ProgramStatus   = 'draft' | 'active' | 'completed' | 'archived'
export type ScheduleMode    = 'recurring' | 'free'

export interface Program {
  id: string
  client_id: string | null    // null = template pur
  template_id: string | null  // référence au template source
  phase_name: string          // "Prise de masse", "Sèche"…
  schedule_mode: ScheduleMode // 'recurring' = semaine type | 'free' = jours libres
  week_count: number          // nb de semaines dans la phase
  start_date: string | null   // ISO date, null si draft/template
  status: ProgramStatus
  created_by: string          // coach user_id
  created_at: string
  weeks: ProgramWeek[]        // renseigné en mode recurring
  free_days: ProgramDay[]     // renseigné en mode free
  // meta calculée côté client
  week_current?: number
  week_total?: number
}

// ── Template (programme réutilisable) ─────────
export interface ProgramTemplate {
  id: string
  coach_id: string
  name: string                // nom du template, ex: "PPL 12 semaines"
  phase_name: string
  week_count: number
  weeks: ProgramWeek[]
  created_at: string
}

// ── Override de planning (drag & drop client) ─
export interface ScheduleOverride {
  id: string
  program_id: string
  client_id: string
  original_day_id: string     // ProgramDay.id de la séance déplacée
  new_date: string            // ISO date choisie par le client
  moved_at: string
  seen_by_coach: boolean
}

// ── Vue calendrier côté client ────────────────
// Résolution d'une semaine réelle à partir
// de la semaine type + les overrides
export interface CalendarDay {
  date: string                // ISO date "2025-01-06"
  day_index: number           // 0-6
  programDay: ProgramDay | null
  isOverride: boolean         // séance déplacée par le client
  overrideId?: string
}

export interface CalendarWeek {
  weekNumber: number          // numéro dans la phase (1-based)
  startDate: string
  days: CalendarDay[]
}

// ── Types existants conservés ─────────────────
export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  created_at: string
  read: boolean
}

export interface Notification {
  id: string
  user_id: string
  type: string
  content: string
  sent: boolean
  created_at: string
}

export interface CoachNote {
  id: string
  client_id: string
  content: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  description: string
  category: string
  price_cents: number
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100)
}