'use client'

import { useState } from 'react'
import PlanningPanel from '@/components/client/PlanningPanel'
import MessagesPanel from '@/components/client/MessagesPanel'
import NotificationsPanel from '@/components/client/NotificationsPanel'
import type { Program, Message, Notification } from '@/lib/types'

type Tab = 'planning' | 'programme' | 'messages' | 'rappels'

interface Props {
  client: any
  program: Program | null
  messages: Message[]
  notifications: Notification[]
  currentUserId: string
  coach: { id: string; full_name: string } | null
}

const TABS = [
  { id: 'planning',  label: 'Planning',  icon: '📅' },
  { id: 'programme', label: 'Programme', icon: '🗒' },
  { id: 'messages',  label: 'Messages',  icon: '💬' },
  { id: 'rappels',   label: 'Rappels',   icon: '🔔' },
] as const

export default function EspaceClient({ client, program, messages, notifications, currentUserId, coach }: Props) {
  const [tab, setTab] = useState<Tab>('planning')
  const unreadCount = notifications.filter(n => !n.sent).length

  const initials = client?.user?.full_name
    ?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) ?? 'CL'

  return (
    <div className="flex min-h-[calc(100vh-56px)] min-h-[calc(100dvh-56px)]">

      {/* Sidebar — desktop only */}
      <aside className="hidden md:flex w-52 glass-dark border-r border-accent/10 p-4 flex-col shrink-0">
        <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-accent/10">
          <div className="w-9 h-9 rounded-full bg-sage/50 border border-accent/20 flex items-center justify-center text-xs font-medium text-cream shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-sm font-medium text-cream leading-none">{client?.user?.full_name ?? 'Client'}</p>
            <p className="text-xs text-muted mt-0.5">Client actif</p>
          </div>
        </div>
        <nav className="flex flex-col gap-1">
          {TABS.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left ${
                tab === item.id
                  ? 'bg-accent/15 text-cream border border-accent/20'
                  : 'text-muted hover:text-cream hover:bg-white/5'
              }`}>
              <span style={{ fontSize: '15px' }}>{item.icon}</span>
              {item.label}
              {item.id === 'rappels' && unreadCount > 0 && (
                <span className="ml-auto glass-pill text-xs text-accent px-2 py-0.5">{unreadCount}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-thin pb-20 md:pb-6">

          {tab === 'planning' && <PlanningPanel program={program} />}

          {tab === 'programme' && (
            <div>
              <h2 className="font-display text-2xl tracking-wide text-cream mb-1">MON PROGRAMME</h2>
              <p className="text-muted text-sm mb-4">
                Semaine {program?.week_current ?? '—'}/{program?.week_total ?? '—'}
              </p>
              {program ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="glass shadow-glass-sm p-4">
                    <h3 className="text-xs text-accent uppercase tracking-wider mb-3">Entraînements</h3>
                    {Object.entries(program.weekly_schedule).map(([day, session]) => (
                      <div key={day} className="flex items-center gap-3 py-2.5 border-b border-accent/10 last:border-0">
                        <span className="text-xs text-muted w-7 shrink-0 uppercase">{day.slice(0, 3)}</span>
                        <span className="text-sm text-cream">{session as string}</span>
                      </div>
                    ))}
                  </div>
                  <div className="glass shadow-glass-sm p-4">
                    <h3 className="text-xs text-accent uppercase tracking-wider mb-3">Nutrition</h3>
                    {Object.entries(program.nutrition).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between py-2.5 border-b border-accent/10 last:border-0">
                        <span className="text-xs text-muted capitalize">{key.replace('_', ' ')}</span>
                        <span className="text-sm font-medium text-cream">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="glass shadow-glass-sm p-4 text-sm text-muted">
                  Ton coach n'a pas encore publié de programme.
                </div>
              )}
            </div>
          )}

          {tab === 'messages' && (
            <MessagesPanel
              messages={messages}
              currentUserId={currentUserId}
              coachId={coach?.id ?? ''}
              coachName={coach?.full_name ?? 'Coach'}
            />
          )}

          {tab === 'rappels' && <NotificationsPanel notifications={notifications} />}
        </div>

        {/* Bottom tab bar — mobile only */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 glass-nav border-t border-accent/10 flex pb-safe z-30">
          {TABS.map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 transition-all ${
                tab === item.id ? 'text-accent' : 'text-dim'
              }`}>
              <span className="relative" style={{ fontSize: '18px' }}>
                {item.icon}
                {item.id === 'rappels' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full flex items-center justify-center text-forest"
                    style={{ fontSize: '9px', fontWeight: 600 }}>
                    {unreadCount}
                  </span>
                )}
              </span>
              <span style={{ fontSize: '10px' }}>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}