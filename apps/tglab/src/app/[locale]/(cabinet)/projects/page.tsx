'use client'

import { Button, Card, CardContent, Skeleton } from '@doska/ui'
import { FolderKanban, Plus } from 'lucide-react'
import { useState } from 'react'

import { ProjectCard } from '@/components/projects/ProjectCard'
import { ProjectFormDialog } from '@/components/projects/ProjectFormDialog'
import { useDeleteProject } from '@/hooks/mutations'
import { useProjects } from '@/hooks/queries'
import { TGLAB_PERMISSIONS } from '@/lib/constants'
import { useHasPermission } from '@/store/useAuthStore'
import type { Project } from '@/types'

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects()
  const canManage = useHasPermission(TGLAB_PERMISSIONS.PROJECTS_MANAGE)
  const remove = useDeleteProject()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }
  const openEdit = (project: Project) => {
    setEditing(project)
    setDialogOpen(true)
  }
  const onDelete = (project: Project) => {
    // Deleting the folder only detaches its members (ON DELETE SET NULL).
    if (confirm(`Удалить проект «${project.name}»? Содержимое останется.`)) {
      remove.mutate(project.id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Проекты</h1>
          <p className="text-sm text-muted-foreground">
            Папки для аккаунтов, прокси, баз и задач.
          </p>
        </div>
        {canManage && (
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Новый проект
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : projects?.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              canManage={canManage}
              onEdit={openEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <FolderKanban className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Проектов пока нет. Создайте первый — дальше в него лягут аккаунты и задачи.
            </p>
            {canManage && (
              <Button variant="outline" onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Новый проект
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <ProjectFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={editing}
      />
    </div>
  )
}
