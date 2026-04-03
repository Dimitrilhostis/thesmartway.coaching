// app/api/programs/route.ts
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

  const body = await req.json()
  const { clientId, phaseName, scheduleMode, weekCount, startDate, status, week, freeDays } = body

  if (!phaseName || !scheduleMode) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // ── 1. Créer le programme ─────────────────────────────────
  const { data: program, error: progError } = await supabase
    .from('programs')
    .insert({
      client_id:     clientId ?? null,
      phase_name:    phaseName,
      schedule_mode: scheduleMode,
      week_count:    weekCount,
      start_date:    startDate ?? null,
      status:        status ?? 'draft',
      created_by:    user.id,
    })
    .select()
    .single()

  if (progError || !program) {
    return NextResponse.json({ error: progError?.message ?? 'Insert program failed' }, { status: 500 })
  }

  // ── 2a. Mode récurrence : créer semaine + jours ───────────
  if (scheduleMode === 'recurring' && week?.days) {
    const { data: programWeek, error: weekError } = await supabase
      .from('program_weeks')
      .insert({ program_id: program.id, week_number: 1 })
      .select()
      .single()

    if (weekError || !programWeek) {
      return NextResponse.json({ error: weekError?.message ?? 'Insert week failed' }, { status: 500 })
    }

    for (const day of week.days) {
      const { data: programDay, error: dayError } = await supabase
        .from('program_days')
        .insert({
          week_id:   programWeek.id,
          day_index: day.day_index,
          label:     day.label,
          type:      day.type,
        })
        .select()
        .single()

      if (dayError || !programDay) continue

      if (day.exercises?.length) {
        await supabase.from('program_exercises').insert(
          day.exercises.map((e: any) => ({
            day_id: programDay.id,
            name:   e.name,
            sets:   e.sets,
            reps:   e.reps,
            notes:  e.notes ?? null,
            order:  e.order,
          }))
        )
      }
    }
  }

  // ── 2b. Mode libre : jours directement sur le programme ───
  if (scheduleMode === 'free' && freeDays?.length) {
    for (const day of freeDays) {
      const { data: programDay, error: dayError } = await supabase
        .from('program_days')
        .insert({
          program_id: program.id,
          day_number: day.day_number,
          label:      day.label,
          type:       day.type,
        })
        .select()
        .single()

      if (dayError || !programDay) continue

      if (day.exercises?.length) {
        await supabase.from('program_exercises').insert(
          day.exercises.map((e: any) => ({
            day_id: programDay.id,
            name:   e.name,
            sets:   e.sets,
            reps:   e.reps,
            notes:  e.notes ?? null,
            order:  e.order,
          }))
        )
      }
    }
  }

  // ── 3. Retourner le programme complet ─────────────────────
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
    .eq('id', program.id)
    .single()

  return NextResponse.json({ program: full }, { status: 201 })
}