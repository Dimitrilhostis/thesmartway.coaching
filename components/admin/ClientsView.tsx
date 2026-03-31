'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ClientDetail from '@/components/admin/ClientDetail'
import type { Program, CoachNote, Message } from '@/lib/types'

interface Props {
  clients: any[]
  selected: any
  activeId: string | null
  program: Program | null
  note: CoachNote | null
  messages: Message[]
  currentUserId: string
}

export default function ClientsView({
  clients,
  selected,
  activeId,
  program,
  note,
  messages,
  currentUserId,
}: Props) {
  const router = useRouter()
  const [showDetail, setShowDetail] = useState(false)

  function selectClient(id: string) {
    router.push(`/clients?id=${id}`)
    setShowDetail(true)
  }

  const ClientList = () => (
    <aside className="w-full md:w-56 glass-dark md:border-r border-accent/10 p-3 overflow-y-auto">
      <div className="text-xs text-dim uppercase tracking-wider px-2 mb-3">
        {clients.length} client{clients.length !== 1 ? 's' : ''}
      </div>
      <div className="flex flex-col gap-1">
        {clients.map((client: any) => {
          const initials =
            client.user?.full_name
              ?.split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2) ?? 'CL'

          return (
            <button
              key={client.id}
              onClick={() => selectClient(client.id)}
              className={`flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg transition-colors w-full text-left ${
                client.id === activeId
                  ? 'bg-accent/15 text-cream border border-accent/20'
                  : 'text-muted hover:bg-white/5 hover:text-cream'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-sage/40 flex items-center justify-center text-xs shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {client.user?.full_name ?? '—'}
                </p>
                <p className="text-xs text-dim truncate">{client.goal ?? '—'}</p>
              </div>
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${
                  client.status === 'active' ? 'bg-accent' : 'bg-amber-400'
                }`}
              />
            </button>
          )
        })}
      </div>
    </aside>
  )

  const detail = selected ? (
    <ClientDetail
      client={selected}
      program={program}
      note={note}
      messages={messages}
      currentUserId={currentUserId}
    />
  ) : null

  return (
    <div className="flex min-h-[calc(100vh-56px)]">

      {/* Mobile : liste OU détail */}
      <div className="flex-1 flex flex-col md:hidden">
        {!showDetail ? (
          <div className="flex-1 overflow-y-auto p-3">
            <ClientList />
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-4 pt-3 pb-1">
              <button
                onClick={() => setShowDetail(false)}
                className="text-xs text-accent hover:text-cream transition-colors flex items-center gap-1"
              >
                ← Tous les clients
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {detail ?? (
                <p className="text-muted text-sm text-center mt-10">
                  Sélectionne un client
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Desktop : côte à côte */}
      <div className="hidden md:flex flex-1">
        <ClientList />
        <div className="flex-1 overflow-y-auto">
          {detail ?? (
            <div className="flex items-center justify-center h-full text-muted text-sm">
              Aucun client.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}