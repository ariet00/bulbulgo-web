'use client'

import { useState } from 'react'

import { Input } from '@doska/ui'
import { THREADS_COLLECTOR_MAX_KEYWORDS } from '@doska/shared'
import { X } from 'lucide-react'

/** Chips editor for collector keywords; `#tag` entries become topic-tag searches. */
export function KeywordsInput({
  id,
  value,
  onChange,
}: {
  id?: string
  value: string[]
  onChange: (next: string[]) => void
}) {
  const [draft, setDraft] = useState('')
  const full = value.length >= THREADS_COLLECTOR_MAX_KEYWORDS

  const add = () => {
    const parts = draft
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (parts.length === 0) return
    const next = [...value]
    for (const part of parts) {
      if (!next.some((k) => k.toLowerCase() === part.toLowerCase())) next.push(part)
    }
    onChange(next.slice(0, THREADS_COLLECTOR_MAX_KEYWORDS))
    setDraft('')
  }

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5" aria-label="Ключевые слова">
          {value.map((kw) => (
            <li key={kw} className="inline-flex items-center gap-1 rounded-full border bg-secondary px-2.5 py-0.5 text-sm">
              {kw}
              <button
                type="button"
                aria-label={`Убрать ${kw}`}
                onClick={() => onChange(value.filter((k) => k !== kw))}
                className="rounded-full p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <Input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            add()
          }
        }}
        onBlur={add}
        placeholder={full ? `Не больше ${THREADS_COLLECTOR_MAX_KEYWORDS} слов` : 'кофе, #бишкек — Enter или запятая'}
        disabled={full}
      />
    </div>
  )
}
