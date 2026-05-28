import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import RoadmapReadOnly from "@/components/roadmaps/RoadmapReadOnly";
import BackButton from "@/components/roadmaps/BackButton";

interface RoadmapFile {
  slug: string;
  title: string;
  emoji: string;
  color: string;
  description?: string;
  content?: object;
}

async function getRoadmap(slug: string): Promise<RoadmapFile | null> {
  try {
    const filePath = path.join(process.cwd(), "data/roadmaps", `${slug}.json`);
    const meta = JSON.parse(fs.readFileSync(filePath, "utf-8")) as RoadmapFile;

    const supabase = await createClient();
    const { data } = await supabase
      .from("roadmaps")
      .select("content")
      .eq("slug", slug)
      .single();

    return { ...meta, content: data?.content ?? meta.content ?? null };
  } catch {
    return null;
  }
}

export default async function ClientRoadmapPage({ params }: { params: { slug: string } }) {
  const roadmap = await getRoadmap(params.slug);
  if (!roadmap) notFound();

  return (
    <>
      <BackButton href="/roadmaps" />
      <RoadmapReadOnly initialData={roadmap.content ?? null} />
    </>
  );
}