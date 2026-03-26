'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'

// ── Types ──
type Mode = 'chronometer' | 'timer' | 'interval'

const SOUNDS = [
  { label: 'Piano',  src: '/sounds/PIANO.mp3'  },
  { label: 'Klaxon', src: '/sounds/KLAXON.mp3' },
  { label: 'Notif',  src: '/sounds/NOTIF.mp3'  },
  { label: 'Chat',  src: '/sounds/CHAT.mp3'  },
  { label: 'Pet',  src: '/sounds/PET.mp3'  },
  { label: 'Cri',  src: '/sounds/CRI.mp3'  },
]

function fmt(s: number) {
  const m = Math.floor(s / 60)
  const ss = s % 60
  return `${String(m).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}

export default function TimerPage() {
  const [mode, setMode] = useState<Mode>('chronometer')
  const [time, setTime] = useState(0)
  const [running, setRunning] = useState(false)
  const [immersive, setImmersive] = useState(false)

  // Timer settings
  const [timerMin, setTimerMin] = useState(0)
  const [timerSec, setTimerSec] = useState(0)
  const [reps, setReps] = useState(1)
  const [currentRep, setCurrentRep] = useState(1)
  const [timerDuration, setTimerDuration] = useState(0)

  // Interval settings
  const [workMin, setWorkMin] = useState(0)
  const [workSec, setWorkSec] = useState(30)
  const [pauseMin, setPauseMin] = useState(0)
  const [pauseSec, setPauseSec] = useState(10)
  const [intervalReps, setIntervalReps] = useState(5)
  const [intervalPhase, setIntervalPhase] = useState<1 | 2>(1)

  // Sound
  const [sound, setSound] = useState(SOUNDS[0].src)

  // Wake lock
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  useEffect(() => {
    if ('wakeLock' in navigator && running) {
      navigator.wakeLock.request('screen')
        .then(lock => { wakeLockRef.current = lock })
        .catch(() => {})
    }
    return () => {
      wakeLockRef.current?.release().then(() => { wakeLockRef.current = null })
    }
  }, [running])

  const playAlarm = useCallback(() => {
    new Audio(sound).play().catch(() => {})
  }, [sound])

  const work = workMin * 60 + workSec
  const pause = pauseMin * 60 + pauseSec

  // ── Ticker ──
  useEffect(() => {
    if (!running) return
    const ticker = setInterval(() => {
      setTime(prev => {
        if (mode === 'chronometer') return prev + 1
        if (mode === 'timer') {
          if (prev > 0) return prev - 1
          playAlarm()
          if (currentRep < reps) { setCurrentRep(r => r + 1); return timerDuration }
          setRunning(false); setImmersive(false); return 0
        }
        if (mode === 'interval') {
          if (prev > 0) return prev - 1
          playAlarm()
          if (intervalPhase === 1) { setIntervalPhase(2); return pause }
          if (currentRep < intervalReps) { setCurrentRep(r => r + 1); setIntervalPhase(1); return work }
          setRunning(false); setImmersive(false); return 0
        }
        return prev
      })
    }, 1000)
    return () => clearInterval(ticker)
  }, [running, mode, reps, currentRep, timerDuration, playAlarm, work, pause, intervalReps, intervalPhase])

  function startStop() {
    if (running) {
      setRunning(false); setImmersive(false); return
    }
    if (mode === 'timer') {
      const tot = timerMin * 60 + timerSec
      setTimerDuration(tot); setTime(tot); setCurrentRep(1)
    }
    if (mode === 'interval') {
      setTime(work); setIntervalPhase(1); setCurrentRep(1)
    }
    setRunning(true); setImmersive(true)
  }

  function reset() {
    setRunning(false); setImmersive(false)
    setTime(0); setCurrentRep(1); setIntervalPhase(1)
  }

  // ── Immersive overlay ──
  if (immersive && running) {
    const isIntervalWork = mode === 'interval' && intervalPhase === 1
    const isIntervalPause = mode === 'interval' && intervalPhase === 2

    const themeClass =
      mode === 'interval'
        ? isIntervalWork
          ? 'text-accent'
          : 'text-amber-400'
        : 'text-cream'

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

    return (
      <div className="fixed inset-0 z-[100] overflow-hidden">
        {/* Fond principal */}
        <div className="absolute inset-0 bg-[#0b120d]" />

        {/* Texture / profondeur */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_45%)]" />
        <div className="absolute inset-0 backdrop-blur-[10px]" />

        {/* Gros halos */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
        <div
          className={`pointer-events-none absolute left-1/2 top-1/2 h-[26rem] w-[26rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-all duration-700 ${
            mode === 'interval'
              ? intervalPhase === 1
                ? 'bg-accent/20'
                : 'bg-amber-400/20'
              : 'bg-white/10'
          }`}
        />

        {/* Vignette */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.45)_100%)]" />

        {/* Contenu */}
        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
          {/* Badge haut */}
          <div className="mb-8 h-10 flex items-center">
            {mode === 'interval' && (
              <div
                className={`rounded-full border px-5 py-2 text-[11px] font-medium uppercase tracking-[0.28em] backdrop-blur-xl transition-all duration-500 ${
                  intervalPhase === 1
                    ? 'border-accent/25 bg-accent/10 text-accent shadow-[0_0_30px_rgba(123,175,110,0.12)]'
                    : 'border-amber-400/25 bg-amber-400/10 text-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.12)]'
                }`}
              >
                {intervalPhase === 1 ? 'Work phase' : 'Pause phase'} · Rep {currentRep}/{intervalReps}
              </div>
            )}

            {mode === 'timer' && (
              <div className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[11px] font-medium uppercase tracking-[0.28em] text-muted backdrop-blur-xl">
                Timer · Rep {currentRep}/{reps}
              </div>
            )}

            {mode === 'chronometer' && (
              <div className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-[11px] font-medium uppercase tracking-[0.28em] text-muted backdrop-blur-xl">
                Chronometer
              </div>
            )}
          </div>

          {/* Anneaux derrière le temps */}
          <div className="relative mb-8 flex items-center justify-center">
            <div
              className={`absolute h-[22rem] w-[22rem] rounded-full border transition-all duration-700 ${
                mode === 'interval'
                  ? intervalPhase === 1
                    ? 'border-accent/15 shadow-[0_0_60px_rgba(123,175,110,0.08)]'
                    : 'border-amber-400/15 shadow-[0_0_60px_rgba(251,191,36,0.08)]'
                  : 'border-white/10 shadow-[0_0_60px_rgba(255,255,255,0.05)]'
              }`}
            />
            <div
              className={`absolute h-[18rem] w-[18rem] rounded-full border transition-all duration-700 ${
                mode === 'interval'
                  ? intervalPhase === 1
                    ? 'border-accent/10'
                    : 'border-amber-400/10'
                  : 'border-white/5'
              }`}
            />

            <div
              className={`relative font-display tracking-[0.08em] transition-all duration-500 ${themeClass}`}
              style={{
                fontSize: 'clamp(5.5rem, 18vw, 11rem)',
                lineHeight: 0.92,
                textShadow:
                  mode === 'interval'
                    ? intervalPhase === 1
                      ? '0 0 18px rgba(123,175,110,0.18), 0 0 44px rgba(123,175,110,0.10)'
                      : '0 0 18px rgba(251,191,36,0.18), 0 0 44px rgba(251,191,36,0.10)'
                    : '0 0 18px rgba(255,255,255,0.12), 0 0 44px rgba(255,255,255,0.06)',
              }}
            >
              {fmt(time)}
            </div>
          </div>

          {/* Sous-info */}
          <div className="mb-8 h-6 flex items-center justify-center">
            {mode === 'interval' ? (
              <p
                className={`text-sm font-medium tracking-[0.2em] uppercase ${
                  intervalPhase === 1 ? 'text-accent/90' : 'text-amber-400/90'
                }`}
              >
                {intervalPhase === 1 ? 'Push now' : 'Recover'}
              </p>
            ) : mode === 'timer' ? (
              <p className="text-sm uppercase tracking-[0.2em] text-muted">
                Focus
              </p>
            ) : (
              <p className="text-sm uppercase tracking-[0.2em] text-muted">
                Keep going
              </p>
            )}
          </div>

          {/* Progression */}
          {mode !== 'chronometer' && (
            <div className="mb-10 w-full max-w-md">
              <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.22em] text-muted">
                <span>Progression</span>
                <span>{Math.round(progress)}%</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/8 ring-1 ring-white/6 backdrop-blur-xl">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    mode === 'interval'
                      ? intervalPhase === 1
                        ? 'bg-accent shadow-[0_0_20px_rgba(123,175,110,0.45)]'
                        : 'bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.45)]'
                      : 'bg-accent shadow-[0_0_20px_rgba(123,175,110,0.45)]'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Contrôles bas */}
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => {
                setRunning(false)
                setImmersive(false)
              }}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-muted backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              Quitter le mode immersif
            </button>

            <p className="text-[11px] uppercase tracking-[0.22em] text-muted/60">
              F11 pour encore plus d’immersion
            </p>
          </div>
        </div>
      </div>
    )
  }

  const modes: { key: Mode; label: string }[] = [
    { key: 'chronometer', label: 'Chrono'    },
    { key: 'timer',       label: 'Minuteur'  },
    { key: 'interval',    label: 'Intervalles' },
  ]

    // ── Standard view ──
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="glass shadow-glass w-full max-w-md h-[42rem] p-6 flex flex-col">
  
          {/* Mode tabs */}
          <div className="h-12 flex gap-1 p-1 glass-dark rounded-xl">
            {modes.map(m => (
              <button
                key={m.key}
                onClick={() => { setMode(m.key); reset() }}
                className={`flex-1 rounded-lg text-sm font-medium transition-all ${
                  mode === m.key
                    ? 'bg-accent/20 text-cream border border-accent/30'
                    : 'text-muted hover:text-cream'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
  
          {/* Settings zone fixe */}
          <div className="h-28 flex items-center justify-center mt-6">
            {mode === 'chronometer' && (
              <p className="text-sm text-muted text-center">Prêt à démarrer</p>
            )}
  
            {mode === 'timer' && (
              <div className="flex justify-center gap-8">
                <NumberInput label="Min" value={timerMin} onChange={setTimerMin} />
                <NumberInput label="Sec" value={timerSec} onChange={setTimerSec} max={59} />
                <NumberInput label="Rép" value={reps} onChange={setReps} min={1} />
              </div>
            )}
  
            {mode === 'interval' && (
              <div className="flex justify-center gap-6">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-accent uppercase tracking-wider">Work</span>
                  <div className="flex items-center gap-1">
                    <NumberInput label="" value={workMin} onChange={setWorkMin} small />
                    <span className="text-accent font-bold">:</span>
                    <NumberInput label="" value={workSec} onChange={setWorkSec} max={59} small />
                  </div>
                </div>
  
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-amber-400 uppercase tracking-wider">Pause</span>
                  <div className="flex items-center gap-1">
                    <NumberInput label="" value={pauseMin} onChange={setPauseMin} small />
                    <span className="text-amber-400 font-bold">:</span>
                    <NumberInput label="" value={pauseSec} onChange={setPauseSec} max={59} small />
                  </div>
                </div>
  
                <NumberInput label="Rép" value={intervalReps} onChange={setIntervalReps} min={1} />
              </div>
            )}
          </div>
  
          {/* Big display zone fixe */}
          <div className="h-56 flex flex-col items-center justify-center text-center">
            <div
              className={`font-display tracking-widest transition-colors ${
                mode === 'interval' && running
                  ? intervalPhase === 1 ? 'text-accent' : 'text-amber-400'
                  : 'text-cream'
              }`}
              style={{ fontSize: '5rem', lineHeight: 1 }}
            >
              {fmt(time)}
            </div>
  
            <div className="h-6 mt-2 flex items-center justify-center">
              {mode === 'timer' ? (
                <p className="text-sm text-muted">Rep {currentRep} / {reps}</p>
              ) : mode === 'interval' ? (
                <p className={`text-sm font-medium ${intervalPhase === 1 ? 'text-accent' : 'text-amber-400'}`}>
                  {intervalPhase === 1 ? '● Work' : '● Pause'} · Rep {currentRep}/{intervalReps}
                </p>
              ) : (
                <p className="text-sm opacity-0 select-none">placeholder</p>
              )}
            </div>
  
            <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
              {(mode !== 'chronometer' && running) ? (
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    mode === 'interval' && intervalPhase === 2 ? 'bg-amber-400' : 'bg-accent'
                  }`}
                  style={{
                    width: `${mode === 'timer'
                      ? timerDuration > 0 ? (time / timerDuration) * 100 : 0
                      : intervalPhase === 1
                        ? work > 0 ? (time / work) * 100 : 0
                        : pause > 0 ? (time / pause) * 100 : 0
                    }%`
                  }}
                />
              ) : (
                <div className="h-full w-0" />
              )}
            </div>
          </div>
  
          {/* Controls zone fixe */}
          <div className="mt-6 h-24 flex flex-col gap-2">
            <button
              onClick={startStop}
              className={`w-full py-3.5 rounded-xl text-sm font-medium transition-all ${
                running
                  ? 'bg-danger/20 border border-danger/30 text-danger hover:bg-danger/30'
                  : 'btn-primary'
              }`}
            >
              {running ? 'Arrêter' : 'Démarrer'}
            </button>
  
            <button
              onClick={reset}
              className={`w-full btn-ghost py-3 rounded-xl text-sm transition-opacity ${
                !running && time > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              Réinitialiser
            </button>
          </div>
  
          {/* Sound selector zone fixe */}
          <div className="mt-6 h-20 flex items-center">
            {mode !== 'chronometer' ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted shrink-0">Son d'alarme</span>
                <div className="flex gap-1.5 flex-wrap">
                  {SOUNDS.map(s => (
                    <button
                      key={s.src}
                      onClick={() => setSound(s.src)}
                      className={`text-xs px-3 py-1 rounded-lg transition-all ${
                        sound === s.src
                          ? 'bg-accent/20 text-accent border border-accent/30'
                          : 'btn-ghost'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="opacity-0 select-none">placeholder</div>
            )}
          </div>
        </div>
  
        <p className="text-transparent absolute top-24 text-[11px] md:text-muted/60 tracking-wide">
          Tips : F11 pour une immersion maximum
        </p>

        <Link href="/outils" className=" absolute bottom-6 text-[11px] md:text-muted/60 tracking-wide">
          Revenir à la boutique
        </Link>
      </div>
    )
}

// ── Sub-component : champ numérique ──
function NumberInput({
  label, value, onChange, min = 0, max = 99, small = false
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  small?: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      {label && <span className="text-xs text-accent uppercase tracking-wider">{label}</span>}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onFocus={e => e.target.select()}
        onChange={e => onChange(Math.min(max, Math.max(min, parseInt(e.target.value) || 0)))}
        className={`glass-input text-center font-display text-cream outline-none ${
          small ? 'w-12 text-2xl py-1' : 'w-16 text-3xl py-2'
        }`}
        style={{ MozAppearance: 'textfield' }}
      />
    </div>
  )
}