'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Product } from '@/lib/types'

export default function AdminProductActions({ product }: { product: Product }) {
  const supabase = createClient()
  const [published, setPublished] = useState(product.published)
  const [loading, setLoading] = useState(false)

  async function togglePublish() {
    setLoading(true)
    const newVal = !published
    await supabase.from('products').update({ published: newVal }).eq('id', product.id)
    setPublished(newVal)
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={togglePublish} disabled={loading}
        className="btn-ghost text-xs px-3 py-1.5 rounded-lg disabled:opacity-40">
        {loading ? '...' : published ? 'Dépublier' : 'Publier'}
      </button>
      <button className="btn-ghost text-xs px-3 py-1.5 rounded-lg">✎ Modifier</button>
    </div>
  )
}