// app/(public)/boutique/confirmation/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, XCircle, Download, ArrowRight } from 'lucide-react'
import type { Product } from '@/lib/types'

interface Props {
  searchParams: { session_id?: string; cancelled?: string }
}

export default async function ConfirmationPage({ searchParams }: Props) {
  // Annulation Stripe
  if (searchParams.cancelled) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
        <div className="flex flex-col items-center text-center gap-5 max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <XCircle size={28} className="text-red-400" />
          </div>
          <div>
            <h1 className="font-display text-2xl tracking-wide text-cream mb-2">PAIEMENT ANNULÉ</h1>
            <p className="text-muted text-sm">Votre panier a été conservé. Vous pouvez réessayer quand vous voulez.</p>
          </div>
          <Link
            href="/boutique/panier"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent/15 text-cream border border-accent/25 hover:bg-accent/25 transition text-sm"
          >
            Retour au panier <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    )
  }

  if (!searchParams.session_id) redirect('/boutique')

  // Récupérer les produits achetés via la session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orders } = await supabase
    .from('orders')
    .select('*, product:products(*)')
    .eq('user_id', user.id)
    .eq('status', 'paid')
    .order('paid_at', { ascending: false })
    .limit(10)

  // Chercher les orders liés à cette session
  const { data: sessionOrders } = await supabase
    .from('orders')
    .select('*, product:products(*)')
    .eq('stripe_session_id', searchParams.session_id)

  const purchasedProducts = (sessionOrders ?? [])
    .map(o => o.product)
    .filter(Boolean) as Product[]

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="flex flex-col items-center text-center gap-6 max-w-md w-full">
        {/* Icône succès */}
        <div className="w-16 h-16 rounded-2xl bg-accent/15 border border-accent/25 flex items-center justify-center">
          <CheckCircle2 size={28} className="text-accent" />
        </div>

        <div>
          <h1 className="font-display text-2xl tracking-wide text-cream mb-2">MERCI POUR VOTRE ACHAT</h1>
          <p className="text-muted text-sm">
            Votre paiement a bien été reçu. Un email de confirmation vous a été envoyé.
          </p>
        </div>

        {/* Produits achetés */}
        {purchasedProducts.length > 0 && (
          <div className="glass shadow-glass-sm p-4 w-full text-left flex flex-col gap-3">
            <p className="text-xs text-dim uppercase tracking-wider">Vos achats</p>
            {purchasedProducts.map(product => (
              <div key={product.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-cream">{product.name}</p>
                  <p className="text-xs text-muted">{product.category}</p>
                </div>
                {product.file_url ? (
                  <a
                    href={product.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 glass-pill px-3 py-1.5 text-xs text-cream hover:border-accent/30 transition shrink-0"
                  >
                    <Download size={12} /> Télécharger
                  </a>
                ) : (
                  <Link
                    href="/espace"
                    className="flex items-center gap-1.5 glass-pill px-3 py-1.5 text-xs text-accent border-accent/20 shrink-0"
                  >
                    Voir dans l'espace
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <Link
            href="/espace"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent/15 text-cream border border-accent/25 hover:bg-accent/25 transition text-sm"
          >
            Mon espace <ArrowRight size={14} />
          </Link>
          <Link
            href="/boutique"
            className="text-sm text-muted hover:text-cream transition"
          >
            Continuer les achats
          </Link>
        </div>
      </div>
    </div>
  )
}