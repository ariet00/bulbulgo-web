'use client'

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@doska/ui'
import { useEffect, useState } from 'react'

import { ProjectSelect } from '@/components/common/ProjectSelect'
import { useCreateAudience } from '@/hooks/mutations'
import { useMeta } from '@/hooks/queries'

/** An empty base to fill by hand — collection has its own dialog. */
export function AudienceCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { data: meta } = useMeta()
  const create = useCreateAudience()

  const [name, setName] = useState('')
  const [kind, setKind] = useState('users')
  const [projectId, setProjectId] = useState<number | null>(null)

  useEffect(() => {
    if (open) return
    setName('')
    setKind('users')
    setProjectId(null)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Своя база</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="audience-name">Название</Label>
            <Input
              id="audience-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Тип</Label>
            <Select value={kind} onValueChange={setKind}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(meta?.audience_kinds ?? []).map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Проект</Label>
            <ProjectSelect value={projectId} onChange={setProjectId} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button
            disabled={!name.trim() || create.isPending}
            onClick={() =>
              create.mutate(
                { name: name.trim(), kind, project_id: projectId },
                { onSuccess: () => onOpenChange(false) },
              )
            }
          >
            Создать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
