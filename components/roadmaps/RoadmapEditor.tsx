"use client";

import { Tldraw, Editor, TLEditorSnapshot, getSnapshot } from "tldraw";
import "tldraw/tldraw.css";
import { useCallback, useRef, useState } from "react";
import { Save, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  slug: string;
  initialSnapshot: TLEditorSnapshot | null;
}

export default function RoadmapEditor({ slug, initialSnapshot }: Props) {
  const editorRef = useRef<Editor | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor) return;
    setSaving(true);
    try {
      const snapshot = getSnapshot(editor.store);
      await fetch(`/api/roadmaps/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: snapshot }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, [slug]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
      <Tldraw
        persistenceKey={`roadmap-${slug}`}
        snapshot={initialSnapshot ?? undefined}
        onMount={(editor) => { editorRef.current = editor; }}
      />

      <div style={{ position: "fixed", top: 12, left: 12, zIndex: 500 }}>
        <Link
          href="/admin/roadmaps"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white/90 text-gray-700 hover:bg-white shadow-md transition-all"
        >
          <ArrowLeft size={13} />
          Sortir
        </Link>
      </div>

      <div style={{ position: "fixed", top: 12, right: 12, zIndex: 500 }}>
        <button
          onClick={save}
          disabled={saving}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium shadow-md transition-all ${
            saved ? "bg-green-100 text-green-700" : "bg-white/90 text-gray-700 hover:bg-white"
          }`}
        >
          {saved ? <Check size={13} /> : <Save size={13} />}
          {saved ? "Sauvegardé" : saving ? "…" : "Sauvegarder"}
        </button>
      </div>
    </div>
  );
}