'use client'

import { useState } from 'react'

export default function BuyButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleBuy() {
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    })
    const { url, error } = await res.json()
  
    // Si non connecté, rediriger vers login
    if (res.status === 401) {
      window.location.href = '/login'
      return
    }
  
    if (error) { alert(error); setLoading(false); return }
    window.location.href = url
  }

  return (
    <button onClick={handleBuy} disabled={loading}
      className="btn-primary text-xs px-4 py-2 disabled:opacity-50">
      {loading ? '...' : 'Acheter'}
    </button>
  )
}