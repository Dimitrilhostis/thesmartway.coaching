// app/api/booking/slots/route.ts
// GET /api/booking/slots?date=2025-06-15&serviceId=xxx
// Retourne les créneaux disponibles pour une date + prestation données

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

function timeToMinutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(minutes: number) {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date      = searchParams.get('date')       // "2025-06-15"
  const serviceId = searchParams.get('serviceId')

  if (!date || !serviceId) {
    return NextResponse.json({ error: 'Missing date or serviceId' }, { status: 400 })
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  // ── 1. Récupérer la prestation ────────────────────────────
  const { data: service } = await supabase
    .from('massage_services')
    .select('duration_min')
    .eq('id', serviceId)
    .single()

  if (!service) {
    return NextResponse.json({ error: 'Service not found' }, { status: 404 })
  }

  // ── 2. Vérifier exception ce jour ────────────────────────
  const { data: exception } = await supabase
    .from('availability_exceptions')
    .select('*')
    .eq('date', date)
    .maybeSingle()

  if (exception?.closed) {
    return NextResponse.json({ slots: [] })
  }

  // ── 3. Récupérer la règle du jour de la semaine ───────────
  const dayOfWeek = new Date(date).getDay()  // 0=dim

  let startTime: string
  let endTime: string

  if (exception && !exception.closed && exception.start_time && exception.end_time) {
    startTime = exception.start_time
    endTime   = exception.end_time
  } else {
    const { data: rule } = await supabase
      .from('availability_rules')
      .select('start_time, end_time')
      .eq('day_of_week', dayOfWeek)
      .eq('active', true)
      .maybeSingle()

    if (!rule) {
      return NextResponse.json({ slots: [] })  // jour fermé
    }
    startTime = rule.start_time
    endTime   = rule.end_time
  }

  // ── 4. Récupérer les réservations existantes ce jour ─────
  const startOfDay = `${date}T00:00:00Z`
  const endOfDay   = `${date}T23:59:59Z`

  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('starts_at, ends_at')
    .gte('starts_at', startOfDay)
    .lte('starts_at', endOfDay)
    .neq('status', 'cancelled')

  // ── 5. Générer les créneaux (pas de 30 min) ───────────────
  const slotStep      = 30
  const duration      = service.duration_min
  const startMin      = timeToMinutes(startTime.slice(0, 5))
  const endMin        = timeToMinutes(endTime.slice(0, 5))
  const nowDate       = new Date()
  const isToday       = date === nowDate.toISOString().split('T')[0]
  const nowMin        = isToday ? nowDate.getHours() * 60 + nowDate.getMinutes() + 60 : 0  // +1h buffer

  const slots = []

  for (let min = startMin; min + duration <= endMin; min += slotStep) {
    // Ignorer les créneaux dans le passé
    if (isToday && min < nowMin) continue

    const slotStart = `${date}T${minutesToTime(min)}:00`
    const slotEnd   = `${date}T${minutesToTime(min + duration)}:00`

    // Vérifier chevauchement avec réservations existantes
    const overlaps = (existingBookings ?? []).some(b => {
      const bStart = new Date(b.starts_at).getTime()
      const bEnd   = new Date(b.ends_at).getTime()
      const sStart = new Date(slotStart).getTime()
      const sEnd   = new Date(slotEnd).getTime()
      return sStart < bEnd && sEnd > bStart
    })

    slots.push({
      start:     slotStart,
      end:       slotEnd,
      available: !overlaps,
    })
  }

  return NextResponse.json({ slots })
}