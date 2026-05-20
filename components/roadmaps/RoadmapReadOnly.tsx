"use client";

import dynamic from "next/dynamic";

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((m) => m.Excalidraw),
  { ssr: false }
);

interface Props {
  initialData: object | null;
}

export default function RoadmapReadOnly({ initialData }: Props) {
  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Excalidraw
        initialData={initialData ?? undefined}
        viewModeEnabled={true}
        UIOptions={{
          canvasActions: { export: false, loadScene: false, changeViewBackgroundColor: false },
        }}
      />
    </div>
  );
}