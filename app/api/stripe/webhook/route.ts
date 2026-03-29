import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    return new Response('Missing webhook secret or signature', { status: 400 })
  }

  let event: Stripe.Event

  try {
    const body = await req.text()

    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Invalid signature', { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const userId =
        session.metadata?.userId ?? session.client_reference_id ?? null
      const productId = session.metadata?.productId ?? null

      if (!userId || !productId) {
        console.error('Missing userId or productId in checkout.session.completed', {
          sessionId: session.id,
          metadata: session.metadata,
        })
        return new Response('Missing metadata', { status: 400 })
      }

      const { error } = await supabaseAdmin
        .from('user_products')
        .upsert(
          {
            user_id: userId,
            product_id: productId,
            source: 'stripe',
            status: 'owned',
          },
          {
            onConflict: 'user_id,product_id',
          }
        )

      if (error) {
        console.error('Supabase upsert error:', error)
        return new Response('Database error', { status: 500 })
      }
    }

    // Optionnel plus tard :
    // if (event.type === 'charge.refunded') { ... }
    // if (event.type === 'checkout.session.expired') { ... }

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('Webhook handler error:', err)
    return new Response('Webhook handler failed', { status: 500 })
  }
}