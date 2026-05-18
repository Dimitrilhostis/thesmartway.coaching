import fs from "fs";
import path from "path";
import Link from "next/link";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import RoadmapCard from "@/components/roadmaps/RoadmapCard";
import ClientNav from "@/components/client/ClientNav";

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
  title: "Roadmaps | The Smart Way",
  description: "Toutes mes progressions personnelles : sport, cuisine, musique et plus.",
};

export default async function RoadmapsIndex() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase.from("users").select("*").eq("id", user.id).single();
    profile = data;
  }

  const isClient = profile?.role === "client" || profile?.role === "admin";
  const roadmaps = getAllRoadmaps();

  return (
    <div className="min-h-screen text-cream">
      <ClientNav user={profile} />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs text-accent uppercase tracking-widest mb-2">Progression</p>
          <h1 className="font-display text-5xl md:text-6xl leading-none mb-3">MES ROADMAPS</h1>
          <p className="text-muted text-sm max-w-lg leading-relaxed">
            Mes progressions personnelles, domaine par domaine. Chaque roadmap est un tableau blanc libre.
          </p>
        </div>

        {isClient ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {roadmaps.map((rm) => (
              <RoadmapCard key={rm.slug} rm={rm} />
            ))}
          </div>
        ) : (
          <div className="relative" style={{ height: "65vh", overflow: "hidden" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pointer-events-none select-none">
              {roadmaps.map((rm) => (
                <RoadmapCard key={rm.slug} rm={rm} />
              ))}
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
                  Accède à mes roadmaps complètes en rejoignant le programme de coaching.
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
