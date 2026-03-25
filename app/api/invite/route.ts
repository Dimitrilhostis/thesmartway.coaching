import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { data: profile } = await supabase
    .from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
  }

  const { email } = await request.json()
  if (!email?.trim()) {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 })
  }

  // Vérifier si une invitation active existe déjà
  const { data: existing } = await supabase
    .from('invitations')
    .select('token, expires_at')
    .eq('email', email.trim().toLowerCase())
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (existing) {
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${existing.token}`
    return NextResponse.json({ token: existing.token, url: inviteUrl, reused: true })
  }

  // Créer une nouvelle invitation
  const { data: invitation, error } = await supabase
    .from('invitations')
    .insert({ email: email.trim().toLowerCase() })
    .select('token')
    .single()

  if (error || !invitation) {
    return NextResponse.json({ error: 'Erreur création invitation' }, { status: 500 })
  }

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invitation.token}`
  return NextResponse.json({ token: invitation.token, url: inviteUrl })
}