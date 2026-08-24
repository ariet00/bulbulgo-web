'use client'

import {
  Button,
  Card,
  CardContent,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@doska/ui'
import { Contact, Download, Plus, Radar, Square, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { exportAudience } from '@/apis/audiences'
import { AudienceCollectDialog } from '@/components/audiences/AudienceCollectDialog'
import { AudienceCreateDialog } from '@/components/audiences/AudienceCreateDialog'
import { AudienceSheet } from '@/components/audiences/AudienceSheet'
import { StatusChip } from '@/components/common/StatusChip'
import { useDeleteAudience, useStopCollection } from '@/hooks/mutations'
import { useAudiences, useMeta } from '@/hooks/queries'
import { TGLAB_PERMISSIONS } from '@/lib/constants'
import { labelOf } from '@/lib/labels'
import { useHasPermission } from '@/store/useAuthStore'
import type { Audience } from '@/types'

/** Collection states that are still moving. */
const LIVE = ['scheduled', 'running']

export default function AudiencesPage() {
  const { data: audiences, isLoading } = useAudiences()
  const { data: meta } = useMeta()
  const canManage = useHasPermission(TGLAB_PERMISSIONS.AUDIENCES_MANAGE)
  const remove = useDeleteAudience()
  const stop = useStopCollection()

  const [collectOpen, setCollectOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [opened, setOpened] = useState<Audience | null>(null)

  const openedAudience = opened
    ? audiences?.find((a) => a.id === opened.id) ?? opened
    : null

  const onDelete = (audience: Audience) => {
    if (confirm(`Удалить базу «${audience.name}» со всеми записями?`)) {
      remove.mutate(audience.id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Базы</h1>
          <p className="text-sm text-muted-foreground">
            Кого обрабатывают задачи. База помнит, что с каждой записью уже делали.
          </p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Своя база
            </Button>
            <Button onClick={() => setCollectOpen(true)}>
              <Radar className="mr-2 h-4 w-4" />
              Собрать
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : audiences?.length ? (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>База</TableHead>
                  <TableHead className="w-28">Тип</TableHead>
                  <TableHead className="w-28 text-right">Записей</TableHead>
                  <TableHead className="w-56">Сбор</TableHead>
                  <TableHead className="w-32 text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audiences.map((audience) => {
                  const collect = audience.collect
                  const live = LIVE.includes(collect?.status ?? '')
                  return (
                    <TableRow
                      key={audience.id}
                      className="cursor-pointer"
                      onClick={() => setOpened(audience)}
                    >
                      <TableCell>
                        <div className="font-medium">{audience.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {audience.source?.target
                            ? `${labelOf(meta?.parse_modes, audience.source.type ?? null)} · ${audience.source.target}`
                            : 'загружена вручную'}
                        </div>
                      </TableCell>
                      <TableCell>{labelOf(meta?.audience_kinds, audience.kind)}</TableCell>
                      <TableCell className="text-right">{audience.items_count}</TableCell>
                      <TableCell>
                        {collect?.status ? (
                          <div className="space-y-1">
                            <StatusChip
                              value={collect.status}
                              options={meta?.task_statuses}
                            />
                            {live && (
                              <div className="text-xs text-muted-foreground">
                                собрано {collect.collected}
                              </div>
                            )}
                            {collect.error && (
                              <div className="text-xs text-destructive line-clamp-2">
                                {collect.error}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell
                        className="text-right whitespace-nowrap"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {live && canManage ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Остановить сбор"
                            onClick={() => stop.mutate(audience.id)}
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Выгрузить"
                          onClick={() => exportAudience(audience.id, 'txt')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {canManage && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Удалить"
                            onClick={() => onDelete(audience)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Contact className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Баз пока нет. Соберите аудиторию из группы или залейте свой список.
            </p>
            {canManage && (
              <Button variant="outline" onClick={() => setCollectOpen(true)}>
                <Radar className="mr-2 h-4 w-4" />
                Собрать
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <AudienceCollectDialog open={collectOpen} onOpenChange={setCollectOpen} />
      <AudienceCreateDialog open={createOpen} onOpenChange={setCreateOpen} />
      <AudienceSheet
        audience={openedAudience}
        onOpenChange={(open) => !open && setOpened(null)}
      />
    </div>
  )
}
