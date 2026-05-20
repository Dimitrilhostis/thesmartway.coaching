import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/client/LogoutButton'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

export default async function ComptePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single()
  const { data: client } = await supabase.from('clients').select('*').eq('user_id', user.id).single()
  const { data: orders } = await supabase
    .from('orders').select('*, product:products(name, category, price_cents)')
    .eq('user_id', user.id).eq('status', 'paid').order('paid_at', { ascending: false })

  const initials = (profile?.name && profile?.last_name)
    ?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) ?? 'CL'

  return (
    <div className="max-w-xl mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-8">

      {/* Header */}
      <div className="card rounded-2xl border border-border p-5 flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-white/8 border border-border flex items-center justify-center font-display text-xl text-cream shrink-0">
          {initials}
        </div>
        <div>
          <h1 className="text-base font-semibold text-cream">{profile?.name ?? '—'}</h1>
          <p className="text-xs text-muted">{profile?.email}</p>
          <span className="inline-flex items-center mt-1.5 glass-pill text-xs text-accent px-2.5 py-0.5">
            Suivi perso actif
          </span>
        </div>
      </div>

      {/* Contact coach */}
      <Link href="/contact" className="flex items-center justify-center gap-2 w-full btn-ghost py-3 rounded-2xl text-sm mb-4">
        <MessageCircle size={15} />
        Contacter le coach
      </Link>

      {/* Infos */}
      <section className="mb-4">
        <p className="section-label mb-2 pl-1">Informations</p>
        <div className="card rounded-2xl border border-border divide-y divide-border">
          {[
            { label: 'Nom complet', value: (profile?.name && profile?.last_name) ?? '—' },
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
        <section className="mb-4">
          <p className="section-label mb-2 pl-1">Mes achats</p>
          <div className="flex flex-col gap-2">
            {orders.map((order: any) => (
              <div key={order.id} className="card rounded-2xl border border-border px-4 py-3 flex items-center justify-between">
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
        <p className="section-label mb-2 pl-1">Sécurité</p>
        <div className="card rounded-2xl border border-border divide-y divide-border">
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
