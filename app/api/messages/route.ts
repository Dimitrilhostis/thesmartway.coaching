import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const COACH_WHATSAPP = '33768704364'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { content, receiverId } = await request.json()

  if (!content?.trim()) {
    return NextResponse.json({ error: 'Message vide' }, { status: 400 })
  }

  // Récupérer le nom du client pour le préfixe WhatsApp
  const { data: profile } = await supabase
    .from('users')
    .select('full_name')
    .eq('id', user.id)
    .single()

  // Sauvegarder dans Supabase
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content: content.trim(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Erreur envoi' }, { status: 500 })
  }

  // Construire le lien wa.me avec préfixe identifiant le client
  const clientName = profile?.full_name ?? 'Un client'
  const waText = `[Smart Way - ${clientName}]\n${content.trim()}`
  const waUrl = `https://wa.me/${COACH_WHATSAPP}?text=${encodeURIComponent(waText)}`

  return NextResponse.json({ message, waUrl })
}