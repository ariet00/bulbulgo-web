'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@doska/ui'
import { cn } from '@doska/shared'

import { NONE_VALUE } from '@/components/common/ProjectSelect'
import { useMeta, useProxies } from '@/hooks/queries'

/** Fallback ceiling until `/meta` loads its authoritative value. */
const FALLBACK_CAP = 5

/** Proxy picker used everywhere an account is attached to a proxy. Each option
 *  carries its current load («· N акк»), coloured from the soft cap up, so at
 *  the moment of attaching you see which IPs are already crowded. */
export function ProxySelect({
  value,
  onChange,
  placeholder = 'Без прокси',
  className,
}: {
  value: number | null
  onChange: (value: number | null) => void
  placeholder?: string
  className?: string
}) {
  const { data: proxies } = useProxies()
  const { data: meta } = useMeta()
  const cap = meta?.proxy_soft_account_cap ?? FALLBACK_CAP

  return (
    <Select
      value={value ? String(value) : NONE_VALUE}
      onValueChange={(next) => onChange(next === NONE_VALUE ? null : Number(next))}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE_VALUE}>{placeholder}</SelectItem>
        {proxies?.map((proxy) => {
          const overloaded = proxy.accounts_count >= cap
          return (
            <SelectItem key={proxy.id} value={String(proxy.id)}>
              <span className="flex items-center gap-2">
                <span>{proxy.name || `${proxy.host}:${proxy.port}`}</span>
                <span
                  className={cn(
                    'text-xs',
                    overloaded
                      ? 'font-medium text-amber-600 dark:text-amber-400'
                      : 'text-muted-foreground',
                  )}
                >
                  · {proxy.accounts_count} акк
                </span>
              </span>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
