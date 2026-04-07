'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ShoppingCart, X, Search, SlidersHorizontal,
  Star, Download, Lock, Loader2, ChevronRight, Package,
} from 'lucide-react'
import { formatPrice } from '@/lib/types'
import type { Product, ProductCategory } from '@/lib/types'

// ─── Helpers ─────────────────────────────────────────────────

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  programme: 'Programme',
  ebook:     'E-book',
  roadmap:   'Roadmap',
}

const CATEGORY_IMAGES: Record<ProductCategory, string> = {
  programme: '/images/biceps.jpeg',
  ebook:     '/images/ebook.jpeg',
  roadmap:   '/images/roadmap.jpeg',
}

const CATEGORIES: { id: ProductCategory | 'all'; label: string }[] = [
  { id: 'all',       label: 'Tout' },
  { id: 'programme', label: 'Programmes' },
  { id: 'ebook',     label: 'E-books' },
  { id: 'roadmap',   label: 'Roadmaps' },
]

// ─── Carte produit ────────────────────────────────────────────

function ProductCard({
  product,
  owned,
  inCart,
  onAddToCart,
  onRemoveFromCart,
  onOpen,
  adding,
}: {
  product: Product
  owned: boolean
  inCart: boolean
  onAddToCart: (id: string) => void
  onRemoveFromCart: (id: string) => void
  onOpen: (product: Product) => void
  adding: boolean
}) {
  return (
    <div className="glass shadow-glass-sm overflow-hidden border border-accent/10 flex flex-col group">
      {/* Image */}
      <button onClick={() => onOpen(product)} className="relative w-full aspect-[16/9] bg-white/3 overflow-hidden">
        <Image
          src={CATEGORY_IMAGES[product.category]}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/20" />
        {owned && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-accent/90 text-forest text-xs font-medium px-2 py-1 rounded-full">
            <Star size={10} className="fill-forest" /> Possédé
          </div>
        )}
        {product.badge && !owned && (
          <div className="absolute top-2 left-2 bg-white/10 backdrop-blur-sm text-cream text-xs px-2 py-1 rounded-full border border-white/20">
            {product.badge}
          </div>
        )}
      </button>

      {/* Contenu */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div>
          <p className="text-xs text-dim uppercase tracking-wider mb-1">
            {CATEGORY_LABELS[product.category]}
          </p>
          <h3
            className="text-sm font-medium text-cream leading-snug cursor-pointer hover:text-accent transition-colors"
            onClick={() => onOpen(product)}
          >
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-muted leading-relaxed mt-1.5 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <div>
            <span className="text-sm font-medium text-accent">
              {formatPrice(product.price_cents)}
            </span>
            {product.original_price_cents && product.original_price_cents > product.price_cents && (
              <span className="text-xs text-dim line-through ml-2">
                {formatPrice(product.original_price_cents)}
              </span>
            )}
          </div>

          {owned ? (
            <button
              onClick={() => onOpen(product)}
              className="flex items-center gap-1.5 glass-pill px-3 py-1.5 text-xs text-cream hover:border-accent/30 transition"
            >
              <Download size={12} /> Ouvrir
            </button>
          ) : inCart ? (
            <button
              onClick={() => onRemoveFromCart(product.id)}
              className="flex items-center gap-1.5 glass-pill px-3 py-1.5 text-xs text-accent border-accent/30 hover:text-red-400 hover:border-red-400/30 transition"
            >
              <X size={12} /> Retirer
            </button>
          ) : (
            <button
              onClick={() => onAddToCart(product.id)}
              disabled={adding}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/15 text-cream border border-accent/25 hover:bg-accent/25 disabled:opacity-50 transition text-xs"
            >
              {adding ? <Loader2 size={12} className="animate-spin" /> : <ShoppingCart size={12} />}
              Ajouter
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Modal fiche produit ──────────────────────────────────────

function ProductModal({
  product,
  owned,
  inCart,
  onAddToCart,
  onRemoveFromCart,
  onClose,
  adding,
}: {
  product: Product
  owned: boolean
  inCart: boolean
  onAddToCart: (id: string) => void
  onRemoveFromCart: (id: string) => void
  onClose: () => void
  adding: boolean
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="glass-dark w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden border border-accent/10 max-h-[90vh] flex flex-col">
        {/* Image */}
        <div className="relative w-full aspect-[16/7] shrink-0">
          <Image src={CATEGORY_IMAGES[product.category]} alt={product.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-black/30" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition"
          >
            <X size={16} />
          </button>
          {owned && (
            <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-accent/90 text-forest text-xs font-medium px-2.5 py-1 rounded-full">
              <Star size={10} className="fill-forest" /> Vous possédez ce produit
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-5 overflow-y-auto flex flex-col gap-4">
          <div>
            <p className="text-xs text-dim uppercase tracking-wider mb-1.5">
              {CATEGORY_LABELS[product.category]}
            </p>
            <h2 className="font-display text-xl tracking-wide text-cream">{product.name}</h2>
          </div>

          {product.description && (
            <p className="text-sm text-muted leading-relaxed">{product.description}</p>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-accent/10">
            <div>
              <span className="text-lg font-medium text-accent">{formatPrice(product.price_cents)}</span>
              {product.original_price_cents && product.original_price_cents > product.price_cents && (
                <span className="text-sm text-dim line-through ml-2">
                  {formatPrice(product.original_price_cents)}
                </span>
              )}
            </div>

            {owned ? (
              <a
                href={product.file_url ?? '/espace'}
                target={product.file_url ? '_blank' : undefined}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent/15 text-cream border border-accent/25 hover:bg-accent/25 transition text-sm"
              >
                <Download size={14} /> Télécharger
              </a>
            ) : inCart ? (
              <button
                onClick={() => { onRemoveFromCart(product.id); onClose() }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition text-sm"
              >
                <X size={14} /> Retirer du panier
              </button>
            ) : (
              <button
                onClick={() => onAddToCart(product.id)}
                disabled={adding}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent/15 text-cream border border-accent/25 hover:bg-accent/25 disabled:opacity-50 transition text-sm"
              >
                {adding ? <Loader2 size={14} className="animate-spin" /> : <ShoppingCart size={14} />}
                Ajouter au panier
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Panneau panier ───────────────────────────────────────────

function CartPanel({
  products,
  cartIds,
  onRemove,
  onCheckout,
  checkingOut,
  isLoggedIn,
  onClose,
}: {
  products: Product[]
  cartIds: string[]
  onRemove: (id: string) => void
  onCheckout: () => void
  checkingOut: boolean
  isLoggedIn: boolean
  onClose: () => void
}) {
  const cartProducts = products.filter(p => cartIds.includes(p.id))
  const total = cartProducts.reduce((sum, p) => sum + p.price_cents, 0)

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="glass-dark w-full max-w-sm h-full border-l border-accent/10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-accent/10">
          <div className="flex items-center gap-2">
            <ShoppingCart size={16} className="text-accent" />
            <span className="text-sm font-medium text-cream">Mon panier</span>
            <span className="glass-pill text-xs text-accent px-2 py-0.5">{cartIds.length}</span>
          </div>
          <button onClick={onClose} className="p-1 text-muted hover:text-cream transition">
            <X size={16} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {cartProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <Package size={32} className="text-dim opacity-40" />
              <p className="text-sm text-muted">Votre panier est vide.</p>
            </div>
          ) : (
            cartProducts.map(product => (
              <div key={product.id} className="flex items-center gap-3 glass p-3 rounded-xl">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  <Image src={CATEGORY_IMAGES[product.category]} alt={product.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-cream truncate">{product.name}</p>
                  <p className="text-xs text-accent">{formatPrice(product.price_cents)}</p>
                </div>
                <button
                  onClick={() => onRemove(product.id)}
                  className="p-1 text-dim hover:text-red-400 transition shrink-0"
                >
                  <X size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartProducts.length > 0 && (
          <div className="p-4 border-t border-accent/10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Total</span>
              <span className="text-lg font-medium text-cream">{formatPrice(total)}</span>
            </div>

            {!isLoggedIn ? (
              <a
                href={`/login?redirect=/boutique`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-accent/15 text-cream border border-accent/25 hover:bg-accent/25 transition text-sm font-medium"
              >
                <Lock size={14} /> Se connecter pour acheter
              </a>
            ) : (
              <button
                onClick={onCheckout}
                disabled={checkingOut}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-accent/15 text-cream border border-accent/25 hover:bg-accent/25 disabled:opacity-50 transition text-sm font-medium"
              >
                {checkingOut
                  ? <Loader2 size={14} className="animate-spin" />
                  : <ChevronRight size={14} />
                }
                {checkingOut ? 'Redirection…' : 'Passer au paiement'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── BoutiqueClient principal ─────────────────────────────────

interface Props {
  products: Product[]
  ownedIds: string[]
  initialCartIds: string[]
  isLoggedIn: boolean
}

export default function BoutiqueClient({ products, ownedIds, initialCartIds, isLoggedIn }: Props) {
  const router = useRouter()

  const [search, setSearch]           = useState('')
  const [category, setCategory]       = useState<ProductCategory | 'all'>('all')
  const [cartIds, setCartIds]         = useState<string[]>(initialCartIds)
  const [cartOpen, setCartOpen]       = useState(false)
  const [openProduct, setOpenProduct] = useState<Product | null>(null)
  const [adding, setAdding]           = useState<string | null>(null)  // productId en cours
  const [checkingOut, setCheckingOut] = useState(false)

  // ── Filtrage ───────────────────────────────────────────────
  const filtered = products.filter(p => {
    const matchCat    = category === 'all' || p.category === category
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  // ── Panier ─────────────────────────────────────────────────
  const addToCart = useCallback(async (productId: string) => {
    if (!isLoggedIn) { router.push('/login?redirect=/boutique'); return }
    setAdding(productId)
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      if (res.ok) {
        setCartIds(prev => [...prev, productId])
        setCartOpen(true)
      }
    } finally {
      setAdding(null)
    }
  }, [isLoggedIn, router])

  const removeFromCart = useCallback(async (productId: string) => {
    await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    })
    setCartIds(prev => prev.filter(id => id !== productId))
  }, [])

  // ── Checkout ───────────────────────────────────────────────
  const handleCheckout = useCallback(async () => {
    setCheckingOut(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: cartIds }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setCheckingOut(false)
    }
  }, [cartIds])

  return (
    <div className="min-h-[calc(100vh-56px)]">

      {/* Hero */}
      <div className="px-4 md:px-8 pt-8 pb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl md:text-4xl tracking-wide text-cream mb-1">
              BOUTIQUE
            </h1>
            <p className="text-muted text-sm">
              Programmes, e-books et roadmaps pour atteindre tes objectifs.
            </p>
          </div>

          {/* Bouton panier */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 glass-pill px-4 py-2.5 text-sm text-cream hover:border-accent/30 transition"
          >
            <ShoppingCart size={16} />
            Panier
            {cartIds.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-accent rounded-full text-forest text-xs font-medium flex items-center justify-center">
                {cartIds.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="px-4 md:px-8 mb-6 flex items-center gap-3 flex-wrap">
        {/* Recherche */}
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher…"
            className="w-full bg-transparent border border-accent/15 rounded-xl pl-9 pr-3 py-2 text-sm text-cream placeholder:text-dim focus:outline-none focus:border-accent/40 transition-colors"
          />
        </div>

        {/* Catégories */}
        <div className="flex items-center gap-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                category === cat.id
                  ? 'bg-accent/15 text-cream border border-accent/20'
                  : 'text-muted hover:text-cream hover:bg-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-dim ml-auto">
          {filtered.length} produit{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grille */}
      <div className="px-4 md:px-8 pb-12">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <SlidersHorizontal size={32} className="text-dim opacity-40" />
            <p className="text-muted text-sm">Aucun produit ne correspond à ta recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                owned={ownedIds.includes(product.id)}
                inCart={cartIds.includes(product.id)}
                onAddToCart={addToCart}
                onRemoveFromCart={removeFromCart}
                onOpen={setOpenProduct}
                adding={adding === product.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal fiche produit */}
      {openProduct && (
        <ProductModal
          product={openProduct}
          owned={ownedIds.includes(openProduct.id)}
          inCart={cartIds.includes(openProduct.id)}
          onAddToCart={addToCart}
          onRemoveFromCart={removeFromCart}
          onClose={() => setOpenProduct(null)}
          adding={adding === openProduct.id}
        />
      )}

      {/* Panneau panier */}
      {cartOpen && (
        <CartPanel
          products={products}
          cartIds={cartIds}
          onRemove={removeFromCart}
          onCheckout={handleCheckout}
          checkingOut={checkingOut}
          isLoggedIn={isLoggedIn}
          onClose={() => setCartOpen(false)}
        />
      )}
    </div>
  )
}