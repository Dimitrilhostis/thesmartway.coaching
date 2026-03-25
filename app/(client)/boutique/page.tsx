import { createClient } from '@/lib/supabase/server'
import BuyButton from '@/components/client/BuyButton'
import { formatPrice, type Product } from '@/lib/types'

export default async function BoutiquePage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products').select('*').eq('published', true).order('created_at')

  const categories = [
    { key: 'all', label: 'Tout' },
    { key: 'programme', label: 'Programmes' },
    { key: 'ebook', label: 'E-books' },
    { key: 'roadmap', label: 'Roadmaps' },
  ]

  return (
    <div>
      <div className="mt-10 md:mt-0 px-4 md:px-6 pt-6 pb-4 border-b border-accent/10">
        <h1 className="font-display text-3xl md:text-4xl tracking-wide text-cream">BOUTIQUE</h1>
        <p className="text-muted text-sm mt-1">Programmes, e-books & roadmaps</p>
        <div className="flex gap-2 mt-4 flex-wrap">
          {categories.map(cat => (
            <span key={cat.key} className="glass-pill text-xs text-muted px-3 py-1.5 cursor-pointer hover:text-cream transition-colors">
              {cat.label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 p-4 md:p-6">
        {products?.map((product: Product) => (
          <div key={product.id} className="glass shadow-glass hover:border-accent/30 transition-all overflow-hidden">
            <div className="h-28 flex items-center justify-center relative bg-white/3">
              <span style={{ fontSize: '36px' }}>
                {product.category === 'programme' ? '💪' : product.category === 'ebook' ? '📖' : '🗺️'}
              </span>
              {product.badge && (
                <span className="absolute top-2 right-2 glass-pill text-xs px-2.5 py-0.5 text-accent font-medium">
                  {product.badge}
                </span>
              )}
            </div>
            <div className="p-4 border-t border-accent/10">
              <p className="text-xs text-dim uppercase tracking-wider mb-1">{product.category}</p>
              <h3 className="text-sm font-medium text-cream mb-1">{product.name}</h3>
              <p className="text-xs text-muted leading-relaxed mb-4">{product.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-display text-xl text-accent">{formatPrice(product.price_cents)}</span>
                  {product.original_price_cents && (
                    <span className="text-xs text-dim line-through ml-2">{formatPrice(product.original_price_cents)}</span>
                  )}
                </div>
                <BuyButton productId={product.id} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}