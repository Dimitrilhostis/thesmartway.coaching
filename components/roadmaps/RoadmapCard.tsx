"use client";

interface RoadmapMeta {
  slug: string;
  title: string;
  emoji: string;
  color: string;
  description?: string;
}

export default function RoadmapCard({ rm }: { rm: RoadmapMeta }) {
  return (
    <a href={`/roadmaps/${rm.slug}`} className="block no-underline group">
      <div
        className="glass h-full p-5 rounded-2xl border border-border transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-accent/30 group-hover:shadow-glass cursor-pointer"
        style={{ borderTopColor: rm.color, borderTopWidth: 3 }}
      >
        <div className="flex items-center gap-2.5 mb-2.5">
          <span className="text-xl">{rm.emoji}</span>
          <span className="text-sm font-medium text-cream">{rm.title}</span>
        </div>

        {rm.description && (
          <p className="text-xs text-muted leading-relaxed mb-3 line-clamp-2">
            {rm.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto">
          <span className="text-xs text-dim">Voir le roadmap</span>
          <span
            className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: rm.color }}
          >
            →
          </span>
        </div>
      </div>
    </a>
  );
}
