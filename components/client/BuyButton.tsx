'use client'

type Props = {
  productId: string
}

export default function BuyButton({ productId }: Props) {
  async function handleBuy() {
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error(data)
      alert("Impossible de lancer l'achat.")
      return
    }

    if (data.url) {
      window.location.href = data.url
    }
  }

  return (
    <button
      type="button"
      onClick={handleBuy}
      className="glass-pill px-4 py-2 text-sm text-cream hover:border-accent/30 transition"
    >
      Acheter
    </button>
  )
}