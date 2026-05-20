import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import Link from "next/link";
import RoadmapEditor from "@/components/roadmaps/RoadmapEditor";
import { legacyToTiptap } from "@/lib/roadmapConvert";

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

    return <RoadmapEditor slug={params.slug} initialData={roadmap.content ?? null} />;

}