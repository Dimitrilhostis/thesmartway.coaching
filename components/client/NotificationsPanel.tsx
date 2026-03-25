import type { Notification } from '@/lib/types'

const ICONS: Record<string, string> = {
  workout: '🏋', message: '💬', program: '📋', promo: '🎁', custom: '📌',
}

export default function NotificationsPanel({ notifications }: { notifications: Notification[] }) {
  const unread = notifications.filter(n => !n.sent)

  return (
    <div>
      <h2 className="font-display text-2xl tracking-wide text-cream mb-1">RAPPELS</h2>
      <p className="text-muted text-sm mb-4">
        {unread.length > 0 ? `${unread.length} rappel${unread.length > 1 ? 's' : ''} à venir` : 'Aucun rappel en attente'}
      </p>

      <div className="flex flex-col gap-2">
        {notifications.length === 0 && (
          <div className="glass shadow-glass-sm p-4 text-sm text-muted">
            Aucune notification pour le moment.
          </div>
        )}
        {notifications.map(notif => (
          <div key={notif.id} className={`glass-light p-3.5 flex items-start gap-3 ${!notif.sent ? 'border-accent/25' : ''}`}>
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-accent/15 flex items-center justify-center shrink-0" style={{ fontSize: '14px' }}>
              {ICONS[notif.type] ?? '📌'}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${!notif.sent ? 'font-medium text-cream' : 'text-muted'}`}>
                {notif.title}
              </p>
              {notif.body && <p className="text-xs text-muted mt-0.5">{notif.body}</p>}
              <p className="text-xs text-dim mt-1">
                {new Date(notif.scheduled_at).toLocaleDateString('fr-FR', {
                  weekday: 'short', day: 'numeric', month: 'short',
                  hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>
            {!notif.sent && <div className="w-2 h-2 rounded-full bg-accent mt-1 shrink-0" />}
          </div>
        ))}
      </div>
    </div>
  )
}