'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DAYS, type Program, type CoachNote, type Message } from '@/lib/types'
import AdminMessagesPanel from '@/components/admin/AdminMessagesPanel'

interface Props {
  client: any
  program: Program | null
  note: CoachNote | null
  messages: Message[]
  currentUserId: string
}

export default function ClientDetail({ client, program: initialProgram, note: initialNote, messages, currentUserId }: Props) {
  const supabase = createClient()
  const [tab, setTab] = useState<'notes' | 'programme' | 'message'>('notes')
  const [noteContent, setNoteContent] = useState(initialNote?.content ?? '')
  const [program, setProgram] = useState(initialProgram)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const initials = client.user?.full_name
    ?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) ?? 'CL'

  async function saveNote() {
    setSaving(true)
    if (initialNote?.id) {
      await supabase.from('coach_notes')
        .update({ content: noteContent, updated_at: new Date().toISOString() })
        .eq('id', initialNote.id)
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('coach_notes').insert({
        coach_id: user!.id,
        client_id: client.id,
        content: noteContent,
      })
    }
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function publishProgram() {
    if (!program) return
    setSaving(true)
    await supabase.from('programs')
      .update({ published: true, published_at: new Date().toISOString() })
      .eq('id', program.id)
    setProgram({ ...program, published: true })
    setSaving(false)
  }

  async function updateSchedule(day: string, value: string) {
    if (!program) return
    const updated = { ...program.weekly_schedule, [day]: value }
    setProgram({ ...program, weekly_schedule: updated })
    await supabase.from('programs').update({ weekly_schedule: updated }).eq('id', program.id)
  }

  const tabs = [
    { id: 'notes',      label: 'Notes privées' },
    { id: 'programme',  label: 'Programme' },
    { id: 'message',    label: 'Message' },
  ] as const

  return (
    <div className="p-6">
      {/* Header client */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-sage/50 border border-accent/20 flex items-center justify-center font-display text-lg text-cream shrink-0">
          {initials}
        </div>
        <div>
          <h2 className="font-display text-2xl tracking-wide text-cream">
            {client.user?.full_name ?? '—'}
          </h2>
          <p className="text-muted text-sm">
            {client.goal ?? '—'} · Semaine {program?.week_current ?? '?'}/{program?.week_total ?? '?'}
            {client.whatsapp_id && (
              <span className="ml-2 text-xs text-accent">💬 {client.whatsapp_id}</span>
            )}
          </p>
        </div>
        <span className={`ml-auto glass-pill text-xs px-3 py-1 ${
          client.status === 'active' ? 'text-accent' : 'text-amber-400'
        }`}>
          {client.status === 'active' ? 'Actif' : 'En pause'}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-1.5 rounded-xl text-sm transition-all ${
              tab === t.id
                ? 'bg-accent/15 text-cream border border-accent/25 backdrop-blur-sm'
                : 'btn-ghost'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Notes */}
      {tab === 'notes' && (
        <div>
          <p className="text-xs text-muted mb-2">Visibles uniquement par toi</p>
          <textarea
            value={noteContent}
            onChange={e => setNoteContent(e.target.value)}
            rows={6}
            placeholder="Tes observations sur ce client..."
            className="glass-input w-full px-4 py-3 text-sm resize-none leading-relaxed"
          />
          <button
            onClick={saveNote}
            disabled={saving}
            className="btn-primary mt-3 px-5 py-2 text-sm"
          >
            {saving ? 'Sauvegarde...' : saved ? '✓ Sauvegardé' : 'Sauvegarder'}
          </button>
        </div>
      )}

      {/* Programme */}
      {tab === 'programme' && (
        <div>
          {program ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="glass shadow-glass-sm p-4">
                <h3 className="text-xs text-accent uppercase tracking-wider mb-3">Entraînements</h3>
                {Object.entries(DAYS).map(([key, label]) => (
                  <div key={key} className="flex items-center gap-3 py-2 border-b border-accent/10 last:border-0">
                    <span className="text-xs text-muted w-8 shrink-0">{label.slice(0, 3)}</span>
                    <input
                      defaultValue={program.weekly_schedule?.[key as keyof typeof program.weekly_schedule] ?? ''}
                      onBlur={e => updateSchedule(key, e.target.value)}
                      className="flex-1 bg-transparent text-sm text-cream outline-none border-b border-transparent focus:border-accent/40"
                      placeholder="Repos"
                    />
                  </div>
                ))}
              </div>
              <div className="glass shadow-glass-sm p-4">
                <h3 className="text-xs text-accent uppercase tracking-wider mb-3">Nutrition</h3>
                {[
                  { key: 'calories',  label: 'Calories',  unit: 'kcal' },
                  { key: 'protein_g', label: 'Protéines', unit: 'g/j' },
                  { key: 'carbs_g',   label: 'Glucides',  unit: 'g/j' },
                  { key: 'fat_g',     label: 'Lipides',   unit: 'g/j' },
                  { key: 'water_l',   label: 'Eau',       unit: 'L' },
                ].map(({ key, label, unit }) => (
                  <div key={key} className="flex items-center gap-3 py-2 border-b border-accent/10 last:border-0">
                    <span className="text-xs text-muted w-20 shrink-0">{label}</span>
                    <input
                      type="number"
                      defaultValue={program.nutrition?.[key as keyof typeof program.nutrition] ?? ''}
                      onBlur={async e => {
                        const updated = { ...program.nutrition, [key]: Number(e.target.value) }
                        setProgram({ ...program, nutrition: updated })
                        await supabase.from('programs').update({ nutrition: updated }).eq('id', program.id)
                      }}
                      className="flex-1 bg-transparent text-sm text-cream outline-none border-b border-transparent focus:border-accent/40"
                    />
                    <span className="text-xs text-dim">{unit}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass shadow-glass-sm p-4 text-sm text-muted">
              Aucun programme pour ce client.
            </div>
          )}
          {program && (
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={publishProgram}
                disabled={saving || program.published}
                className="btn-primary px-5 py-2 text-sm"
              >
                {program.published ? '✓ Publié (visible client)' : 'Publier le programme'}
              </button>
              {!program.published && (
                <p className="text-xs text-muted">Non visible par le client tant que non publié.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Message */}
      {tab === 'message' && (
        <AdminMessagesPanel
          client={client}
          messages={messages}
          currentUserId={currentUserId}
        />
      )}
    </div>
  )
}