"use client";

import { Tldraw, TLEditorSnapshot } from "tldraw";
import "tldraw/tldraw.css";

export default function RoadmapReadOnly({ snapshot }: { snapshot: TLEditorSnapshot | null }) {
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw
        snapshot={snapshot ?? undefined}
        onMount={(editor) => {
          editor.updateInstanceState({ isReadonly: true });
          editor.setCurrentTool("hand");
        }}
      />
    </div>
  );
}