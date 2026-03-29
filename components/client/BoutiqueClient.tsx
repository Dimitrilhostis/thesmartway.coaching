'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import BuyButton from '@/components/client/BuyButton'
import { formatPrice, type Product } from '@/lib/types'

type CategoryKey = 'all' | 'programme' | 'ebook' | 'roadmap' | 'owned'

function getBaseCategories(isLoggedIn: boolean): { key: CategoryKey; label: string }[] {
  return [
    { key: 'all', label: 'Tout' },
    ...(isLoggedIn ? [{ key: 'owned' as CategoryKey, label: 'Possédés' }] : []),
    { key: 'programme', label: 'Programmes' },
    { key: 'ebook', label: 'E-books' },
    { key: 'roadmap', label: 'Roadmaps' },
  ]
}

function getCategoryLabel(category: string) {
  if (category === 'programme') return 'Programme'
  if (category === 'ebook') return 'E-book'
  if (category === 'roadmap') return 'Roadmap'
  return category
}

function getCategoryImage(category: string) {
  if (category === 'programme') return '/images/biceps.jpeg'
  if (category === 'ebook') return '/images/ebook.jpeg'
  if (category === 'roadmap') return '/images/roadmap.jpeg'
  return '/images/biceps.jpeg'
}

export default function BoutiqueClient({
  products,
  isLoggedIn,
  ownedProductIds,
}: {
  products: Product[]
  isLoggedIn: boolean
  ownedProductIds: string[]
}) {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('all')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const categories = useMemo(() => getBaseCategories(isLoggedIn), [isLoggedIn])

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'all') return products

    if (activeCategory === 'owned') {
      return products.filter((product) => ownedProductIds.includes(product.id))
    }

    return products.filter(product => product.category === activeCategory)
  }, [products, activeCategory, ownedProductIds])

  function isOwned(productId: string) {
    return ownedProductIds.includes(productId)
  }

  return (
    <div>
      <div className="mt-10 md:mt-0 px-4 md:px-6 pt-6 pb-4 border-b border-accent/10">
        <h1 className="font-display text-3xl md:text-4xl tracking-wide text-cream">
          BOUTIQUE
        </h1>
        <p className="text-muted text-sm mt-1">Programmes, e-books & roadmaps</p>

        {isLoggedIn && (
          <p className="text-xs text-dim mt-3">
            Vos produits achetés seront disponibles dans votre espace.
          </p>
        )}

        <div className="flex gap-2 mt-4 flex-wrap">
          {categories.map(cat => {
            const isActive = activeCategory === cat.key

            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={[
                  'glass-pill text-xs px-3 py-1.5 transition-all',
                  isActive
                    ? 'text-cream border border-accent/30 bg-white/10'
                    : 'text-muted hover:text-cream border border-transparent'
                ].join(' ')}
              >
                {cat.key === 'owned' ? '★ ' : ''}
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 p-4 md:p-6">
        {filteredProducts.map((product) => {
          const owned = isOwned(product.id)

          return (
            <button
              key={product.id}
              type="button"
              onClick={() => setSelectedProduct(product)}
              className="glass shadow-glass hover:border-accent/30 hover:bg-white/[0.03] transition-all overflow-hidden text-left"
            >
              <div className="relative w-full aspect-[16/7] overflow-hidden bg-white/3">
                <Image
                  src={getCategoryImage(product.category)}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>

              <div className="p-4 border-t border-accent/10">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <p className="text-xs text-dim uppercase tracking-wider">
                    {getCategoryLabel(product.category)}
                  </p>

                  <div className="flex items-center gap-2 shrink-0">
                    {owned && (
                      <span className="glass-pill text-[11px] px-2.5 py-0.5 text-cream font-medium">
                        ★ Possédé
                      </span>
                    )}

                    {product.badge && (
                      <span className="glass-pill text-[11px] px-2.5 py-0.5 text-accent font-medium">
                        {product.badge}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-medium text-cream mb-1">
                  {product.name}
                </h3>

                <p className="text-xs text-muted leading-relaxed mb-4 line-clamp-3">
                  {product.description}
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-display text-xl text-accent">
                      {formatPrice(product.price_cents)}
                    </span>

                    {product.original_price_cents && (
                      <span className="text-xs text-dim line-through ml-2">
                        {formatPrice(product.original_price_cents)}
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-muted">
                    {owned ? 'Ouvrir' : 'Voir'}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="absolute inset-0 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-5xl w-full mx-auto px-5 sm:px-8 py-6">
              <div className="mb-4">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="glass-pill px-3 py-1 text-xs text-muted hover:text-cream transition"
                >
                  Fermer
                </button>
              </div>

              <div className="relative w-full aspect-[16/7] rounded-3xl overflow-hidden bg-white/5 border border-accent/10">
                <Image
                  src={getCategoryImage(selectedProduct.category)}
                  alt={selectedProduct.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/30" />
              </div>

              <div className="pt-6">
                <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                  <div>
                    <p className="text-xs text-dim uppercase tracking-wider mb-2">
                      {getCategoryLabel(selectedProduct.category)}
                    </p>

                    <h2 className="font-display text-3xl sm:text-4xl text-cream tracking-wide">
                      {selectedProduct.name}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 mt-1">
                    {isOwned(selectedProduct.id) && (
                      <span className="glass-pill text-xs px-3 py-1 text-cream font-medium">
                        ★ Possédé
                      </span>
                    )}

                    {selectedProduct.badge && (
                      <span className="glass-pill text-xs px-3 py-1 text-accent font-medium">
                        {selectedProduct.badge}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm sm:text-base text-muted leading-relaxed mb-6">
                  {selectedProduct.description}
                </p>

                <div className="glass rounded-2xl p-5 border border-accent/10 mb-8">
                  <p className="text-xs uppercase tracking-wider text-dim mb-3">
                    Contenu / Aperçu
                  </p>

                  <p className="text-sm text-muted leading-relaxed">
                    Ici tu mets du lourd : structure du programme, bénéfices, résultats,
                    niveau requis, durée, transformation attendue. C’est CE bloc qui vend.
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 flex-wrap border-t border-accent/10 pt-6">
                  <div>
                    <span className="font-display text-3xl text-accent">
                      {formatPrice(selectedProduct.price_cents)}
                    </span>

                    {selectedProduct.original_price_cents && (
                      <span className="text-sm text-dim line-through ml-2">
                        {formatPrice(selectedProduct.original_price_cents)}
                      </span>
                    )}
                  </div>

                  {isOwned(selectedProduct.id) ? (
                    <span className="glass-pill px-4 py-2 text-sm text-cream">
                      Déjà dans votre espace
                    </span>
                  ) : (
                    <BuyButton productId={selectedProduct.id} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}