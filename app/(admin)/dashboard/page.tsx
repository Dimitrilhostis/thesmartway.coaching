import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import InviteGenerator from '@/components/admin/InviteGenerator'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: clientCount },
    { count: unreadCount },
    { data: recentClients },
    { data: recentOrders },
    { data: pendingInvites },
  ] = await Promise.all([
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('messages').select('*', { count: 'exact', head: true }).eq('read', false),
    supabase.from('clients').select('*, user:users!user_id(full_name, email)').eq('status', 'active').order('created_at', { ascending: false }).limit(6),
    supabase.from('orders').select('*, product:products(name, price_cents)').eq('status', 'paid').order('paid_at', { ascending: false }).limit(5),
    supabase.from('invitations').select('email, expires_at').eq('used', false).gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }),
  ])

  const monthRevenue = recentOrders?.reduce((sum, o) => sum + o.amount_cents, 0) ?? 0

  const stats = [
    { label: 'Clients actifs',      value: clientCount ?? 0 },
    { label: 'Messages non lus',    value: unreadCount ?? 0 },
    { label: 'Ventes ce mois',      value: `${(monthRevenue / 100).toFixed(0)}€` },
    { label: 'Invitations actives', value: pendingInvites?.length ?? 0 },
  ]

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="font-display text-2xl md:text-3xl tracking-wide text-cream mb-1">TABLEAU DE BORD</h1>
      <p className="text-muted text-sm mb-5">
        {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </p>

      {/* Stats — 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map(s => (
          <div key={s.label} className="glass shadow-glass-sm p-3 md:p-4">
            <p className="font-display text-2xl md:text-3xl text-accent">{s.value}</p>
            <p className="text-xs text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div>
          <p className="text-xs text-dim uppercase tracking-wider mb-3">Inviter un client</p>
          <InviteGenerator />
        </div>
        {pendingInvites && pendingInvites.length > 0 && (
          <div>
            <p className="text-xs text-dim uppercase tracking-wider mb-3">
              Invitations en attente ({pendingInvites.length})
            </p>
            <div className="glass shadow-glass overflow-hidden">
              {pendingInvites.map((inv: any, i: number) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-accent/8 last:border-0">
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="text-sm text-cream truncate">{inv.email}</p>
                    <p className="text-xs text-muted">Expire le {new Date(inv.expires_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <span className="glass-pill text-xs text-amber-400 px-2.5 py-0.5 shrink-0">En attente</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Clients */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-dim uppercase tracking-wider">Clients actifs</p>
          <Link href="/clients" className="text-xs text-accent hover:underline">Voir tous →</Link>
        </div>
        <div className="glass shadow-glass overflow-x-auto">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="border-b border-accent/10">
                <th className="text-left text-xs text-dim uppercase tracking-wider px-4 py-3">Client</th>
                <th className="text-left text-xs text-dim uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Objectif</th>
                <th className="text-left text-xs text-dim uppercase tracking-wider px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {recentClients?.map((client: any) => (
                <tr key={client.id} className="border-b border-accent/8 last:border-0 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 text-sm text-cream">{client.user?.full_name ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-muted hidden sm:table-cell">{client.goal ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border ${
                      client.status === 'active'
                        ? 'bg-accent/10 text-accent border-accent/25'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                    }`}>
                      {client.status === 'active' ? 'Actif' : 'Pause'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ventes */}
      {recentOrders && recentOrders.length > 0 && (
        <div>
          <p className="text-xs text-dim uppercase tracking-wider mb-3">Dernières ventes</p>
          <div className="flex flex-col gap-2">
            {recentOrders.map((order: any) => (
              <div key={order.id} className="glass-light px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-cream truncate flex-1 mr-3">{order.product?.name}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-display text-lg text-accent">{((order.amount_cents) / 100).toFixed(0)}€</span>
                  <span className="text-xs text-muted hidden sm:inline">
                    {order.paid_at ? new Date(order.paid_at).toLocaleDateString('fr-FR') : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}