"use client";

import { useState } from "react";

export type RoadmapStatus = "done" | "in-progress" | "todo";

export interface RoadmapItem {
  id: string;
  label: string;
  status: RoadmapStatus;
  quarter: string;
  description?: string;
}

export interface RoadmapCategory {
  id: string;
  label: string;
  color: string;
  items: RoadmapItem[];
}

export interface RoadmapData {
  slug: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  categories: RoadmapCategory[];
  quarters: string[];
}

const STATUS_LABELS: Record<RoadmapStatus, string> = {
  done: "Terminé",
  "in-progress": "En cours",
  todo: "À faire",
};

const STATUS_STYLES: Record<RoadmapStatus, { bg: string; text: string; dot: string }> = {
  done:          { bg: "rgba(123,175,110,0.12)", text: "#7BAF6E", dot: "#7BAF6E" },
  "in-progress": { bg: "rgba(129,140,248,0.15)", text: "#818CF8", dot: "#818CF8" },
  todo:          { bg: "rgba(255,255,255,0.06)",  text: "#5A6E56", dot: "#5A6E56" },
};

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  item: RoadmapItem | null;
}

export default function RoadmapViewer({ data }: { data: RoadmapData }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, item: null });

  const quarters = data.quarters;
  const filtered = activeCategory
    ? data.categories.filter((c) => c.id === activeCategory)
    : data.categories;

  function pct(quarter: string) {
    const idx = quarters.indexOf(quarter);
    if (idx === -1) return 0;
    return (idx / quarters.length) * 100;
  }

  function handleMouseMove(e: React.MouseEvent, item: RoadmapItem) {
    setTooltip({ visible: true, x: e.clientX + 14, y: e.clientY - 8, item });
  }

  function handleMouseLeave() {
    setTooltip((t) => ({ ...t, visible: false }));
  }

  const totalItems = data.categories.flatMap((c) => c.items).length;
  const doneItems = data.categories.flatMap((c) => c.items).filter((i) => i.status === "done").length;
  const inProgressItems = data.categories.flatMap((c) => c.items).filter((i) => i.status === "in-progress").length;

  return (
    <div className="text-cream w-full">

      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{data.emoji}</span>
          <h1 className="font-display text-4xl leading-none" style={{ color: data.color }}>{data.title}</h1>
        </div>
        <p className="text-muted text-sm mb-4 leading-relaxed">{data.description}</p>

        {/* Stats */}
        <div className="flex gap-5 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-lg font-semibold text-dim">{totalItems}</span>
            <span className="text-dim text-xs">Total</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-lg font-semibold text-accent">{doneItems}</span>
            <span className="text-muted text-xs">Terminés</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-lg font-semibold" style={{ color: "#818CF8" }}>{inProgressItems}</span>
            <span className="text-muted text-xs">En cours</span>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-5">
        <button
          onClick={() => setActiveCategory(null)}
          className="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150"
          style={{
            borderColor: activeCategory === null ? data.color : "rgba(123,175,110,0.2)",
            background: activeCategory === null ? data.color + "22" : "rgba(255,255,255,0.04)",
            color: activeCategory === null ? data.color : "#5A6E56",
          }}
        >
          Tout
        </button>
        {data.categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150"
            style={{
              borderColor: activeCategory === cat.id ? cat.color : "rgba(123,175,110,0.2)",
              background: activeCategory === cat.id ? cat.color + "22" : "rgba(255,255,255,0.04)",
              color: activeCategory === cat.id ? cat.color : "#5A6E56",
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Timeline header */}
      <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 88px", gap: 8, marginBottom: 4 }}>
        <div className="text-xs font-semibold uppercase tracking-widest text-dim">Étape</div>
        <div style={{ position: "relative", height: 20 }}>
          {quarters.map((q, i) => (
            <span
              key={q}
              style={{
                position: "absolute",
                left: `${(i / quarters.length) * 100}%`,
                fontSize: 11,
                fontWeight: 600,
                color: "#5A6E56",
                textTransform: "uppercase",
                letterSpacing: ".06em",
              }}
            >
              {q}
            </span>
          ))}
        </div>
        <div className="text-xs font-semibold uppercase tracking-widest text-dim text-center">Statut</div>
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-0">
        {filtered.map((cat) => (
          <div key={cat.id}>
            {/* Category label row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "160px 1fr 88px",
                gap: 8,
                padding: "10px 0 4px",
                borderBottom: `1px solid ${cat.color}30`,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: cat.color, letterSpacing: ".04em", textTransform: "uppercase" }}>
                {cat.label}
              </div>
              <div />
              <div />
            </div>

            {/* Items */}
            {cat.items.map((item) => {
              const st = STATUS_STYLES[item.status] || STATUS_STYLES.todo;
              const left = pct(item.quarter);
              const width = Math.max(3, 100 / quarters.length - 1);

              return (
                <div
                  key={item.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "160px 1fr 88px",
                    gap: 8,
                    alignItems: "center",
                    padding: "4px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  {/* Label */}
                  <div
                    className="text-xs font-medium pr-2"
                    style={{
                      color: item.status === "todo" ? "#5A6E56" : "#B8C9B0",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </div>

                  {/* Bar */}
                  <div style={{ position: "relative", height: 28 }}>
                    {quarters.map((_, i) => (
                      <div
                        key={i}
                        style={{
                          position: "absolute",
                          left: `${(i / quarters.length) * 100}%`,
                          top: 0,
                          width: 1,
                          height: "100%",
                          background: "rgba(255,255,255,0.05)",
                        }}
                      />
                    ))}
                    <div
                      onMouseMove={(e) => handleMouseMove(e, item)}
                      onMouseLeave={handleMouseLeave}
                      style={{
                        position: "absolute",
                        left: `${left}%`,
                        width: `${width}%`,
                        top: 4,
                        height: 20,
                        background:
                          item.status === "done"
                            ? cat.color
                            : item.status === "in-progress"
                            ? cat.color + "90"
                            : cat.color + "28",
                        borderRadius: 6,
                        display: "flex",
                        alignItems: "center",
                        paddingLeft: 7,
                        fontSize: 10,
                        fontWeight: 600,
                        color:
                          item.status === "done"
                            ? "#fff"
                            : item.status === "in-progress"
                            ? "#fff"
                            : cat.color + "CC",
                        cursor: "default",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.quarter}
                    </div>
                  </div>

                  {/* Status badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      padding: "3px 7px",
                      borderRadius: 8,
                      background: st.bg,
                      fontSize: 10,
                      fontWeight: 600,
                      color: st.text,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: st.dot, flexShrink: 0 }} />
                    {STATUS_LABELS[item.status]}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip.visible && tooltip.item && (
        <div
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y,
            background: "rgba(13,22,13,0.92)",
            border: "1px solid rgba(123,175,110,0.2)",
            color: "#EDF0E8",
            borderRadius: 10,
            padding: "8px 12px",
            fontSize: 12,
            maxWidth: 220,
            pointerEvents: "none",
            zIndex: 9999,
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            backdropFilter: "blur(12px)",
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 2, color: "#EDF0E8" }}>{tooltip.item.label}</div>
          {tooltip.item.description && (
            <div style={{ color: "#8FA888" }}>{tooltip.item.description}</div>
          )}
          <div style={{ color: "#5A6E56", marginTop: 4, fontSize: 11 }}>{tooltip.item.quarter}</div>
        </div>
      )}
    </div>
  );
}
