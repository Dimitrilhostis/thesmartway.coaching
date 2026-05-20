import fs from "fs";
import path from "path";
import Link from "next/link";
import RoadmapCard from "@/components/roadmaps/RoadmapCard";

interface RoadmapMeta {
  slug: string;
  title: string;
  emoji: string;
  color: string;
  description?: string;
}

function getAllRoadmaps(): RoadmapMeta[] {
  const dir = path.join(process.cwd(), "data/roadmaps");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  return files.map((f) => {
    const raw = JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8"));
    return { slug: raw.slug, title: raw.title, emoji: raw.emoji, color: raw.color, description: raw.description };
  });
}

export const metadata = {
  title: "Roadmaps | Admin",
};

export default function AdminRoadmapsPage() {
  const roadmaps = getAllRoadmaps();

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-10">
        <p className="text-xs text-accent uppercase tracking-widest mb-2">Admin</p>
        <h1 className="font-display text-5xl md:text-6xl leading-none mb-3">ROADMAPS</h1>
        <p className="text-muted text-sm max-w-lg leading-relaxed">
          Crée et modifie tes roadmaps. Les clients voient la version lecture seule.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {roadmaps.map((rm) => (
          <Link
            key={rm.slug}
            href={`/admin/roadmaps/${rm.slug}`}
            className="group glass rounded-2xl p-5 hover:border-accent/30 border border-transparent transition-all"
            style={{ borderTop: `3px solid ${rm.color}` }}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{rm.emoji}</span>
              <span className="text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                Modifier →
              </span>
            </div>
            <h2 className="font-display text-lg leading-tight" style={{ color: rm.color }}>
              {rm.title}
            </h2>
            {rm.description && (
              <p className="text-xs text-muted mt-1 leading-relaxed">{rm.description}</p>
            )}
          </Link>
        ))}
      </div>
    </main>
  );
}