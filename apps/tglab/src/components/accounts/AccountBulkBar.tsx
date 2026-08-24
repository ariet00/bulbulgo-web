'use client'

import {
  Button,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@doska/ui'
import { Pause, Play, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { NONE_VALUE, ProjectSelect } from '@/components/common/ProjectSelect'
import { useBulkUpdateAccounts, useDeleteAccounts } from '@/hooks/mutations'
import { useMeta, useProxies } from '@/hooks/queries'

/** Default pause offered by the «Отлёжка» button, in hours. */
const DEFAULT_FREEZE_HOURS = 24

interface Props {
  ids: number[]
  onDone: () => void
}

/** Mass actions of the accounts table — visible only while rows are selected. */
export function AccountBulkBar({ ids, onDone }: Props) {
  const { data: proxies } = useProxies()
  const { data: meta } = useMeta()
  const bulk = useBulkUpdateAccounts()
  const remove = useDeleteAccounts()
  const [limits, setLimits] = useState<Record<string, string>>({})

  const apply = (payload: Parameters<typeof bulk.mutate>[0]) =>
    bulk.mutate(payload, { onSuccess: onDone })

  const applyLimits = () => {
    const parsed = Object.entries(limits).reduce<Record<string, number>>(
      (acc, [key, value]) => {
        if (value !== '') acc[key] = Number(value)
        return acc
      },
      {},
    )
    if (Object.keys(parsed).length) apply({ ids, limits: parsed })
  }

  const onDelete = () => {
    if (confirm(`Удалить аккаунтов: ${ids.length}? Их история действий тоже уйдёт.`)) {
      remove.mutate(ids, { onSuccess: onDone })
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-background p-3">
      <span className="text-sm font-medium">Выбрано: {ids.length}</span>

      <ProjectSelect
        value={null}
        placeholder="В проект"
        className="w-44"
        onChange={(projectId) => apply({ ids, project_id: projectId })}
      />

      <Select
        onValueChange={(value) =>
          apply({ ids, proxy_id: value === NONE_VALUE ? null : Number(value) })
        }
      >
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Назначить прокси" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE_VALUE}>Снять прокси</SelectItem>
          {proxies?.map((proxy) => (
            <SelectItem key={proxy.id} value={String(proxy.id)}>
              {proxy.name || `${proxy.host}:${proxy.port}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            Лимиты
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 space-y-3">
          {(meta?.account_limit_keys ?? []).map((key) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <Label htmlFor={`limit-${key}`} className="text-xs">
                {key}
              </Label>
              <Input
                id={`limit-${key}`}
                className="h-8 w-20"
                inputMode="numeric"
                placeholder={String(meta?.default_account_limits?.[key] ?? '')}
                value={limits[key] ?? ''}
                onChange={(e) =>
                  setLimits((prev) => ({
                    ...prev,
                    [key]: e.target.value.replace(/\D/g, ''),
                  }))
                }
              />
            </div>
          ))}
          <Button size="sm" className="w-full" onClick={applyLimits}>
            Применить
          </Button>
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="sm"
        onClick={() => apply({ ids, freeze_hours: DEFAULT_FREEZE_HOURS })}
      >
        <Pause className="mr-1 h-4 w-4" />
        Отлёжка 24 ч
      </Button>
      <Button variant="outline" size="sm" onClick={() => apply({ ids, freeze_hours: 0 })}>
        <Play className="mr-1 h-4 w-4" />
        Снять
      </Button>

      <Button variant="ghost" size="sm" onClick={onDelete}>
        <Trash2 className="mr-1 h-4 w-4 text-destructive" />
        Удалить
      </Button>
    </div>
  )
}
