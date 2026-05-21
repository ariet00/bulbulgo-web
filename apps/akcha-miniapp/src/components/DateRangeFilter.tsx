'use client'

import { useTranslations } from 'next-intl'

import { RANGE_PRESETS, type DateRange, type RangePreset } from '@/lib/dateRange'

export function DateRangeFilter({
  value,
  onChange,
}: {
  value: DateRange
  onChange: (next: DateRange) => void
}) {
  const t = useTranslations('dateRange')

  const selectPreset = (preset: RangePreset) => {
    if (preset === 'custom') {
      const today = new Date().toISOString().slice(0, 10)
      onChange({ preset, from: value.from ?? today, to: value.to ?? today })
    } else {
      onChange({ preset })
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {RANGE_PRESETS.map(({ key, labelKey }) => (
          <button
            key={key}
            onClick={() => selectPreset(key)}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap border ${
              value.preset === key ? 'bg-primary text-primary-foreground' : 'bg-background'
            }`}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>

      {value.preset === 'custom' && (
        <div className="flex items-center gap-2 text-xs">
          <label className="flex-1">
            <span className="text-muted-foreground">{t('from')}</span>
            <input
              type="date"
              value={value.from ?? ''}
              max={value.to}
              onChange={e => onChange({ ...value, from: e.target.value })}
              className="w-full rounded-lg border bg-background px-2 py-1"
            />
          </label>
          <label className="flex-1">
            <span className="text-muted-foreground">{t('to')}</span>
            <input
              type="date"
              value={value.to ?? ''}
              min={value.from}
              onChange={e => onChange({ ...value, to: e.target.value })}
              className="w-full rounded-lg border bg-background px-2 py-1"
            />
          </label>
        </div>
      )}
    </div>
  )
}
