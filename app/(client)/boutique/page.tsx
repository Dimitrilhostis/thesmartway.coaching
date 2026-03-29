import { createClient } from '@/lib/supabase/server'
import BoutiqueClient from '@/components/client/BoutiqueClient'

export default async function BoutiquePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('published', true)
    .order('created_at')

  let ownedProductIds: string[] = []

  if (user) {
    const { data: ownedRows } = await supabase
      .from('user_products')
      .select('product_id')
      .eq('user_id', user.id)
      .eq('status', 'owned')

    ownedProductIds = (ownedRows ?? []).map((row) => row.product_id)
  }

  return (
    <BoutiqueClient
      products={products ?? []}
      isLoggedIn={!!user}
      ownedProductIds={ownedProductIds}
    />
  )
}