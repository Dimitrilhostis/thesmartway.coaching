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
    return (
<div className="fixed inset-0 z-50 flex min-h-screen w-screen flex-col items-center justify-center overflow-hidden">
  {/* léger voile pour lisibilité, sans tuer le fond */}
  <div className="absolute inset-0 bg-forest/20 backdrop-blur-[2px]" />

  {/* halo discret */}
  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
    <div className="h-[32rem] w-[32rem] rounded-full bg-accent/10 blur-3xl" />
  </div>

  {/* contenu */}
  <div className="relative z-10 flex w-full flex-col items-center justify-center px-6">
    {mode === 'interval' && (
      <div
        className={`glass-pill mb-6 px-5 py-1.5 text-sm font-medium ${
          intervalPhase === 1 ? 'text-accent' : 'text-amber-400'
        }`}
      >
        {intervalPhase === 1 ? 'Work' : 'Pause'} · Rep {currentRep}/{intervalReps}
      </div>
    )}

    {mode === 'timer' && (
      <div className="glass-pill mb-6 px-5 py-1.5 text-sm text-muted">
        Rep {currentRep}/{reps}
      </div>
    )}

    <div
      className={`font-display mb-8 text-center tracking-widest transition-colors ${
        mode === 'interval'
          ? intervalPhase === 1
            ? 'text-accent'
            : 'text-amber-400'
          : 'text-cream'
      }`}
      style={{
        fontSize: 'clamp(5rem, 20vw, 10rem)',
        lineHeight: 1,
        textShadow:
          mode === 'interval'
            ? intervalPhase === 1
              ? '0 0 28px rgba(123,175,110,0.18)'
              : '0 0 28px rgba(251,191,36,0.18)'
            : '0 0 24px rgba(255,255,255,0.08)',
      }}
    >
      {fmt(time)}
    </div>

    {mode !== 'chronometer' && (
      <div className="mb-10 w-64 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-1 rounded-full transition-all duration-1000 ${
            mode === 'interval'
              ? intervalPhase === 1
                ? 'bg-accent'
                : 'bg-amber-400'
              : 'bg-accent'
          }`}
          style={{
            width: `${
              mode === 'timer'
                ? (time / timerDuration) * 100
                : intervalPhase === 1
                ? (time / work) * 100
                : (time / pause) * 100
            }%`,
          }}
        />
      </div>
    )}
    <button
      onClick={() => {
        setRunning(false)
        setImmersive(false)
      }}
      className="text-sm text-muted transition-colors hover:text-white"
    >
      Quitter le mode immersif
    </button>
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
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 py-8">
      {/* Breadcrumb */}
      <div className="w-full max-w-md mb-4">
        <Link href="/outils" className="text-xs text-dim hover:text-accent transition-colors">
          ← Outils
        </Link>
      </div>

      <div className="glass shadow-glass w-full max-w-md p-6 flex flex-col gap-6">

        {/* Mode tabs */}
        <div className="flex gap-1 p-1 glass-dark rounded-xl">
          {modes.map(m => (
            <button
              key={m.key}
              onClick={() => { setMode(m.key); reset() }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === m.key
                  ? 'bg-accent/20 text-cream border border-accent/30'
                  : 'text-muted hover:text-cream'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Settings */}
        <div className="flex justify-center gap-8">
          {mode === 'chronometer' && (
            <p className="text-sm text-muted text-center py-2">Prêt à démarrer</p>
          )}

          {mode === 'timer' && (
            <>
              <NumberInput label="Min" value={timerMin} onChange={setTimerMin} />
              <NumberInput label="Sec" value={timerSec} onChange={setTimerSec} max={59} />
              <NumberInput label="Rép" value={reps} onChange={setReps} min={1} />
            </>
          )}

          {mode === 'interval' && (
            <>
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
            </>
          )}
        </div>

        {/* Big display */}
        <div className="text-center">
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

          {/* Phase info */}
          {mode === 'timer' && (
            <p className="text-sm text-muted mt-2">Rep {currentRep} / {reps}</p>
          )}
          {mode === 'interval' && (
            <p className={`text-sm mt-2 font-medium ${intervalPhase === 1 ? 'text-accent' : 'text-amber-400'}`}>
              {intervalPhase === 1 ? '● Work' : '● Pause'} · Rep {currentRep}/{intervalReps}
            </p>
          )}

          {/* Progress bar */}
          {mode !== 'chronometer' && running && (
            <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
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
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2">
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

          {!running && time > 0 && (
            <button onClick={reset} className="w-full btn-ghost py-3 rounded-xl text-sm">
              Réinitialiser
            </button>
          )}
        </div>

        {/* Sound selector */}
        {mode !== 'chronometer' && (
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
        )}
      </div>
        <p className="text-transparent absolute bottom-4 text-[11px] md:text-muted/60 tracking-wide">
          Tips : F11 pour une immersion maximum
        </p>
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