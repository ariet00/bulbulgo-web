'use client'

import { useState } from 'react'

import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@doska/ui'
import { useDebounce, useThreadsLocationSearch, type ThreadsLocation } from '@doska/shared'
import { Loader2, MapPin, X } from 'lucide-react'

const MIN_QUERY = 2

export function describeLocation(loc: Pick<ThreadsLocation, 'name' | 'city' | 'country'>): string {
  const place = [loc.city, loc.country].filter(Boolean).join(', ')
  return place ? `${loc.name}, ${place}` : loc.name
}

/** Search-as-you-type over Threads places; the chosen one is sent as `location_id`. */
export function LocationPicker({
  accountId,
  value,
  onChange,
  disabled,
}: {
  accountId: number
  value: ThreadsLocation | null
  onChange: (loc: ThreadsLocation | null) => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const q = useDebounce(query, 400)
  const { data, isFetching, isError } = useThreadsLocationSearch(open ? accountId : null, q)
  const results = data?.data || []
  const tooShort = q.trim().length < MIN_QUERY

  if (value) {
    return (
      <div className="flex items-center gap-1">
        <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full border bg-secondary px-3 py-1 text-sm">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-brand" aria-hidden />
          <span className="truncate">{describeLocation(value)}</span>
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          aria-label="Убрать место"
          onClick={() => onChange(null)}
          disabled={disabled}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm" disabled={disabled}>
          <MapPin className="mr-2 h-4 w-4" />
          Добавить место
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Город, кафе, площадь…" value={query} onValueChange={setQuery} />
          <CommandList>
            {tooShort ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">Введите хотя бы две буквы</p>
            ) : isFetching ? (
              <p className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Ищем место
              </p>
            ) : isError ? (
              <p className="px-3 py-2 text-sm text-destructive">Threads не ответил, попробуйте ещё раз</p>
            ) : results.length === 0 ? (
              <CommandEmpty>Ничего не нашли</CommandEmpty>
            ) : (
              <CommandGroup>
                {results.map((loc) => (
                  <CommandItem
                    key={loc.id}
                    value={loc.id}
                    onSelect={() => {
                      onChange(loc)
                      setOpen(false)
                      setQuery('')
                    }}
                  >
                    <MapPin className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                    <span className="min-w-0">
                      <span className="block truncate">{loc.name}</span>
                      {(loc.address || loc.city) && (
                        <span className="block truncate text-xs text-muted-foreground">
                          {[loc.address, loc.city].filter(Boolean).join(', ')}
                        </span>
                      )}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
