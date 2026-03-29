'use client'

import { useState } from 'react'
import {
  Bell,
  CalendarDays,
  ClipboardList,
  MessageCircleMore,
  Package,
  Star,
} from 'lucide-react'
import Image from 'next/image'
import PlanningPanel from '@/components/client/PlanningPanel'
import MessagesPanel from '@/components/client/MessagesPanel'
import NotificationsPanel from '@/components/client/NotificationsPanel'
import { formatPrice, type Program, type Message, type Notification, type Product } from '@/lib/types'

type Tab = 'planning' | 'programme' | 'produits' | 'messages' | 'rappels'

interface Props {
  client: any
  program: Program | null
  messages: Message[]
  notifications: Notification[]
  currentUserId: string
  coach: { id: string; full_name: string } | null
  products: Product[]
}

const TABS = [
  { id: 'planning', label: 'Planning', icon: CalendarDays },
  { id: 'programme', label: 'Programme', icon: ClipboardList },
  { id: 'produits', label: 'Produits', icon: Package },
  { id: 'messages', label: 'Messages', icon: MessageCircleMore },
  { id: 'rappels', label: 'Rappels', icon: Bell },
] as const

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

export default function EspaceClient({
  client,
  program,
  messages,
  notifications,
  currentUserId,
  coach,
  products,
}: Props) {
  const [tab, setTab] = useState<Tab>('planning')
  const unreadCount = notifications.filter(n => !n.sent).length

  const initials =
    client?.user?.full_name
      ?.split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ?? 'CL'

  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      {/* Sidebar — desktop only */}
      <aside className="hidden md:flex w-56 glass-dark border-r border-accent/10 p-4 flex-col shrink-0">
        <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-accent/10">
          <div className="w-9 h-9 rounded-full bg-sage/50 border border-accent/20 flex items-center justify-center text-xs font-medium text-cream shrink-0">
            {initials}
          </div>

          <div>
            <p className="text-sm font-medium text-cream leading-none">
              {client?.user?.full_name ?? 'Client'}
            </p>
            <p className="text-xs text-muted mt-0.5">Client actif</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {TABS.map(item => {
            const Icon = item.icon

            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all text-left ${
                  tab === item.id
                    ? 'bg-accent/15 text-cream border border-accent/20'
                    : 'text-muted hover:text-cream hover:bg-white/5'
                }`}
              >
                <Icon size={16} strokeWidth={2} />
                {item.label}

                {item.id === 'rappels' && unreadCount > 0 && (
                  <span className="ml-auto glass-pill text-xs text-accent px-2 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-thin pb-20 md:pb-6">
          {tab === 'planning' && <PlanningPanel program={program} />}

          {tab === 'programme' && (
            <div>
              <h2 className="font-display text-2xl tracking-wide text-cream mb-1">
                MON PROGRAMME
              </h2>

              <p className="text-muted text-sm mb-4">
                Semaine {program?.week_current ?? '—'}/{program?.week_total ?? '—'}
              </p>

              {program ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="glass shadow-glass-sm p-4">
                    <h3 className="text-xs text-accent uppercase tracking-wider mb-3">
                      Entraînements
                    </h3>

                    {Object.entries(program.weekly_schedule).map(([day, session]) => (
                      <div
                        key={day}
                        className="flex items-center gap-3 py-2.5 border-b border-accent/10 last:border-0"
                      >
                        <span className="text-xs text-muted w-7 shrink-0 uppercase">
                          {day.slice(0, 3)}
                        </span>
                        <span className="text-sm text-cream">{session as string}</span>
                      </div>
                    ))}
                  </div>

                  <div className="glass shadow-glass-sm p-4">
                    <h3 className="text-xs text-accent uppercase tracking-wider mb-3">
                      Nutrition
                    </h3>

                    {Object.entries(program.nutrition).map(([key, val]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between py-2.5 border-b border-accent/10 last:border-0"
                      >
                        <span className="text-xs text-muted capitalize">
                          {key.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-medium text-cream">
                          {String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="glass shadow-glass-sm p-4 text-sm text-muted">
                  Ton coach n&apos;a pas encore publié de programme.
                </div>
              )}
            </div>
          )}

          {tab === 'produits' && (
            <div>
              <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
                <div>
                  <h2 className="font-display text-2xl tracking-wide text-cream mb-1">
                    MES PRODUITS
                  </h2>
                  <p className="text-muted text-sm">
                    Vos produits achetés sont disponibles ici.
                  </p>
                </div>
              </div>

              {products.length === 0 ? (
                <div className="glass shadow-glass-sm p-5 text-sm text-muted">
                  Vous n’avez pas encore de produit acheté.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {products.map(product => (
                    <div
                      key={product.id}
                      className="glass shadow-glass-sm overflow-hidden border border-accent/10"
                    >
                      <div className="relative w-full aspect-[16/7] bg-white/3">
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

                          <span className="glass-pill text-[11px] px-2.5 py-0.5 text-cream font-medium flex items-center gap-1.5 shrink-0">
                            <Star size={11} className="text-accent fill-accent" />
                            Possédé
                          </span>
                        </div>

                        <h3 className="text-sm font-medium text-cream mb-1">
                          {product.name}
                        </h3>

                        <p className="text-xs text-muted leading-relaxed mb-4 line-clamp-3">
                          {product.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-accent font-medium">
                            {formatPrice(product.price_cents)}
                          </span>

                          <button
                            type="button"
                            className="glass-pill px-3 py-1 text-xs text-cream hover:border-accent/30 transition"
                          >
                            Ouvrir
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
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
          {TABS.map(item => {
            const Icon = item.icon

            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 transition-all ${
                  tab === item.id ? 'text-accent' : 'text-dim'
                }`}
              >
                <span className="relative">
                  <Icon size={18} strokeWidth={2} />

                  {item.id === 'rappels' && unreadCount > 0 && (
                    <span
                      className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-accent rounded-full flex items-center justify-center text-forest"
                      style={{ fontSize: '9px', fontWeight: 600 }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </span>

                <span style={{ fontSize: '10px' }}>{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}