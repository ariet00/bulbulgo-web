import { cn } from '@doska/shared'

/** Compact pill switch for a small fixed set of options (search type, persona kind …). */
export function Segmented<T extends string>({
  options,
  labels,
  value,
  onChange,
  label,
}: {
  options: readonly T[]
  labels: Record<T, string>
  value: T
  onChange: (v: T) => void
  label: string
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-md bg-secondary p-0.5">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={o === value}
          onClick={() => onChange(o)}
          className={cn(
            'rounded px-2.5 py-1 text-xs transition-colors',
            o === value ? 'bg-card shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {labels[o]}
        </button>
      ))}
    </div>
  )
}
