import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import RoadmapReadOnly from "@/components/roadmaps/RoadmapReadOnly";
import { TLEditorSnapshot } from "tldraw";

interface RoadmapFile {
  slug: string;
  title: string;
  emoji: string;
  color: string;
  description?: string;
  content?: TLEditorSnapshot;
}

function getRoadmap(slug: string): RoadmapFile | null {
  try {
    const filePath = path.join(process.cwd(), "data/roadmaps", `${slug}.json`);
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as RoadmapFile;
  } catch {
    return null;
  }
}

export default async function ClientRoadmapPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase.from("users").select("*").eq("id", user.id).single();
    profile = data;
  }

  const isClient = profile?.role === "client" || profile?.role === "admin";

  const roadmap = getRoadmap(params.slug);
  if (!roadmap) notFound();

  return (
    <>
      {isClient ? (
        /* ── Client : whiteboard full viewport ── */
        <div style={{ position: "fixed", inset: 0 }}>
          {/* Bouton retour flottant */}
          <div style={{ position: "fixed", top: 12, left: 12, zIndex: 500 }}>
            <Link
              href="/roadmaps"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white/90 text-gray-700 hover:bg-white shadow-md transition-all"
            >
              ← Retour
            </Link>
          </div>
          <RoadmapReadOnly snapshot={roadmap.content ?? null} />
        </div>
      ) : (
        /* ── Teaser pour les non-clients ── */
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

          <div className="relative" style={{ height: "70vh", overflow: "hidden" }}>
            <div
              className="glass rounded-2xl p-6 md:p-8 shadow-glass pointer-events-none select-none"
              style={{ borderTop: `3px solid ${roadmap.color}`, height: "100%" }}
            />

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
        </div>
      )}
    </>
  );
}