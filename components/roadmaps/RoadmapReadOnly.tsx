"use client";


import dynamic from "next/dynamic";
import "../../node_modules/@excalidraw/excalidraw/dist/prod/index.css";

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((m) => m.Excalidraw),
  { ssr: false, loading: () => <div style={{ background: "#1e1e1e", width: "100%", height: "100%" }} /> }
);

interface Props {
  initialData: object | null;
}

export default function RoadmapReadOnly({ initialData }: Props) {
  return (
    <>
      <style>{`
        .excalidraw { width: 100vw !important; height: 100dvh !important; }
        .excalidraw .layer-ui__wrapper { width: 100vw !important; }
      `}</style>
      <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100dvh", zIndex: 9999 }}>
      <Excalidraw
        initialData={initialData ?? undefined}
        viewModeEnabled={true}
        zenModeEnabled={false}
        theme="light"
        UIOptions={{
          canvasActions: { export: false, loadScene: false, changeViewBackgroundColor: false },
          dockedSidebarBreakpoint: 0,
        }}
      />
      </div>
    </>
  );
}