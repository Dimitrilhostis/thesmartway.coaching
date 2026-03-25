"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function FooterReveal() {
    const sectionRef = useRef<HTMLDivElement>(null)
    const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;

      const rect = sectionRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;

      // progression du scroll dans la section finale
      const total = rect.height - windowH;
      const passed = Math.min(Math.max(-rect.top, 0), total);
      const p = total > 0 ? passed / total : 0;

      setProgress(p);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const panelScale = 0.8 + progress * 0.2;
  const panelRadius = 32 - progress * 32;
  const panelOpacity = 0 + progress * 1;
  const textTranslate = 80 - progress * 40;
  const textOpacity = Math.min(1, 0.6 + progress * 0.8);

  return (
    <section
      ref={sectionRef}
      className="relative h-[220vh] bg-forest-0.5"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div
          className="absolute inset-0 border-t border-border bg-card-dark-full will-change-transform"
          style={{
            transform: `scale(${panelScale})`,
            borderRadius: `${panelRadius}px`,
            opacity: panelOpacity,
          }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_55%)] pointer-events-none" />

        <div
          className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6"
          style={{
            transform: `translateY(${textTranslate}px)`,
            opacity: textOpacity,
          }}
        >
          <p className="text-accent text-xs uppercase tracking-[0.35em] mb-5">
            The Smart Way
          </p>

          <h2 className="font-display text-5xl md:text-7xl lg:text-8xl leading-none text-cream mb-6">
            PRÊT À COMMENCER
          </h2>

          <p className="text-muted text-sm md:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Prends enfin un vrai départ. Structure, discipline, progression :
            tout commence ici.
          </p>

          <Link
            href="/login"
            className="btn-primary text-base px-8 py-3"
          >
            Démarrer maintenant
          </Link>
        </div>
      </div>
    </section>
  );
}