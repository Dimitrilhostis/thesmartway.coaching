import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import Link from "next/link";
import RoadmapEditor from "@/components/roadmaps/RoadmapEditor";
import { legacyToTiptap } from "@/lib/roadmapConvert";
import { TLEditorSnapshot } from "tldraw";

interface RoadmapFile {
  slug: string;
  title: string;
  emoji: string;
  color: string;
  description?: string;
  content?: object;
  categories?: unknown[];
}

function getRoadmap(slug: string): RoadmapFile | null {
  try {
    const filePath = path.join(process.cwd(), "data/roadmaps", `${slug}.json`);
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as RoadmapFile;
  } catch {
    return null;
  }
}

export default async function AdminRoadmapPage({ params }: { params: { slug: string } }) {
  const roadmap = getRoadmap(params.slug);
  if (!roadmap) notFound();

  const content: object =
    roadmap.content ??
    (roadmap.categories
      ? legacyToTiptap(roadmap as Parameters<typeof legacyToTiptap>[0])
      : { type: "doc", content: [] });

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link
        href="/roadmaps"
        className="inline-flex items-center gap-1.5 text-xs text-dim hover:text-muted transition-colors mb-6"
      >
        ← Toutes les roadmaps
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl">{roadmap.emoji}</span>
        <div>
          <h1 className="font-display text-4xl leading-none" style={{ color: roadmap.color }}>
            {roadmap.title}
          </h1>
          {roadmap.description && (
            <p className="text-muted text-sm mt-1">{roadmap.description}</p>
          )}
        </div>
      </div>

      <RoadmapEditor slug={params.slug} initialSnapshot={roadmap.content as TLEditorSnapshot ?? null} />
      </div>
  );
}