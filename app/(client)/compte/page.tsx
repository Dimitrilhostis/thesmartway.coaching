import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/client/LogoutButton'
import Link from 'next/link'

export default async function ComptePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
  const { data: client } = await supabase.from('clients').select('*').eq('user_id', user.id).single()
  const { data: orders } = await supabase
    .from('orders').select('*, product:products(name, category, price_cents)')
    .eq('user_id', user.id).eq('status', 'paid').order('paid_at', { ascending: false })

  const initials = profile?.full_name
    ?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) ?? 'CL'

  return (
    <div className="max-w-xl mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="glass shadow-glass p-4 md:p-5 flex items-center gap-4 mb-5">
        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-sage/50 border border-accent/25 flex items-center justify-center font-display text-xl md:text-2xl text-cream shrink-0">
          {initials}
        </div>
        <div>
          <h1 className="text-base md:text-lg font-medium text-cream">{profile?.full_name ?? '—'}</h1>
          <p className="text-xs md:text-sm text-muted">{profile?.email}</p>
          <span className="inline-block mt-1 glass-pill text-xs text-accent px-2.5 py-0.5">
            Suivi perso actif
          </span>
        </div>
      </div>

      {/* Contact */}
      <Link href={'/contact'}>
        <div className="w-full glass border border-accent text-accent hover:bg-accent/10 py-3 rounded-2xl text-sm transition-all mb-5 text-center">
          Contacter le coach
        </div>
      </Link>

      {/* Infos */}
      <section className="mb-5">
        <p className="text-xs text-dim uppercase tracking-wider mb-2 pl-1">Informations</p>
        <div className="glass shadow-glass-sm divide-y divide-accent/10">
          {[
            { label: 'Nom complet', value: profile?.full_name ?? '—' },
            { label: 'Email',       value: profile?.email },
            { label: 'Téléphone',   value: client?.phone ?? '—' },
            { label: 'Objectif',    value: client?.goal ?? '—' },
            { label: 'Poids',       value: client?.weight_kg ? `${client.weight_kg} kg` : '—' },
            { label: 'Taille',      value: client?.height_cm ? `${client.height_cm} cm` : '—' },
          ].map(row => (
            <div key={row.label} className="flex justify-between items-center px-4 py-3">
              <span className="text-sm text-muted">{row.label}</span>
              <span className="text-sm text-cream font-medium text-right max-w-[55%] truncate">{row.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Achats */}
      {orders && orders.length > 0 && (
        <section className="mb-5">
          <p className="text-xs text-dim uppercase tracking-wider mb-2 pl-1">Mes achats</p>
          <div className="flex flex-col gap-2">
            {orders.map((order: any) => (
              <div key={order.id} className="glass-light px-4 py-3 flex items-center justify-between">
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-sm text-cream font-medium truncate">{order.product?.name}</p>
                  <p className="text-xs text-muted capitalize mt-0.5">{order.product?.category}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-lg text-accent">{((order.product?.price_cents ?? 0) / 100).toFixed(0)}€</p>
                  <p className="text-xs text-dim">{order.paid_at ? new Date(order.paid_at).toLocaleDateString('fr-FR') : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sécurité */}
      <section className="mb-6">
        <p className="text-xs text-dim uppercase tracking-wider mb-2 pl-1">Sécurité</p>
        <div className="glass shadow-glass-sm divide-y divide-accent/10">
          <div className="flex justify-between items-center px-4 py-3">
            <span className="text-sm text-muted">Mot de passe</span>
            <button className="text-sm text-accent hover:underline">Modifier →</button>
          </div>
          <div className="flex justify-between items-center px-4 py-3">
            <span className="text-sm text-muted">Double authentification</span>
            <span className="text-sm text-accent">Activée</span>
          </div>
        </div>
      </section>

      <LogoutButton />
    </div>
  )
}