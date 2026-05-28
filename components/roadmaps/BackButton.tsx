"use client";

export default function BackButton({ href }: { href: string }) {
  return (
    <button
      onClick={() => { window.location.href = href; }}
      style={{ position: "fixed", top: 12, right: 12, zIndex: 10000 }}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white/90 text-gray-700 hover:bg-white shadow-md transition-all"
    >
      ← Retour
    </button>
  );
}