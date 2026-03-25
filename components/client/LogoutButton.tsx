'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button onClick={logout}
      className="w-full glass border border-danger/20 text-danger hover:bg-danger/10 py-3 rounded-2xl text-sm transition-all">
      Déconnexion
    </button>
  )
}