'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Message } from '@/lib/types'

const COACH_WA = '33768704364'

interface Props {
  client: any
  messages: Message[]
  currentUserId: string
}

export default function AdminMessagesPanel({ client, messages: initial, currentUserId }: Props) {
  const [messages, setMessages] = useState<Message[]>(initial)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const supabase = createClient()

  const clientPhone = client.whatsapp_id ?? client.phone ?? null

  async function sendFromAdmin() {
    if (!content.trim() || sending) return
    setSending(true)
  
    const msgContent = content.trim()
  
    // Ouvrir WhatsApp IMMÉDIATEMENT avant tout await
    // if (clientPhone) {
    //   const waText = `[The Smart Way] ${msgContent}`
    //   const waUrl = `https://wa.me/${clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(waText)}`
    // //   window.open(waUrl, '_blank', 'noopener,noreferrer')
    // }
  
    // Ensuite sauvegarder dans Supabase
    const { data: msg } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUserId,
        receiver_id: client.user_id,
        content: msgContent,
      })
      .select()
      .single()
  
    if (msg) {
      setMessages(prev => [...prev, msg])
    }
  
    setContent('')
    setSending(false)
  }

  return (
    <div>
      <div className="glass shadow-glass overflow-hidden mb-4">
        <div className="px-4 py-2.5 border-b border-accent/10 flex items-center justify-between">
          <span className="text-xs text-dim uppercase tracking-wider">
            Historique ({messages.length})
          </span>
          {clientPhone && (
            <a
              href={`https://wa.me/${clientPhone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent hover:underline flex items-center gap-1"
            >
              <span style={{ fontSize: '12px' }}>💬</span>
              Ouvrir WA directement
            </a>
          )}
          {!clientPhone && (
            <span className="text-xs text-dim">Pas de numéro WA enregistré</span>
          )}
        </div>
        <div className="max-h-52 overflow-y-auto p-3 flex flex-col gap-2 scrollbar-thin">
          {messages.length === 0 && (
            <p className="text-xs text-muted text-center py-6">Aucun échange pour le moment.</p>
          )}
          {[...messages].map(msg => (
            <div key={msg.id} className={`flex ${msg.receiver_id === client.user_id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs text-xs px-3 py-2 rounded-xl backdrop-blur-sm ${
                msg.receiver_id === client.user_id
                  ? 'bg-sage/40 border border-accent/20 text-cream'
                  : 'bg-white/5 border border-white/8 text-muted'
              }`}>
                {msg.content}
                <span className="block opacity-40 mt-0.5">
                  {new Date(msg.sent_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted mb-2">
        Message visible dans l'espace client
        {clientPhone ? ' + ouvre WhatsApp avec le message pré-rempli' : ' (ajoute le numéro WA du client pour notifier)'}
      </p>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        rows={3}
        placeholder={`Message pour ${client.user?.full_name ?? 'ce client'}...`}
        className="glass-input w-full px-4 py-3 text-sm resize-none"
      />
      <div className="flex gap-3 mt-3 items-center">
        <button
          onClick={sendFromAdmin}
          disabled={sending || !content.trim()}
          className="btn-primary px-5 py-2 text-sm flex items-center gap-2 disabled:opacity-40"
        >
          {sending ? '...' : <>Envoyer <span style={{ fontSize: '13px' }}>💬</span></>}
        </button>
        <button className="btn-ghost px-4 py-2 text-sm">Programmer</button>
        {!clientPhone && (
          <span className="text-xs text-amber-400 ml-auto">
            ⚠ Numéro client manquant
          </span>
        )}
      </div>
    </div>
  )
}