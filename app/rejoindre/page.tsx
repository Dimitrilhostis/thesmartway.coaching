'use client'

import Steps from '@/components/form/Steps'

export default function RejoindrePage() {
  return (
    <main className="relative min-h-screen flex flex-col justify-center px-4 bg-[#07140f] text-cream overflow-hidden">

      {/* BACKGROUND */}
      <div className="absolute inset-0">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-250px] right-[-100px] w-[500px] h-[500px] bg-white/5 blur-[120px] rounded-full" />
      </div>

      {/* WRAPPER FLEX CENTRÉ */}
      <div className="relative w-full max-w-3xl mx-auto flex flex-col">

        {/* HEADER (FIXED SPACE) */}
        <div className="text-center space-y-5 mb-6 shrink-0">

          <p className="text-xs tracking-[0.35em] text-dim uppercase">
            Coaching application
          </p>

          <h1 className="font-display text-4xl md:text-6xl leading-[0.9] tracking-tight">
            THE <span className="text-accent">SMART</span> WAY
          </h1>

          <div className="w-20 h-[1px] bg-white/20 mx-auto" />

        </div>

        {/* FORM AREA (THE KEY FIX) */}
        <div className="
          relative flex-1
          flex items-center justify-center
          min-h-[560px]
        ">
          <div className="
            w-full
            rounded-[34px]
            border border-white/10
            bg-white/[0.03]
            backdrop-blur-xl
            shadow-[0_20px_80px_rgba(0,0,0,0.4)]
            p-5 md:p-7
          ">
            <Steps />
          </div>
        </div>

        {/* FOOTER (FIXED SPACE) */}
        <div className="text-center mt-6 shrink-0">
          <p className="text-xs text-dim">
            Rejoins la communauté The Smart Way
          </p>
        </div>

      </div>

    </main>
  )
}
