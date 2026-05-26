import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClientNav from '@/components/client/ClientNav'
import { headers } from 'next/headers'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
    profile = data
  }

  if (profile?.role === 'admin') redirect('/admin/dashboard')

  // Détecter si on est sur une page roadmap individuelle
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''
  const isWhiteboard = /^\/roadmaps\/[^/]+$/.test(pathname)

  if (isWhiteboard) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ClientNav user={profile} />
      <main className="flex-1">{children}</main>
    </div>
  )
}