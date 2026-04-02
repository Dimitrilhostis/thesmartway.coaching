'use client'

import { fmt } from './utils'
import type { Mode, ImmersiveTheme } from './types'

type Props = {
  mode: Mode
  time: number
  running: boolean
  intervalPhase: 1 | 2
  currentRep: number
  intervalReps: number
  reps: number
  timerDuration: number
  work: number
  pause: number
  theme: ImmersiveTheme
  onClose: () => void
}

export default function ImmersiveOverlay({
  mode,
  time,
  running,
  intervalPhase,
  currentRep,
  intervalReps,
  reps,
  timerDuration,
  work,
  pause,
  theme,
  onClose,
}: Props) {
  if (!running) return null

  const progress =
    mode === 'timer'
      ? timerDuration > 0
        ? (time / timerDuration) * 100
        : 0
      : mode === 'interval'
        ? intervalPhase === 1
          ? work > 0
            ? (time / work) * 100
            : 0
          : pause > 0
            ? (time / pause) * 100
            : 0
        : 0

  const themeStyles = {
    dark: {
      shell: 'bg-[#0f1713] text-sage-light',
      panel:
        'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_45%)]',
      blur: 'backdrop-blur-[12px]',
      vignette:
        'bg-[radial-gradient(circle,transparent_38%,rgba(0,0,0,0.52)_100%)]',

      mainText: 'text-sage-light',
      softText: 'text-sage-light/75',

      badge: 'border-sage-light/20 bg-sage-light/10 text-sage-light',
      badgeSoft: 'border-white/10 bg-white/5 text-sage-light/75',

      glowPrimary: 'bg-sage-light/18',
      glowSecondary: 'bg-sage-light/10',

      progressTrack: 'bg-white/8 ring-1 ring-white/6',
      progressBar:
        'bg-sage-light shadow-[0_0_24px_rgba(92,125,82,0.35)]',

      button:
        'border border-sage-light bg-sage-light/10 text-sage-light hover:bg-sage-light/16',
    },

    light: {
      shell: 'bg-[#f6f3ea] text-emerald-700',
      panel:
        'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.7),transparent_50%)]',
      blur: 'backdrop-blur-[16px] bg-white/25',
      vignette:
        'bg-[radial-gradient(circle,transparent_38%,rgba(255,255,255,0.24)_100%)]',

      mainText: 'text-emerald-700',
      softText: 'text-emerald-700/75',

      badge: 'border-emerald-600/20 bg-emerald-500/10 text-emerald-700',
      badgeSoft: 'border-black/8 bg-white/55 text-emerald-700/75',

      glowPrimary: 'bg-emerald-500/18',
      glowSecondary: 'bg-emerald-400/10',

      progressTrack: 'bg-black/5 ring-1 ring-black/6',
      progressBar:
        'bg-emerald-600 shadow-[0_0_24px_rgba(5,150,105,0.28)]',

      button:
        'border border-emerald-700/12 bg-white/55 text-emerald-700 hover:bg-white/75',
    },

    chill: {
      shell: 'text-black',
      panel:
        'bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_45%)]',
      vignette:
        'bg-[radial-gradient(circle,transparent_38%,rgba(0,0,0,0.28)_100%)]',

      mainText: 'text-black',
      softText: 'text-black',

      badge: 'border-black text-black',
      badgeSoft: 'border-black/10 bg-white/28 text-black/75',

      glowPrimary: 'bg-white/18',
      glowSecondary: 'bg-black/8',

      progressTrack: 'bg-white/20 ring-black/8',
      progressBar: 'bg-black shadow-[0_0_20px_rgba(0,0,0,0.20)]',

      button:
        'text-black border border-black/10 bg-white/28 hover:bg-sage/40',
    },
  } as const

  const ui = themeStyles[theme]

  const timerShadow =
    theme === 'dark'
      ? '0 0 18px rgba(92,125,82,0.18), 0 0 44px rgba(92,125,82,0.10)'
      : theme === 'light'
        ? '0 0 18px rgba(5,150,105,0.12), 0 0 44px rgba(5,150,105,0.06)'
        : '0 0 18px rgba(255,255,255,0.10)'

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {theme === 'chill' ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center scale-110"
            style={{ backgroundImage: "url('/hero-bg.jpg')" }}
          />
          <div className="absolute inset-0 bg-black/70" />
        </>
      ) : (
        <div className={`absolute inset-0 ${ui.shell}`} />
      )}

      <div className={`absolute inset-0 ${ui.panel}`} />

      <div
        className={`pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl md:h-[42rem] md:w-[42rem] ${ui.glowSecondary}`}
      />

      <div
        className={`pointer-events-none absolute left-1/2 top-1/2 h-[16rem] w-[16rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-all duration-700 md:h-[26rem] md:w-[26rem] ${ui.glowPrimary}`}
      />

      <div
        className={`pointer-events-none absolute inset-0 ${ui.vignette}`}
      />

      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-center px-4 text-center md:px-6">
        <div className="mb-5 h-10 flex items-center md:mb-8">
          {mode === 'interval' && (
            <div
              className={`rounded-full border px-4 py-2 text-[10px] font-medium uppercase tracking-[0.22em] backdrop-blur-xl transition-all duration-500 md:px-5 md:text-[11px] md:tracking-[0.28em] ${ui.badge}`}
            >
              {intervalPhase === 1 ? 'Work phase' : 'Pause phase'} · Rep{' '}
              {currentRep}/{intervalReps}
            </div>
          )}

          {mode === 'timer' && (
            <div
              className={`rounded-full border px-4 py-2 text-[10px] font-medium uppercase tracking-[0.22em] backdrop-blur-xl md:px-5 md:text-[11px] md:tracking-[0.28em] ${ui.badgeSoft}`}
            >
              Timer · Rep {currentRep}/{reps}
            </div>
          )}

          {mode === 'chronometer' && (
            <div
              className={`rounded-full border px-4 py-2 text-[10px] font-medium uppercase tracking-[0.22em] backdrop-blur-xl md:px-5 md:text-[11px] md:tracking-[0.28em] ${ui.badgeSoft}`}
            >
              Chronometer
            </div>
          )}
        </div>

        <div className="relative mb-5 flex items-center justify-center md:mb-8">

          <div
            className={`relative font-display tracking-[0.08em] transition-all duration-500 ${ui.mainText}`}
            style={{
              fontSize: 'clamp(4.2rem, 19vw, 11rem)',
              lineHeight: 0.92,
              textShadow: timerShadow,
            }}
          >
            {fmt(time)}
          </div>
        </div>

        <div className="mb-6 h-6 flex items-center justify-center md:mb-8">
          {mode === 'interval' ? (
            <p
              className={`text-xs font-medium tracking-[0.18em] uppercase md:text-sm md:tracking-[0.2em] ${ui.softText}`}
            >
              {intervalPhase === 1 ? 'Focus' : 'Take a break'}
            </p>
          ) : mode === 'timer' ? (
            <p
              className={`text-xs uppercase tracking-[0.18em] md:text-sm md:tracking-[0.2em] ${ui.softText}`}
            >
              Focus
            </p>
          ) : (
            <p
              className={`text-xs uppercase tracking-[0.18em] md:text-sm md:tracking-[0.2em] ${ui.softText}`}
            >
              Keep going
            </p>
          )}
        </div>

        {mode !== 'chronometer' && (
          <div className="mb-8 w-full max-w-[18rem] md:mb-10 md:max-w-md">
            <div
              className={`h-2 overflow-hidden rounded-full backdrop-blur-xl ${ui.progressTrack}`}
            >
              <div
                className={`h-full rounded-full transition-all duration-1000 ${ui.progressBar}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col items-center gap-3">
          <button
            onClick={onClose}
            className={`fixed rounded-full bottom-12 px-5 py-2 text-sm transition-all ${ui.button}`}
          >
            Quitter le mode immersif
          </button>
        </div>
      </div>
    </div>
  )
}