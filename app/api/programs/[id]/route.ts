// app/api/programs/[id]/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const programId = params.id
  const body = await req.json()
  const { phaseName, scheduleMode, weekCount, startDate, status, week, freeDays } = body

  // Vérifier que le coach est bien le créateur
  const { data: existing } = await supabase
    .from('programs')
    .select('id, created_by')
    .eq('id', programId)
    .single()

  if (!existing || existing.created_by !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // ── 1. Mettre à jour les métadonnées ──────────────────────
  await supabase.from('programs').update({
    phase_name:    phaseName,
    schedule_mode: scheduleMode,
    week_count:    weekCount,
    start_date:    startDate ?? null,
    status:        status ?? 'draft',
  }).eq('id', programId)

  // ── 2. Supprimer l'ancienne structure et recréer ──────────
  // Mode récurrence : supprimer les semaines (cascade sur days + exercises)
  await supabase.from('program_weeks').delete().eq('program_id', programId)
  // Mode libre : supprimer les jours directs
  await supabase.from('program_days').delete().eq('program_id', programId)

  // ── 3. Recréer selon le mode ──────────────────────────────
  if (scheduleMode === 'recurring' && week?.days) {
    const { data: programWeek } = await supabase
      .from('program_weeks')
      .insert({ program_id: programId, week_number: 1 })
      .select()
      .single()

    if (programWeek) {
      for (const day of week.days) {
        const { data: programDay } = await supabase
          .from('program_days')
          .insert({ week_id: programWeek.id, day_index: day.day_index, label: day.label, type: day.type })
          .select()
          .single()

        if (programDay && day.exercises?.length) {
          await supabase.from('program_exercises').insert(
            day.exercises.map((e: any) => ({ day_id: programDay.id, name: e.name, sets: e.sets, reps: e.reps, notes: e.notes ?? null, order: e.order }))
          )
        }
      }
    }
  }

  if (scheduleMode === 'free' && freeDays?.length) {
    for (const day of freeDays) {
      const { data: programDay } = await supabase
        .from('program_days')
        .insert({ program_id: programId, day_number: day.day_number, label: day.label, type: day.type })
        .select()
        .single()

      if (programDay && day.exercises?.length) {
        await supabase.from('program_exercises').insert(
          day.exercises.map((e: any) => ({ day_id: programDay.id, name: e.name, sets: e.sets, reps: e.reps, notes: e.notes ?? null, order: e.order }))
        )
      }
    }
  }

  // ── 4. Retourner le programme complet ─────────────────────
  const { data: full } = await supabase
    .from('programs')
    .select(`
      *,
      weeks:program_weeks(
        *,
        days:program_days(*, exercises:program_exercises(*))
      ),
      free_days:program_days!program_id(*, exercises:program_exercises(*))
    `)
    .eq('id', programId)
    .single()

  return NextResponse.json({ program: full })
}