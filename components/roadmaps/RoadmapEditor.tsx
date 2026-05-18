"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Placeholder from "@tiptap/extension-placeholder";
import { useState, useCallback } from "react";
import {
  Bold, Italic, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, ListChecks,
  Table2, Quote, Minus,
  Undo2, Redo2, Save, Check,
} from "lucide-react";

const extensions = [
  StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
  Table.configure({ resizable: false }),
  TableRow,
  TableCell,
  TableHeader,
  TaskList,
  TaskItem.configure({ nested: false }),
  Placeholder.configure({ placeholder: "Commence à écrire ton roadmap…" }),
];

interface Props {
  slug: string;
  initialContent: object | null;
}

type ToolBtn = {
  icon: React.ElementType;
  label: string;
  action: () => void;
  active?: boolean;
};

export default function RoadmapEditor({ slug, initialContent }: Props) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const editor = useEditor({
    extensions,
    content: initialContent ?? "",
    editorProps: {
      attributes: {
        class: "roadmap-editor focus:outline-none min-h-[60vh]",
      },
    },
  });

  const save = useCallback(async () => {
    if (!editor) return;
    setSaving(true);
    try {
      await fetch(`/api/roadmaps/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editor.getJSON() }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }, [editor, slug]);

  if (!editor) return null;

  const groups: ToolBtn[][] = [
    [
      { icon: Bold,          label: "Gras",         action: () => editor.chain().focus().toggleBold().run(),          active: editor.isActive("bold") },
      { icon: Italic,        label: "Italique",     action: () => editor.chain().focus().toggleItalic().run(),        active: editor.isActive("italic") },
      { icon: Strikethrough, label: "Barré",        action: () => editor.chain().focus().toggleStrike().run(),        active: editor.isActive("strike") },
    ],
    [
      { icon: Heading1, label: "Titre 1", action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive("heading", { level: 1 }) },
      { icon: Heading2, label: "Titre 2", action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }) },
      { icon: Heading3, label: "Titre 3", action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive("heading", { level: 3 }) },
    ],
    [
      { icon: List,        label: "Liste",            action: () => editor.chain().focus().toggleBulletList().run(),  active: editor.isActive("bulletList") },
      { icon: ListOrdered, label: "Liste numérotée", action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList") },
      { icon: ListChecks,  label: "Cases à cocher",  action: () => editor.chain().focus().toggleTaskList().run(),    active: editor.isActive("taskList") },
    ],
    [
      {
        icon: Table2,
        label: "Tableau",
        action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
      },
      { icon: Quote, label: "Citation",     action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote") },
      { icon: Minus, label: "Séparateur",   action: () => editor.chain().focus().setHorizontalRule().run() },
    ],
    [
      { icon: Undo2, label: "Annuler", action: () => editor.chain().focus().undo().run() },
      { icon: Redo2, label: "Refaire", action: () => editor.chain().focus().redo().run() },
    ],
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center gap-1 flex-wrap glass-dark border border-accent/15 rounded-xl p-1.5">
        {groups.map((group, gi) => (
          <div key={gi} className="flex items-center gap-0.5">
            {gi > 0 && <div className="w-px h-5 bg-accent/15 mx-1" />}
            {group.map((btn) => {
              const Icon = btn.icon;
              return (
                <button
                  key={btn.label}
                  onClick={btn.action}
                  title={btn.label}
                  className={`p-1.5 rounded-lg transition-all duration-100 ${
                    btn.active
                      ? "bg-accent/20 text-accent border border-accent/30"
                      : "text-dim hover:text-cream hover:bg-white/8"
                  }`}
                >
                  <Icon size={15} strokeWidth={2} />
                </button>
              );
            })}
          </div>
        ))}

        {/* Save */}
        <div className="ml-auto">
          <button
            onClick={save}
            disabled={saving}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              saved
                ? "bg-accent/20 text-accent border border-accent/30"
                : "btn-primary"
            }`}
          >
            {saved ? <Check size={13} /> : <Save size={13} />}
            {saved ? "Sauvegardé" : saving ? "…" : "Sauvegarder"}
          </button>
        </div>
      </div>

      {/* Editor content */}
      <div className="glass rounded-2xl p-6 md:p-8">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
