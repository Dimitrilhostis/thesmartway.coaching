import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServiceClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Signature webhook invalide' }, { status: 400 })
  }

  const supabase = createServiceClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // Mettre à jour l'order en 'paid'
    await supabase
      .from('orders')
      .update({
        status: 'paid',
        stripe_payment_intent: session.payment_intent as string,
        paid_at: new Date().toISOString(),
      })
      .eq('stripe_session_id', session.id)

    // TODO: envoyer un email de confirmation (Resend)
    // TODO: donner accès au fichier PDF si ebook
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session
    await supabase
      .from('orders')
      .update({ status: 'failed' })
      .eq('stripe_session_id', session.id)
  }

  return NextResponse.json({ received: true })
}
