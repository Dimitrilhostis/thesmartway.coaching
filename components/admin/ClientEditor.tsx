'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DAYS, type Client, type Program } from '@/lib/types'

type Tab = 'notes' | 'programme' | 'message'

const DAY_KEYS = Object.keys(DAYS) as Array<keyof typeof DAYS>

export default function ClientEditor({ clients }: { clients: Client[] }) {
  const supabase = createClient()
  const [selected, setSelected] = useState<Client | null>(clients[0] ?? null)
  const [tab, setTab] = useState<Tab>('notes')
  const [note, setNote] = useState('')
  const [program, setProgram] = useState<Program['weekly_schedule']>({})
  const [nutrition, setNutrition] = useState<Program['nutrition']>({})
  const [msgContent, setMsgContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function selectClient(client: Client) {
    setSelected(client)
    setTab('notes')

    // Charger les notes
    const { data: noteData } = await supabase
      .from('coach_notes')
      .select('content')
      .eq('client_id', client.id)
      .single()
    setNote(noteData?.content ?? '')

    // Charger le programme
    const { data: prog } = await supabase
      .from('programs')
      .select('*')
      .eq('client_id', client.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    setProgram(prog?.weekly_schedule ?? {})
    setNutrition(prog?.nutrition ?? {})
  }

  async function saveNote() {
    if (!selected) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('coach_notes').upsert(
      { coach_id: user!.id, client_id: selected.id, content: note, updated_at: new Date().toISOString() },
      { onConflict: 'coach_id,client_id' }
    )
    setSaving(false)
    showToast('Notes sauvegardées ✓')
  }

  async function publishProgram() {
    if (!selected) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()

    // Upsert program
    await supabase.from('programs').upsert({
      client_id: selected.id,
      coach_id: user!.id,
      weekly_schedule: program,
      nutrition,
      published: true,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'client_id' })

    setSaving(false)
    showToast('Programme publié ✓ — visible par le client')
  }

  async function sendMessage() {
    if (!selected || !msgContent.trim()) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('messages').insert({
      sender_id: user!.id,
      receiver_id: selected.user_id,
      content: msgContent.trim(),
    })
    setMsgContent('')
    setSaving(false)
    showToast('Message envoyé ✓')
  }

  const initials = (c: Client) =>
    (c.user as any)?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0,2)
    ?? (c.user as any)?.email?.slice(0,2).toUpperCase()
    ?? 'CL'

  return (
    <div className="flex w-full relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-card border border-border rounded-xl px-5 py-3 text-sm text-cream">
          {toast}
        </div>
      )}

      {/* Sidebar clients */}
      <aside className="w-52 bg-card-dark border-r border-border p-4 shrink-0">
        <div className="text-xs text-dim uppercase tracking-wider mb-3">
          Clients · {clients.length}
        </div>
        <div className="flex flex-col gap-1">
          {clients.map(client => (
            <button
              key={client.id}
              onClick={() => selectClient(client)}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors w-full ${
                selected?.id === client.id ? 'bg-forest-light' : 'hover:bg-forest-light'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-sage flex items-center justify-center text-xs font-medium text-cream shrink-0">
                {initials(client)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-cream truncate">
                  {(client.user as any)?.full_name ?? (client.user as any)?.email ?? '—'}
                </p>
                <p className="text-xs text-muted truncate">{client.goal ?? 'Sans objectif'}</p>
              </div>
              <div className={`w-1.5 h-1.5 rounded-full ml-auto shrink-0 ${
                client.status === 'active' ? 'bg-accent' : 'bg-amber-500'
              }`} />
            </button>
          ))}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 p-6">
        {!selected ? (
          <p className="text-muted text-sm">Sélectionne un client.</p>
        ) : (
          <>
            {/* Header client */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-sage flex items-center justify-center text-sm font-medium text-cream shrink-0">
                {initials(selected)}
              </div>
              <div>
                <h1 className="font-display text-2xl tracking-wide text-cream leading-none">
                  {(selected.user as any)?.full_name ?? (selected.user as any)?.email}
                </h1>
                <p className="text-muted text-xs mt-0.5">
                  {selected.goal ?? 'Objectif non défini'} · {selected.status}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-5">
              {([
                ['notes',     'Notes privées'],
                ['programme', 'Programme'],
                ['message',   'Envoyer message'],
              ] as [Tab, string][]).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`text-xs px-4 py-2 rounded-lg border transition-colors ${
                    tab === id
                      ? 'bg-forest-light border-border-light text-cream'
                      : 'bg-card border-border text-muted hover:text-cream'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Tab: Notes */}
            {tab === 'notes' && (
              <div>
                <p className="text-xs text-muted mb-2">Visibles uniquement par toi — jamais par le client</p>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Tes observations, points à surveiller, contexte..."
                  rows={8}
                  className="input resize-y mb-3"
                />
                <button onClick={saveNote} disabled={saving} className="btn-primary">
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            )}

            {/* Tab: Programme */}
            {tab === 'programme' && (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {/* Planning hebdo */}
                  <div className="card p-4">
                    <h3 className="text-xs text-accent uppercase tracking-wider mb-3">Entraînements</h3>
                    {DAY_KEYS.map(day => (
                      <div key={day} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                        <span className="text-xs text-muted w-8 shrink-0 uppercase">{DAYS[day].slice(0,3)}</span>
                        <input
                          type="text"
                          value={program[day as keyof typeof program] ?? ''}                          onChange={e => setProgram(prev => ({ ...prev, [day]: e.target.value }))}
                          placeholder="Repos"
                          className="flex-1 bg-transparent text-sm text-cream placeholder:text-dim outline-none border-b border-transparent focus:border-sage transition-colors py-0.5"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Nutrition */}
                  <div className="card p-4">
                    <h3 className="text-xs text-accent uppercase tracking-wider mb-3">Nutrition</h3>
                    {([
                      ['calories',  'Calories (kcal)'],
                      ['protein_g', 'Protéines (g/j)'],
                      ['carbs_g',   'Glucides (g/j)'],
                      ['fat_g',     'Lipides (g/j)'],
                      ['water_l',   'Eau (litres/j)'],
                    ] as const).map(([key, label]) => (
                      <div key={key} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                        <span className="text-xs text-muted w-28 shrink-0">{label}</span>
                        <input
                          type="number"
                          value={(nutrition as any)[key] ?? ''}
                          onChange={e => setNutrition(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                          placeholder="—"
                          className="flex-1 bg-transparent text-sm text-cream placeholder:text-dim outline-none border-b border-transparent focus:border-sage transition-colors py-0.5 text-right"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={publishProgram} disabled={saving} className="btn-primary">
                  {saving ? 'Publication...' : 'Publier le programme'}
                </button>
                <p className="text-xs text-muted mt-2">Le client verra le programme immédiatement après publication.</p>
              </div>
            )}

            {/* Tab: Message */}
            {tab === 'message' && (
              <div>
                <p className="text-xs text-muted mb-2">
                  Message visible dans l'espace client · synchronisé WhatsApp si configuré
                </p>
                <textarea
                  value={msgContent}
                  onChange={e => setMsgContent(e.target.value)}
                  placeholder={`Écris ton message pour ${(selected.user as any)?.full_name ?? 'ce client'}...`}
                  rows={5}
                  className="input resize-y mb-3"
                />
                <div className="flex gap-3">
                  <button onClick={sendMessage} disabled={saving || !msgContent.trim()} className="btn-primary">
                    {saving ? 'Envoi...' : 'Envoyer maintenant'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
