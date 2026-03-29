import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const productId = body.productId as string | undefined

    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 })
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name, stripe_price_id, published')
      .eq('id', productId)
      .eq('published', true)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    if (!product.stripe_price_id) {
      return NextResponse.json({ error: 'Missing stripe_price_id on product' }, { status: 400 })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!
    if (!siteUrl) {
      return NextResponse.json({ error: 'Missing NEXT_PUBLIC_SITE_URL' }, { status: 500 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: product.stripe_price_id,
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/espace?checkout=success`,
      cancel_url: `${siteUrl}/boutique?checkout=cancel`,
      customer_email: user.email ?? undefined,

      // pratique pour retrouver le user
      client_reference_id: user.id,

      // très important pour le webhook
      metadata: {
        userId: user.id,
        productId: product.id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}