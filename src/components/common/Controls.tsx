import type { ReactNode } from 'react'

export function Slider({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (value: number) => void
}) {
  const percent = ((value - min) / (max - min)) * 100
  return (
    <label className="slider-control">
      <span className="slider-label"><span>{label}</span><strong>{value} {unit}</strong></span>
      <input aria-label={label} type="range" min={min} max={max} step={step} value={value}
        style={{ '--range-progress': `${percent}%` } as React.CSSProperties}
        onChange={(event) => onChange(Number(event.target.value))} />
      <span className="range-bounds"><span>{min}</span><span>{max} {unit}</span></span>
    </label>
  )
}

export function MetricCard({ label, value, icon, accent = 'cyan', detail }: {
  label: string; value: string; icon?: ReactNode; accent?: 'cyan' | 'orange' | 'violet' | 'green'; detail?: string
}) {
  return (
    <article className={`metric-card metric-${accent}`}>
      <div className="metric-icon">{icon}</div>
      <div><span>{label}</span><strong>{value}</strong>{detail && <small>{detail}</small>}</div>
    </article>
  )
}

export function FormulaBlock({ formula, children }: { formula: string; children?: ReactNode }) {
  return <div className="formula-block"><code>{formula}</code>{children && <p>{children}</p>}</div>
}

export function PageHeader({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: ReactNode }) {
  return (
    <header className="page-header">
      <div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>
      {children}
    </header>
  )
}

export function Segmented<T extends string>({ value, options, onChange, label }: {
  value: T; options: { value: T; label: string }[]; onChange: (value: T) => void; label: string
}) {
  return <div className="segmented" role="group" aria-label={label}>{options.map((option) =>
    <button key={option.value} className={value === option.value ? 'active' : ''} onClick={() => onChange(option.value)}>{option.label}</button>
  )}</div>
}
