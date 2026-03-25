import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TimerPage from './page'

export default async function TimerGuard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/outils/timer')

  const { data: client } = await supabase
    .from('clients')
    .select('status')
    .eq('user_id', user.id)
    .single()

  if (client?.status !== 'active') {
    redirect('/outils?locked=timer')
  }

  return <TimerPage />
}