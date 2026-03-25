import { createClient } from '@/lib/supabase/server'
import ClientNav from '@/components/client/ClientNav'

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ClientNav user={profile} />
      <main className="flex-1">{children}</main>
    </div>
  )
}   