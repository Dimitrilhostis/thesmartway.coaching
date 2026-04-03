// Types générés depuis le schéma Supabase
// Tu peux aussi auto-générer avec : npx supabase gen types typescript --project-id TON_ID

export type Role = 'client' | 'admin'
export type ClientStatus = 'active' | 'paused' | 'inactive'
export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type ProductCategory = 'programme' | 'ebook' | 'roadmap'
export type NotifType = 'workout' | 'message' | 'program' | 'promo' | 'custom'

export interface User {
  id: string
  email: string
  full_name: string | null
  role: Role
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  user_id: string
  coach_id: string | null
  goal: string | null
  phone: string | null
  whatsapp_id: string | null
  weight_kg: number | null
  height_cm: number | null
  status: ClientStatus
  start_date: string | null
  notes_public: string | null
  created_at: string
  updated_at: string
  user?: User
  coach?: User
}

export type ProgramStatus  = 'draft' | 'active' | 'completed' | 'archived'
export type ScheduleMode   = 'recurring' | 'free'

export interface Program {
  id: string
  client_id: string | null
  template_id: string | null
  phase_name: string
  schedule_mode: ScheduleMode   // 'recurring' = semaine type | 'free' = jours libres
  week_count: number
  start_date: string | null
  status: ProgramStatus
  created_by: string
  created_at: string
  weeks: ProgramWeek[]          // renseigné en mode recurring
  free_days: ProgramDay[]       // renseigné en mode free
  week_current?: number
  week_total?: number
}

export interface ScheduleOverride {
  id: string
  program_id: string
  client_id: string
  original_day_id: string
  new_date: string
  moved_at: string
  seen_by_coach: boolean
}

export interface CalendarDay {
  date: string
  day_index: number
  programDay: ProgramDay | null
  isOverride: boolean
  overrideId?: string
}

export interface CalendarWeek {
  weekNumber: number
  startDate: string
  days: CalendarDay[]
}

export interface ProgramTemplate {
  id: string
  coach_id: string
  name: string
  phase_name: string
  week_count: number
  weeks: ProgramWeek[]
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  sent_at: string
  whatsapp_msg_id: string | null
  sender?: User
  receiver?: User
}

export interface Notification {
  id: string
  client_id: string
  type: NotifType
  title: string
  body: string | null
  scheduled_at: string
  sent: boolean
  sent_at: string | null
  created_at: string
}

export interface CoachNote {
  id: string
  coach_id: string
  client_id: string
  content: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  category: ProductCategory
  description: string | null
  price_cents: number
  original_price_cents: number | null
  stripe_price_id: string | null
  badge: string | null
  published: boolean
  file_url: string | null
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  user_id: string
  product_id: string
  stripe_session_id: string | null
  stripe_payment_intent: string | null
  amount_cents: number
  status: OrderStatus
  paid_at: string | null
  created_at: string
  product?: Product
}

export interface Exercise {
  id: string
  day_id: string
  name: string
  sets: number
  reps: string
  notes: string | null
  order: number
}

export interface ProgramWeek {
  id: string
  program_id: string
  week_number: number
  days: ProgramDay[]
}

export type DayType = 'training' | 'rest'

export interface ProgramDay {
  id: string
  week_id: string | null      // null en mode free
  program_id: string | null   // renseigné en mode free
  day_index: number           // 0-6, utilisé en mode recurring
  day_number: number          // 1-based absolu, utilisé en mode free
  label: string
  type: DayType
  exercises: Exercise[]
}

// Helper : formate les centimes en euros
export function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  })
}

// Jours de la semaine en français
export const DAYS: Record<string, string> = {
  mon: 'Lundi',
  tue: 'Mardi',
  wed: 'Mercredi',
  thu: 'Jeudi',
  fri: 'Vendredi',
  sat: 'Samedi',
  sun: 'Dimanche',
}