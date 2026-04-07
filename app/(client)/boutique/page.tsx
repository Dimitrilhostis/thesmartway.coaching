// app/(public)/boutique/page.tsx
import { createClient } from '@/lib/supabase/server'
import BoutiqueClient from '@/components/client/BoutiqueClient'
import type { Product } from '@/lib/types'

export default async function BoutiquePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  // IDs des produits déjà achetés par l'user connecté
  let ownedIds: string[] = []
  if (user) {
    const { data: orders } = await supabase
      .from('orders')
      .select('product_id')
      .eq('user_id', user.id)
      .eq('status', 'paid')
    ownedIds = (orders ?? []).map(o => o.product_id)
  }

  // IDs dans le panier
  let cartIds: string[] = []
  if (user) {
    const { data: cart } = await supabase
      .from('cart_items')
      .select('product_id')
      .eq('user_id', user.id)
    cartIds = (cart ?? []).map(c => c.product_id)
  }

  return (
    <BoutiqueClient
      products={(products ?? []) as Product[]}
      ownedIds={ownedIds}
      initialCartIds={cartIds}
      isLoggedIn={!!user}
    />
  )
}