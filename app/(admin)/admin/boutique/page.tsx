import { createClient } from '@/lib/supabase/server'
import { formatPrice, type Product } from '@/lib/types'
import AdminProductActions from '@/components/admin/AdminProductActions'

export default async function AdminBoutiquePage() {
  const supabase = await createClient()
  const { data: products } = await supabase.from('products').select('*').order('created_at')

  return (
    <div>
      <div className="px-4 md:px-6 pt-5 pb-4 border-b border-accent/10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl md:text-3xl tracking-wide text-cream">BOUTIQUE</h1>
            <p className="text-muted text-sm mt-0.5">
              {products?.filter(p => p.published).length ?? 0} publiés · {products?.filter(p => !p.published).length ?? 0} brouillons
            </p>
          </div>
          <button className="btn-primary px-3 md:px-4 py-2 text-sm shrink-0">+ Ajouter</button>
        </div>
      </div>

      {/* Mobile : cards. Desktop : table */}
      <div className="p-4 md:hidden">
        <div className="flex flex-col gap-3">
          {products?.map((product: Product) => (
            <div key={product.id} className="glass shadow-glass-sm p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-cream truncate">{product.name}</p>
                  <p className="text-xs text-muted mt-0.5 capitalize">{product.category}</p>
                </div>
                <span className={`text-xs px-2.5 py-0.5 rounded-full border shrink-0 ${
                  product.published ? 'bg-accent/10 text-accent border-accent/25' : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                }`}>
                  {product.published ? 'Publié' : 'Brouillon'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-display text-xl text-accent">{formatPrice(product.price_cents)}</span>
                <AdminProductActions product={product} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden md:block p-6">
        <div className="glass shadow-glass overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-accent/10">
                <th className="text-left text-xs text-dim uppercase tracking-wider px-4 py-3">Produit</th>
                <th className="text-left text-xs text-dim uppercase tracking-wider px-4 py-3">Catégorie</th>
                <th className="text-left text-xs text-dim uppercase tracking-wider px-4 py-3">Prix</th>
                <th className="text-left text-xs text-dim uppercase tracking-wider px-4 py-3">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products?.map((product: Product) => (
                <tr key={product.id} className="border-b border-accent/8 last:border-0 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-cream">{product.name}</p>
                    {product.badge && <span className="text-xs text-accent">{product.badge}</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted capitalize">{product.category}</td>
                  <td className="px-4 py-3">
                    <span className="font-display text-lg text-accent">{formatPrice(product.price_cents)}</span>
                    {product.original_price_cents && (
                      <span className="text-xs text-dim line-through ml-2">{formatPrice(product.original_price_cents)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border ${
                      product.published ? 'bg-accent/10 text-accent border-accent/25' : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                    }`}>
                      {product.published ? 'Publié' : 'Brouillon'}
                    </span>
                  </td>
                  <td className="px-4 py-3"><AdminProductActions product={product} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}