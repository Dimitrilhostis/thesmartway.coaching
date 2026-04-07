// app/api/webhook/stripe/route.ts
// Ajoute ce handler à ton webhook existant, ou crée-le s'il n'existe pas encore.
// Dans le dashboard Stripe → Webhooks → ajouter l'événement : checkout.session.completed

import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })
const resend = new Resend(process.env.RESEND_API_KEY)

// Client admin Supabase (service role) — bypass RLS pour les inserts d'orders
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session    = event.data.object as Stripe.Checkout.Session
  const userId     = session.metadata?.user_id
  const productIds = session.metadata?.product_ids?.split(',').filter(Boolean) ?? []

  if (!userId || !productIds.length) {
    return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
  }

  // ── 1. Créer les orders ───────────────────────────────────
  const amountPerProduct = Math.round((session.amount_total ?? 0) / productIds.length)

  const { error: ordersError } = await supabaseAdmin.from('orders').insert(
    productIds.map(productId => ({
      user_id:                userId,
      product_id:             productId,
      stripe_session_id:      session.id,
      stripe_payment_intent:  session.payment_intent as string ?? null,
      amount_cents:           amountPerProduct,
      status:                 'paid',
      paid_at:                new Date().toISOString(),
    }))
  )

  if (ordersError) {
    console.error('Orders insert error:', ordersError)
    return NextResponse.json({ error: ordersError.message }, { status: 500 })
  }

  // ── 2. Vider le panier ────────────────────────────────────
  await supabaseAdmin
    .from('cart_items')
    .delete()
    .eq('user_id', userId)
    .in('product_id', productIds)

  // ── 3. Récupérer les produits pour le mail ────────────────
  const { data: products } = await supabaseAdmin
    .from('products')
    .select('name, file_url')
    .in('id', productIds)

  // ── 4. Récupérer l'email de l'user ────────────────────────
  const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId)
  const customerEmail = session.customer_email ?? user?.email

  if (customerEmail && products?.length) {
    const productList = products.map(p => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee">${p.name}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">
          ${p.file_url
            ? `<a href="${p.file_url}" style="color:#4a7c59;font-size:13px">Télécharger</a>`
            : '<span style="color:#999;font-size:13px">Disponible dans votre espace</span>'
          }
        </td>
      </tr>
    `).join('')

    await resend.emails.send({
      from:    'The Smart Way <no-reply@thesmartway.fr>',
      to:      customerEmail,
      subject: `Votre achat est confirmé — The Smart Way`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#1a1a1a">
          <h2 style="margin-bottom:4px">Merci pour votre achat</h2>
          <p style="color:#666;margin-top:0">Votre paiement a bien été reçu.</p>

          <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px">
            ${productList}
          </table>

          <div style="background:#f5f5f0;border-radius:12px;padding:16px;margin:20px 0">
            <p style="margin:0 0 8px;font-size:14px">Retrouvez tous vos achats dans votre espace personnel :</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL}/espace"
               style="display:inline-block;background:#1a1a1a;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:13px">
              Accéder à mon espace
            </a>
          </div>

          <p style="color:#999;font-size:12px">
            Numéro de commande : ${session.id}
          </p>
        </div>
      `,
    })
  }

  return NextResponse.json({ received: true })
}