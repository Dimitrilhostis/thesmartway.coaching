'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Message } from '@/lib/types'

interface Props {
  messages: Message[]
  currentUserId: string
  coachId: string
  coachName: string
}

export default function MessagesPanel({ messages: initial, currentUserId, coachId, coachName }: Props) {
  const [messages, setMessages] = useState<Message[]>(initial)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    const channel = supabase
      .channel('messages-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        const msg = payload.new as Message
        if (msg.sender_id === currentUserId || msg.receiver_id === currentUserId) {
          setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg])
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [currentUserId, supabase])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    if (!content.trim() || sending) return
    setSending(true)
    const res = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content.trim(), receiverId: coachId }),
    })
    const data = await res.json()
    if (data.message) {
      setMessages(prev => prev.find(m => m.id === data.message.id) ? prev : [...prev, data.message])
    }
    setContent('')
    setSending(false)
  }

  return (
    <div>
      <h2 className="font-display text-2xl tracking-wide text-cream mb-1">MESSAGES</h2>
      <p className="text-muted text-sm mb-4">Échange direct avec {coachName}</p>

      {/* Chat — hauteur adaptée mobile/desktop */}
      <div className="glass shadow-glass overflow-hidden flex flex-col" style={{ height: 'clamp(320px, 50vh, 480px)' }}>
        <div className="px-4 py-3 border-b border-accent/10 flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-sage/50 border border-accent/20 flex items-center justify-center text-xs font-medium text-cream shrink-0">
            {coachName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-cream leading-none">{coachName}</p>
            <p className="text-xs text-muted">Répond sur WhatsApp</p>
          </div>
          <div className="ml-auto glass-pill px-2.5 py-1 flex items-center gap-1">
            <span style={{ fontSize: '12px' }}>💬</span>
            <span className="text-xs text-muted hidden sm:inline">WhatsApp</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 md:p-4 flex flex-col gap-2.5 scrollbar-thin">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <span style={{ fontSize: '28px' }}>👋</span>
              <p className="text-sm text-muted text-center">Envoie ton premier message</p>
            </div>
          )}
          {messages.map(msg => {
            const isMe = msg.sender_id === currentUserId
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] md:max-w-xs px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? 'bg-sage/50 border border-accent/20 text-cream rounded-br-sm'
                    : 'bg-white/5 border border-white/8 text-cream rounded-bl-sm'
                }`}>
                  {msg.content}
                  <span className="block text-xs opacity-40 mt-1">
                    {new Date(msg.sent_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input — plus grand sur mobile pour le clavier */}
        <div className="px-3 py-2.5 border-t border-accent/10 flex gap-2 pb-safe">
          <input
            type="text"
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Message..."
            className="glass-input flex-1 px-3.5 py-2.5 text-sm"
            style={{ fontSize: '16px' }} /* évite le zoom auto iOS */
          />
          <button onClick={send} disabled={sending || !content.trim()}
            className="btn-primary px-4 py-2.5 text-sm disabled:opacity-40 shrink-0">
            {sending
              ? <span className="w-3.5 h-3.5 border border-cream/40 border-t-cream rounded-full animate-spin block" />
              : '→'
            }
          </button>
        </div>
      </div>
    </div>
  )
}