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
  // Jointures optionnelles
  user?: User
  coach?: User
}

export interface Program {
  id: string
  client_id: string
  coach_id: string
  week_current: number
  week_total: number
  weekly_schedule: {
    mon?: string
    tue?: string
    wed?: string
    thu?: string
    fri?: string
    sat?: string
    sun?: string
  }
  nutrition: {
    calories?: number
    protein_g?: number
    carbs_g?: number
    fat_g?: number
    water_l?: number
  }
  published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
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
