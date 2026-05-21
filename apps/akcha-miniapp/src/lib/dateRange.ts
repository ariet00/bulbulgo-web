export type RangePreset = 'today' | 'd7' | 'd30' | 'd90' | 'custom'

export interface DateRange {
  preset: RangePreset
  from?: string // ISO date 'YYYY-MM-DD' (custom only)
  to?: string // ISO date 'YYYY-MM-DD' (custom only)
}

export const RANGE_PRESETS: { key: RangePreset; labelKey: string }[] = [
  { key: 'today', labelKey: 'today' },
  { key: 'd7', labelKey: 'd7' },
  { key: 'd30', labelKey: 'd30' },
  { key: 'd90', labelKey: 'd90' },
  { key: 'custom', labelKey: 'custom' },
]

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function daysAgo(n: number): Date {
  const d = startOfToday()
  d.setDate(d.getDate() - n)
  return d
}

/**
 * Resolve a range selection to ISO timestamps for the API (`from`/`to`).
 * Rolling semantics: today = since 00:00; dN = last N days; custom = the two
 * date inputs (to = end of that day).
 */
export function resolveRange(range: DateRange): { from?: string; to?: string } {
  switch (range.preset) {
    case 'today':
      return { from: startOfToday().toISOString() }
    case 'd7':
      return { from: daysAgo(7).toISOString() }
    case 'd30':
      return { from: daysAgo(30).toISOString() }
    case 'd90':
      return { from: daysAgo(90).toISOString() }
    case 'custom': {
      const out: { from?: string; to?: string } = {}
      if (range.from) {
        const f = new Date(range.from)
        f.setHours(0, 0, 0, 0)
        out.from = f.toISOString()
      }
      if (range.to) {
        const t = new Date(range.to)
        t.setHours(23, 59, 59, 999)
        out.to = t.toISOString()
      }
      return out
    }
  }
}
