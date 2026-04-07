// app/api/checkout/route.ts
// POST → crée une Stripe Checkout Session à partir du panier

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

export async function POST(req: Request) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { productIds } = await req.json()  // tableau d'IDs à acheter
  if (!productIds?.length) {
    return NextResponse.json({ error: 'Panier vide.' }, { status: 400 })
  }

  // ── Récupérer les produits ────────────────────────────────
  const { data: products } = await supabase
    .from('products')
    .select('id, name, price_cents, stripe_price_id, description')
    .in('id', productIds)
    .eq('published', true)

  if (!products?.length) {
    return NextResponse.json({ error: 'Produits introuvables.' }, { status: 404 })
  }

  // ── Vérifier que l'user ne possède pas déjà certains ─────
  const { data: alreadyOwned } = await supabase
    .from('orders')
    .select('product_id')
    .eq('user_id', user.id)
    .eq('status', 'paid')
    .in('product_id', productIds)

  const ownedIds = new Set((alreadyOwned ?? []).map(o => o.product_id))
  const toBuy = products.filter(p => !ownedIds.has(p.id))

  if (!toBuy.length) {
    return NextResponse.json({ error: 'Vous possédez déjà tous ces produits.' }, { status: 409 })
  }

  // ── Construire les line_items Stripe ──────────────────────
  const lineItems = toBuy.map(product => {
    // Si le produit a un stripe_price_id, on l'utilise directement
    if (product.stripe_price_id) {
      return { price: product.stripe_price_id, quantity: 1 }
    }
    // Sinon on crée un price_data inline
    return {
      price_data: {
        currency: 'eur',
        unit_amount: product.price_cents,
        product_data: {
          name: product.name,
          description: product.description ?? undefined,
        },
      },
      quantity: 1,
    }
  })

  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL

  // ── Créer la session Stripe ───────────────────────────────
  const session = await stripe.checkout.sessions.create({
    mode:                 'payment',
    line_items:           lineItems,
    success_url:          `${origin}/boutique/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:           `${origin}/boutique/panier`,
    customer_email:       user.email,
    metadata: {
      user_id:     user.id,
      product_ids: toBuy.map(p => p.id).join(','),
    },
    payment_intent_data: {
      metadata: {
        user_id:     user.id,
        product_ids: toBuy.map(p => p.id).join(','),
      },
    },
  })

  return NextResponse.json({ url: session.url })
}