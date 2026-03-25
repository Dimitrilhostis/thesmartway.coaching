'use client'

import { DAYS, type Program } from '@/lib/types'

const TODAY_KEY = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()]

export default function PlanningPanel({ program }: { program: Program | null }) {
  return (
    <div className="w-full">
      <h2 className="font-display text-2xl tracking-wide text-cream mb-1">
        MON PLANNING
      </h2>

      <p className="text-muted text-sm mb-4">
        {new Date().toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-7 md:gap-3">
        {Object.entries(DAYS).map(([key, label]) => {
          const session =
            program?.weekly_schedule?.[
              key as keyof typeof program.weekly_schedule
            ]
          const isToday = key === TODAY_KEY

          return (
            <div
              key={key}
              className={`rounded-2xl p-3 transition-all min-h-[82px] md:min-h-[120px] ${
                isToday
                  ? 'glass border border-accent/35 shadow-glass-sm'
                  : 'glass-light'
              }`}
            >
              <div className="flex items-start justify-between gap-3 md:flex-col md:items-start md:justify-start">
                <span
                  className={`shrink-0 text-sm md:text-xs uppercase tracking-wider font-medium ${
                    isToday ? 'text-accent' : 'text-dim'
                  }`}
                >
                  {label}
                  {isToday ? ' ●' : ''}
                </span>

                <div className="flex-1 md:flex-none text-right md:text-left">
                  {session ? (
                    <span className="block text-sm md:text-xs text-mist leading-snug">
                      {session as string}
                    </span>
                  ) : (
                    <span className="block text-sm md:text-xs text-dim/50">
                      Repos
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}