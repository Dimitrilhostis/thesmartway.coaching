'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import NumberInput from '@/components/client/timer/NumberInput'
import ImmersiveOverlay from '@/components/client/timer/ImmersiveOverlay'
import { SOUNDS, IMMERSIVE_THEMES } from '@/components/client/timer/constant'
import { fmt } from '@/components/client/timer/utils'
import type { Mode, ImmersiveTheme } from '@/components/client/timer/types'

export default function TimerPage() {
  const [mode, setMode] = useState<Mode>('chronometer')
  const [time, setTime] = useState(0)
  const [running, setRunning] = useState(false)
  const [immersive, setImmersive] = useState(false)
  const [immersiveTheme, setImmersiveTheme] = useState<ImmersiveTheme>('dark')

  // Timer settings
  const [timerMin, setTimerMin] = useState(0)
  const [timerSec, setTimerSec] = useState(0)
  const [reps, setReps] = useState(1)
  const [currentRep, setCurrentRep] = useState(1)
  const [timerDuration, setTimerDuration] = useState(0)

  // Interval settings
  const [workMin, setWorkMin] = useState(25)
  const [workSec, setWorkSec] = useState(0)
  const [pauseMin, setPauseMin] = useState(5)
  const [pauseSec, setPauseSec] = useState(0)
  const [intervalReps, setIntervalReps] = useState(4)
  const [intervalPhase, setIntervalPhase] = useState<1 | 2>(1)

  // Sound
  const [sound, setSound] = useState(SOUNDS[0].src)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUnlockedRef = useRef(false)

  // Wake lock
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  const work = workMin * 60 + workSec
  const pause = pauseMin * 60 + pauseSec

  useEffect(() => {
    if ('wakeLock' in navigator && running) {
      navigator.wakeLock
        .request('screen')
        .then((lock) => {
          wakeLockRef.current = lock
        })
        .catch(() => {})
    }

    return () => {
      wakeLockRef.current?.release().then(() => {
        wakeLockRef.current = null
      })
    }
  }, [running])

  useEffect(() => {
    const audio = new Audio(sound)
    audio.preload = 'auto'
    audioRef.current = audio

    return () => {
      audio.pause()
      audioRef.current = null
      audioUnlockedRef.current = false
    }
  }, [sound])

  const playAlarm = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      audio.pause()
      audio.currentTime = 0
      await audio.play()
    } catch (err) {
      console.error('Lecture audio bloquée :', err)
    }
  }, [])

  const unlockAudio = useCallback(async () => {
    const audio = audioRef.current
    if (!audio || audioUnlockedRef.current) return

    try {
      audio.volume = 0
      audio.currentTime = 0
      await audio.play()
      audio.pause()
      audio.currentTime = 0
      audio.volume = 1
      audioUnlockedRef.current = true
    } catch (err) {
      console.error('Déblocage audio impossible :', err)
    }
  }, [])

  useEffect(() => {
    if (!running) return

    const ticker = setInterval(() => {
      setTime((prev) => {
        if (mode === 'chronometer') return prev + 1

        if (mode === 'timer') {
          if (prev > 0) return prev - 1
          playAlarm()

          if (currentRep < reps) {
            setCurrentRep((r) => r + 1)
            return timerDuration
          }

          setRunning(false)
          setImmersive(false)
          return 0
        }

        if (mode === 'interval') {
          if (prev > 0) return prev - 1
          playAlarm()

          if (intervalPhase === 1) {
            setIntervalPhase(2)
            return pause
          }

          if (currentRep < intervalReps) {
            setCurrentRep((r) => r + 1)
            setIntervalPhase(1)
            return work
          }

          setRunning(false)
          setImmersive(false)
          return 0
        }

        return prev
      })
    }, 1000)

    return () => clearInterval(ticker)
  }, [
    running,
    mode,
    reps,
    currentRep,
    timerDuration,
    playAlarm,
    work,
    pause,
    intervalReps,
    intervalPhase,
  ])

  async function startStop() {
    if (running) {
      setRunning(false)
      setImmersive(false)
      return
    }

    await unlockAudio()

    if (mode === 'timer') {
      const total = timerMin * 60 + timerSec
      setTimerDuration(total)
      setTime(total)
      setCurrentRep(1)
    }

    if (mode === 'interval') {
      setTime(work)
      setIntervalPhase(1)
      setCurrentRep(1)
    }

    setRunning(true)
    setImmersive(true)
  }

  function reset() {
    setRunning(false)
    setImmersive(false)
    setTime(0)
    setCurrentRep(1)
    setIntervalPhase(1)
  }

  const modes: { key: Mode; label: string }[] = [
    { key: 'chronometer', label: 'Chrono' },
    { key: 'timer', label: 'Minuteur' },
    { key: 'interval', label: 'Pomodoro' },
  ]

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
    <>
      {immersive && running && (
        <ImmersiveOverlay
          mode={mode}
          time={time}
          running={running}
          intervalPhase={intervalPhase}
          currentRep={currentRep}
          intervalReps={intervalReps}
          reps={reps}
          timerDuration={timerDuration}
          work={work}
          pause={pause}
          theme={immersiveTheme}
          onClose={() => {
            setRunning(false)
            setImmersive(false)
          }}
        />
      )}

      <div className="min-h-[100dvh] flex items-center justify-center px-3 py-3 md:min-h-screen md:px-4 md:py-8">
        <div className="glass shadow-glass w-full max-w-md h-[100dvh] max-h-[48rem] p-4 flex flex-col md:h-[42rem] md:p-6">
          {/* Mode tabs */}
          <div className="h-11 md:h-12 flex gap-1 p-1 glass-dark rounded-xl">
            {modes.map((m) => (
              <button
                key={m.key}
                onClick={() => {
                  setMode(m.key)
                  reset()
                }}
                className={`flex-1 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  mode === m.key
                    ? 'bg-accent/20 text-cream border border-accent/30'
                    : 'text-muted hover:text-cream'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Settings zone */}
          <div className="h-24 md:h-28 flex items-center justify-center mt-4 md:mt-6">
            {mode === 'chronometer' && (
              <p className="text-sm text-muted text-center">Prêt à démarrer</p>
            )}

            {mode === 'timer' && (
              <div className="flex justify-center gap-4 md:gap-8">
                <NumberInput label="Min" value={timerMin} onChange={setTimerMin} />
                <NumberInput label="Sec" value={timerSec} onChange={setTimerSec} max={59} />
                <NumberInput label="Rép" value={reps} onChange={setReps} min={1} />
              </div>
            )}

            {mode === 'interval' && (
              <div className="flex justify-center gap-3 md:gap-6">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] md:text-xs text-accent uppercase tracking-wider">
                    Work
                  </span>
                  <div className="flex items-center gap-1">
                    <NumberInput label="" value={workMin} onChange={setWorkMin} small />
                    <span className="text-accent font-bold">:</span>
                    <NumberInput label="" value={workSec} onChange={setWorkSec} max={59} small />
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <span className="text-[10px] md:text-xs text-amber-400 uppercase tracking-wider">
                    Pause
                  </span>
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

          {/* Display zone */}
          <div className="h-44 md:h-56 flex flex-col items-center justify-center text-center">
            <div
              className={`font-display tracking-widest transition-colors ${
                mode === 'interval' && running
                  ? intervalPhase === 1
                    ? 'text-accent'
                    : 'text-amber-400'
                  : 'text-cream'
              }`}
              style={{ fontSize: 'clamp(3.6rem, 15vw, 5rem)', lineHeight: 1 }}
            >
              {fmt(time)}
            </div>

            <div className="h-6 mt-2 flex items-center justify-center">
              {mode === 'timer' ? (
                <p className="text-xs md:text-sm text-muted">
                  Rep {currentRep} / {reps}
                </p>
              ) : mode === 'interval' ? (
                <p
                  className={`text-xs md:text-sm font-medium ${
                    intervalPhase === 1 ? 'text-accent' : 'text-amber-400'
                  }`}
                >
                  {intervalPhase === 1 ? '● Work' : '● Pause'} · Rep {currentRep}/{intervalReps}
                </p>
              ) : (
                <p className="text-sm opacity-0 select-none">placeholder</p>
              )}
            </div>

            <div className="mt-4 h-1 w-full bg-white/10 rounded-full overflow-hidden">
              {mode !== 'chronometer' && running ? (
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    mode === 'interval' && intervalPhase === 2 ? 'bg-amber-400' : 'bg-accent'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              ) : (
                <div className="h-full w-0" />
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-4 md:mt-6 h-24 flex flex-col gap-2">
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

          {/* Sound selector */}
          <div className="mt-4 md:mt-6 min-h-16 flex items-center">
            {mode !== 'chronometer' ? (
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] md:text-xs text-muted shrink-0">
                    Son d'alarme
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 md:flex md:gap-1.5 md:flex-wrap">
                  {SOUNDS.map((s) => (
                    <button
                      key={s.src}
                      onClick={() => setSound(s.src)}
                      className={`text-[11px] md:text-xs px-2.5 py-1.5 rounded-lg transition-all ${
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

          {/* Immersive theme selector */}
          <div className="mt-3 md:mt-4 min-h-16 flex items-center">
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] md:text-xs text-muted shrink-0">
                  Thème immersif
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {IMMERSIVE_THEMES.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setImmersiveTheme(t.key)}
                    className={`text-[11px] md:text-xs px-2.5 py-1.5 rounded-lg transition-all ${
                      immersiveTheme === t.key
                        ? 'bg-accent/20 text-accent border border-accent/30'
                        : 'btn-ghost'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="hidden md:block text-transparent absolute top-24 text-[11px] md:text-muted/60 tracking-wide">
          Tips : F11 pour une immersion maximum
        </p>

        <Link
          href="/outils"
          className="absolute bottom-4 md:bottom-6 text-[11px] text-muted/70 tracking-wide hover:text-cream"
        >
          Revenir à la boutique
        </Link>
      </div>
    </>
  )
}