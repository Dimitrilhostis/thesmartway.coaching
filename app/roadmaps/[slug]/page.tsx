import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ClientNav from "@/components/client/ClientNav";
import RoadmapEditor from "@/components/roadmaps/RoadmapEditor";
import RoadmapReadOnly from "@/components/roadmaps/RoadmapReadOnly";
import { legacyToTiptap } from "@/lib/roadmapConvert";

interface RoadmapFile {
  slug: string;
  title: string;
  emoji: string;
  color: string;
  description?: string;
  content?: object;
  // legacy fields
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

export async function generateStaticParams() {
  const dir = path.join(process.cwd(), "data/roadmaps");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  return files.map((f) => ({ slug: f.replace(".json", "") }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const data = getRoadmap(params.slug);
  if (!data) return { title: "Roadmap introuvable" };
  return {
    title: `${data.title} — Roadmap | The Smart Way`,
    description: data.description ?? "",
  };
}

export default async function RoadmapPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase.from("users").select("*").eq("id", user.id).single();
    profile = data;
  }

  const isAdmin = profile?.role === "admin";
  const isClient = profile?.role === "client" || isAdmin;

  const roadmap = getRoadmap(params.slug);
  if (!roadmap) notFound();

  // If no whiteboard content yet, convert from legacy Gantt data
  const content: object =
    roadmap.content ??
    (roadmap.categories ? legacyToTiptap(roadmap as Parameters<typeof legacyToTiptap>[0]) : { type: "doc", content: [] });

  return (
    <div className="min-h-screen text-cream">
      <ClientNav user={profile} />

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Back link */}
        <Link
          href="/roadmaps"
          className="inline-flex items-center gap-1.5 text-xs text-dim hover:text-muted transition-colors mb-6"
        >
          ← Toutes les roadmaps
        </Link>

        {/* Page title */}
        <div className="flex items-center gap-3 mb-8">
          <span className="text-3xl">{roadmap.emoji}</span>
          <div>
            <h1
              className="font-display text-4xl leading-none"
              style={{ color: roadmap.color }}
            >
              {roadmap.title}
            </h1>
            {roadmap.description && (
              <p className="text-muted text-sm mt-1">{roadmap.description}</p>
            )}
          </div>
        </div>

        {isAdmin ? (
          /* ── Admin: full editor ── */
          <RoadmapEditor slug={params.slug} initialContent={content} />
        ) : isClient ? (
          /* ── Client: read-only ── */
          <div
            className="glass rounded-2xl p-6 md:p-8 shadow-glass"
            style={{ borderTop: `3px solid ${roadmap.color}` }}
          >
            <RoadmapReadOnly content={content} />
          </div>
        ) : (
          /* ── Teaser for others ── */
          <div className="relative" style={{ height: "70vh", overflow: "hidden" }}>
            <div
              className="glass rounded-2xl p-6 md:p-8 shadow-glass pointer-events-none select-none"
              style={{ borderTop: `3px solid ${roadmap.color}` }}
            >
              <RoadmapReadOnly content={content} />
            </div>

            <div
              className="absolute inset-x-0 bottom-0 pointer-events-none"
              style={{
                height: "70%",
                background: "linear-gradient(to bottom, transparent 0%, #0d1a0d 65%)",
              }}
            />

            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-10 px-4">
              <div className="glass-dark border border-accent/15 rounded-2xl p-6 text-center max-w-xs shadow-glass">
                <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
                  <Lock size={18} className="text-accent" />
                </div>
                <h3 className="text-sm font-semibold text-cream mb-1.5">Réservé aux clients</h3>
                <p className="text-xs text-muted leading-relaxed mb-5">
                  Accède aux roadmaps complètes en rejoignant le programme de coaching.
                </p>
                <div className="flex flex-col gap-2">
                  <Link href="/rejoindre" className="btn-primary text-sm py-2.5 text-center w-full rounded-xl">
                    Rejoindre le programme
                  </Link>
                  {!user && (
                    <Link href="/login" className="btn-ghost text-xs py-2 text-center w-full rounded-xl">
                      J'ai déjà un compte
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
