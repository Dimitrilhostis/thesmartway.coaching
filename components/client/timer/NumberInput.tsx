'use client'

type NumberInputProps = {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  small?: boolean
}

export default function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max = 99,
  small = false,
}: NumberInputProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      {label && (
        <span className="text-[10px] md:text-xs text-accent uppercase tracking-wider">
          {label}
        </span>
      )}

      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onFocus={(e) => e.target.select()}
        onChange={(e) =>
          onChange(Math.min(max, Math.max(min, parseInt(e.target.value) || 0)))
        }
        className={`glass-input text-center font-display text-cream outline-none ${
          small
            ? 'w-10 md:w-12 text-xl md:text-2xl py-1'
            : 'w-14 md:w-16 text-2xl md:text-3xl py-1.5 md:py-2'
        }`}
        style={{ MozAppearance: 'textfield' }}
      />
    </div>
  )
}