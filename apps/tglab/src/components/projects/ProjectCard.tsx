'use client'

import { Button, Card, CardContent } from '@doska/ui'
import { Pencil, Trash2 } from 'lucide-react'

import type { Project } from '@/types'

/** Counter → its label, so the card doesn't repeat the strings per line. */
const COUNTERS: [keyof Project, string][] = [
  ['accounts_count', 'аккаунтов'],
  ['proxies_count', 'прокси'],
  ['audiences_count', 'баз'],
  ['tasks_count', 'задач'],
]

interface Props {
  project: Project
  canManage: boolean
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

export function ProjectCard({ project, canManage, onEdit, onDelete }: Props) {
  return (
    <Card className="group">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <span
            className="mt-1 h-3 w-3 shrink-0 rounded-full"
            style={{ backgroundColor: project.color || 'var(--muted-foreground)' }}
          />
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">{project.name}</div>
            {project.note && (
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {project.note}
              </p>
            )}
          </div>
          {canManage && (
            <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon"
                title="Редактировать"
                onClick={() => onEdit(project)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Удалить"
                onClick={() => onDelete(project)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {COUNTERS.map(([key, label]) => (
            <span key={key}>
              {project[key] as number} {label}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
