"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useRef } from "react";
import { Save, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";
import "../../node_modules/@excalidraw/excalidraw/dist/prod/index.css";

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((m) => m.Excalidraw),
  { ssr: false }
);

interface Props {
  slug: string;
  initialData: object | null;
}

export default function RoadmapEditor({ slug, initialData }: Props) {
  const excalidrawAPI = useRef<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = useCallback(async () => {
    if (!excalidrawAPI.current) return;
    setSaving(true);
    try {
      const elements = excalidrawAPI.current.getSceneElements();
      const appState = excalidrawAPI.current.getAppState();
      const files = excalidrawAPI.current.getFiles();
      await fetch(`/api/roadmaps/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: { elements, appState, files } }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, [slug]);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "fixed", inset: 0, zIndex: 9999 }}>
      <Excalidraw
        initialData={initialData ?? undefined}
        excalidrawAPI={(api) => { excalidrawAPI.current = api; }}
        theme="light"
      />

      {/* Bouton sortir */}
      <div style={{ position: "fixed", bottom: 12, left: 12, zIndex: 1000 }}>
        <Link
          href="/admin/roadmaps"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white/90 text-gray-700 hover:bg-white shadow-md transition-all"
        >
          <ArrowLeft size={13} />
          Sortir
        </Link>
      </div>

      {/* Bouton sauvegarder */}
      <div style={{ position: "fixed", bottom: 12, right: 60, zIndex: 1000 }}>
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