import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { productId } = await request.json()

  // Récupérer le produit depuis Supabase
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('published', true)
    .single()

  if (!product) {
    return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 })
  }

  // Créer la session Stripe Checkout
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          unit_amount: product.price_cents,
          product_data: {
            name: product.name,
            description: product.description ?? undefined,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/boutique?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/boutique?cancelled=1`,
    metadata: {
      user_id: user.id,
      product_id: product.id,
    },
    customer_email: user.email,
  })

  // Créer l'order en pending dans Supabase
  await supabase.from('orders').insert({
    user_id: user.id,
    product_id: product.id,
    stripe_session_id: session.id,
    amount_cents: product.price_cents,
    status: 'pending',
  })

  return NextResponse.json({ url: session.url })
}
