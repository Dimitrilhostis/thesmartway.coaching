"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";

const extensions = [
  StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
  Table.configure({ resizable: false }),
  TableRow,
  TableCell,
  TableHeader,
  TaskList,
  TaskItem.configure({ nested: false }),
];

export default function RoadmapReadOnly({ content }: { content: object }) {
  const editor = useEditor({
    extensions,
    content,
    editable: false,
    editorProps: {
      attributes: { class: "roadmap-editor" },
    },
  });

  if (!editor) return null;
  return <EditorContent editor={editor} />;
}
