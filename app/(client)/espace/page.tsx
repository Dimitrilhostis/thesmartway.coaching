import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PlanningPanel from '@/components/client/PlanningPanel'
import MessagesPanel from '@/components/client/MessagesPanel'
import NotificationsPanel from '@/components/client/NotificationsPanel'
import EspaceClient from '@/components/client/EspaceClient'

export default async function EspacePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('clients')
    .select('*, user:users(*), coach:users!coach_id(*)')
    .eq('user_id', user.id)
    .single()

  const { data: program } = await supabase
    .from('programs').select('*')
    .eq('client_id', client?.id ?? '').eq('published', true)
    .order('updated_at', { ascending: false }).limit(1).maybeSingle()

  const { data: messages } = await supabase
    .from('messages').select('*, sender:users!sender_id(*)')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order('sent_at', { ascending: true }).limit(30)

  const { data: notifications } = await supabase
    .from('notifications').select('*')
    .eq('client_id', client?.id ?? '')
    .order('scheduled_at', { ascending: false }).limit(20)

  const { data: coach } = await supabase
    .from('users').select('id, full_name').eq('role', 'admin').limit(1).single()

  return (
    <EspaceClient
      client={client}
      program={program}
      messages={messages ?? []}
      notifications={notifications ?? []}
      currentUserId={user.id}
      coach={coach}
    />
  )
}