'use client'

import { useState } from 'react'
import {
  ClipboardList,
  MessageCircleMore,
  StickyNote,
  Plus,
  Pencil,
} from 'lucide-react'
import ProgramEditor from './ProgramEditor'
import MessagesPanel from '@/components/client/MessagesPanel'
import type { Program, CoachNote, Message } from '@/lib/types'

type Tab = 'programme' | 'messages' | 'notes'

const TABS = [
  { id: 'programme', label: 'Programme', icon: ClipboardList     },
  { id: 'messages',  label: 'Messages',  icon: MessageCircleMore },
  { id: 'notes',     label: 'Notes',     icon: StickyNote        },
] as const

interface Props {
  client: any
  program: Program | null
  note: CoachNote | null
  messages: Message[]
  currentUserId: string
}

export default function ClientDetail({
  client,
  program: initialProgram,
  note,
  messages,
  currentUserId,
}: Props) {
  const [tab, setTab]         = useState<Tab>('programme')
  const [program, setProgram] = useState<Program | null>(initialProgram)
  const [editing, setEditing] = useState(false)

  const clientId   = client.id
  const clientName = client.user?.full_name ?? '—'

  // ── Vue Programme ────────────────────────────────────────
  const ProgrammeTab = () => {
    // Éditeur ouvert
    if (editing) {
      return (
        <ProgramEditor
          clientId={clientId}
          clientName={clientName}
          existingProgram={program}
          onSaved={saved => {
            setProgram(saved)
            setEditing(false)
          }}
          onCancel={() => setEditing(false)}
        />
      )
    }

    // Aucun programme
    if (!program) {
      return (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <ClipboardList size={20} className="text-accent" />
          </div>
          <div>
            <p className="text-cream font-medium text-sm">Aucun programme</p>
            <p className="text-muted text-xs mt-1">
              Crée un programme pour {clientName.split(' ')[0]}.
            </p>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent/15 text-cream border border-accent/25 hover:bg-accent/25 transition text-sm"
          >
            <Plus size={15} />
            Créer un programme
          </button>
        </div>
      )
    }

    // Programme existant — lecture
    return (
      <div className="flex flex-col gap-4">
        {/* En-tête programme */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-display text-2xl tracking-wide text-cream">
              {program.phase_name.toUpperCase()}
            </h2>
            <p className="text-muted text-sm mt-0.5">
              {program.week_count} semaines
              {program.start_date && (
                <> · depuis le {new Date(program.start_date).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long'
                })}</>
              )}
              {' '}·{' '}
              <span className={`
                ${program.status === 'active'    ? 'text-accent'      : ''}
                ${program.status === 'draft'     ? 'text-amber-400'   : ''}
                ${program.status === 'completed' ? 'text-dim'         : ''}
                ${program.status === 'archived'  ? 'text-dim'         : ''}
              `}>
                {program.status === 'active'    ? 'Actif'    : ''}
                {program.status === 'draft'     ? 'Brouillon': ''}
                {program.status === 'completed' ? 'Terminé'  : ''}
                {program.status === 'archived'  ? 'Archivé'  : ''}
              </span>
            </p>
          </div>

          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 glass-pill px-4 py-2 text-sm text-muted hover:text-cream transition"
          >
            <Pencil size={13} />
            Modifier
          </button>
        </div>

        {/* Semaine type */}
        {program.weeks?.[0]?.days && (
          <div className="glass shadow-glass-sm p-4">
            <h3 className="text-xs text-accent uppercase tracking-wider mb-3">
              Semaine type
            </h3>

            <div className="flex flex-col gap-1">
              {program.weeks[0].days.map(day => (
                <div key={day.id}>
                  <div className="flex items-start gap-3 py-2.5 border-b border-accent/10 last:border-0">
                    <span className="text-xs text-muted w-7 shrink-0 uppercase pt-0.5">
                      {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'][day.day_index]}
                    </span>

                    <div className="flex-1 min-w-0">
                      <span className={`text-sm ${
                        day.type === 'training' ? 'text-cream font-medium' : 'text-dim italic'
                      }`}>
                        {day.label || 'Repos'}
                      </span>

                      {day.type === 'training' && day.exercises.length > 0 && (
                        <div className="mt-1.5 flex flex-col gap-1">
                          {day.exercises.map((ex, i) => (
                            <div key={i} className="flex items-center justify-between text-xs text-muted">
                              <span className="truncate">{ex.name}</span>
                              <span className="text-dim shrink-0 ml-3">
                                {ex.sets} × {ex.reps}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ─── Rendu ────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">

      {/* Onglets */}
      {!editing && (
        <div className="flex items-center gap-1 px-4 pt-4 pb-0 border-b border-accent/10">
          {TABS.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm transition-all border-b-2 -mb-px ${
                  tab === item.id
                    ? 'text-cream border-accent'
                    : 'text-muted border-transparent hover:text-cream'
                }`}
              >
                <Icon size={14} strokeWidth={2} />
                {item.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Contenu */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {tab === 'programme' && <ProgrammeTab />}

        {tab === 'messages' && (
          <MessagesPanel
            messages={messages}
            currentUserId={currentUserId}
            coachId={currentUserId}
            coachName="Vous"
          />
        )}

        {tab === 'notes' && (
          <NotesTab note={note} clientId={clientId} />
        )}
      </div>
    </div>
  )
}

// ── Onglet Notes ─────────────────────────────────────────────

function NotesTab({ note, clientId }: { note: CoachNote | null; clientId: string }) {
  const [content, setContent] = useState(note?.content ?? '')
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await fetch(`/api/coach-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, content }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-display text-2xl tracking-wide text-cream">NOTES</h2>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Notes privées sur ce client…"
        rows={10}
        className="w-full bg-transparent border border-accent/15 rounded-xl px-4 py-3 text-sm text-cream placeholder:text-dim focus:outline-none focus:border-accent/40 transition-colors resize-none"
      />
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-accent/15 text-cream border border-accent/25 hover:bg-accent/25 transition text-sm"
        >
          {saved ? '✓ Sauvegardé' : saving ? 'Sauvegarde…' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  )
}