// app/api/programs/schedule-override/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { programId, clientId, originalDayId, newDate } = await req.json()

  if (!programId || !clientId || !originalDayId || !newDate) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Vérifier que le client est bien le demandeur
  const { data: client } = await supabase
    .from('clients')
    .select('id, coach_id')
    .eq('id', clientId)
    .eq('user_id', user.id)
    .single()

  if (!client) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Upsert de l'override (un seul override par originalDayId)
  const { data: override, error } = await supabase
    .from('schedule_overrides')
    .upsert({
      program_id: programId,
      client_id: clientId,
      original_day_id: originalDayId,
      new_date: newDate,
      moved_at: new Date().toISOString(),
      seen_by_coach: false,
    }, {
      onConflict: 'program_id,original_day_id',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Créer une notification pour le coach
  await supabase.from('notifications').insert({
    user_id: client.coach_id,
    type: 'schedule_override',
    content: `Un client a déplacé une séance au ${new Date(newDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}.`,
    sent: false,
  })

  return NextResponse.json({ override })
}