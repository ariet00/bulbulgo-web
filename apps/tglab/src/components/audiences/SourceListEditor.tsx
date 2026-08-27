'use client'

import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@doska/ui'
import { Plus, X } from 'lucide-react'

import { useMeta } from '@/hooks/queries'
import type { AudienceSourceInput } from '@/types'

/** Edit the list of groups a base collects from — one row per group, each with
 *  its own mode (supergroup → members, channel → writers/comments). Shared by
 *  the collect dialog and the base card. */
export function SourceListEditor({
  value,
  onChange,
}: {
  value: AudienceSourceInput[]
  onChange: (next: AudienceSourceInput[]) => void
}) {
  const { data: meta } = useMeta()
  const modes = meta?.parse_modes ?? []

  const update = (index: number, patch: Partial<AudienceSourceInput>) =>
    onChange(value.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  const remove = (index: number) => onChange(value.filter((_, i) => i !== index))
  const add = () => onChange([...value, { target: '', mode: 'members' }])

  return (
    <div className="space-y-2">
      {value.map((row, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            className="flex-1"
            placeholder="@chatname или https://t.me/chatname"
            value={row.target}
            onChange={(e) => update(index, { target: e.target.value })}
          />
          <Select value={row.mode} onValueChange={(mode) => update(index, { mode })}>
            <SelectTrigger className="w-44 shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {modes.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            title="Убрать группу"
            disabled={value.length <= 1}
            onClick={() => remove(index)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={add}>
        <Plus className="mr-1 h-4 w-4" />
        Добавить группу
      </Button>
      <p className="text-xs text-muted-foreground">
        Все группы собираются в одну базу и дедуплицируются. У канала нет списка
        участников — его аудиторию видно по комментариям или группе обсуждений.
      </p>
    </div>
  )
}
