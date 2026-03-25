import { createClient } from '@/lib/supabase/server'
import ClientsView from '@/components/admin/ClientsView'

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { id?: string }
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: clients } = await supabase
    .from('clients')
    .select('*, user:users!user_id(id, full_name, email)')
    .order('created_at', { ascending: false })

  const activeId = searchParams.id ?? clients?.[0]?.id
  const selected = clients?.find((c: any) => c.id === activeId) ?? clients?.[0]

  const [{ data: program }, { data: note }, { data: messages }] = await Promise.all([
    supabase.from('programs').select('*').eq('client_id', activeId ?? '').order('updated_at', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('coach_notes').select('*').eq('client_id', activeId ?? '').maybeSingle(),
    supabase.from('messages').select('*, sender:users!sender_id(full_name)').or(`sender_id.eq.${selected?.user_id ?? 'none'},receiver_id.eq.${selected?.user_id ?? 'none'}`).order('sent_at', { ascending: true }).limit(50),
  ])

  return (
    <ClientsView
      clients={clients ?? []}
      selected={selected ?? null}
      activeId={activeId ?? null}
      program={program ?? null}
      note={note ?? null}
      messages={messages ?? []}
      currentUserId={user!.id}
    />
  )
}