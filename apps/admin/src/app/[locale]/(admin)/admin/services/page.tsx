'use client'

import { useState, type MouseEvent } from 'react'
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { Check, Globe, Plus, Smartphone, Trash2 } from 'lucide-react'
import type { AdminService } from '@/apis/admin'
import { ServiceDialog } from '@/components/admin/services/ServiceDialog'
import {
    useAdminDeleteService,
    useAdminUpdateService,
} from '@/hooks/mutations/admin'
import { useAdminServices } from '@/hooks/queries/admin'

export default function AdminServicesPage() {
    const { data, isLoading } = useAdminServices()
    const updateMutation = useAdminUpdateService()
    const deleteMutation = useAdminDeleteService()

    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState<AdminService | null>(null)

    const openCreate = () => {
        setEditing(null)
        setDialogOpen(true)
    }
    const openEdit = (s: AdminService) => {
        setEditing(s)
        setDialogOpen(true)
    }

    const handleDelete = (e: MouseEvent, s: AdminService) => {
        e.stopPropagation()
        if (s.type === 'native') {
            alert(
                'Нативный сервис зашит в приложение — вместо удаления выключите его.',
            )
            return
        }
        if (confirm(`Удалить сервис «${s.label?.ru ?? s.slug}»?`)) {
            deleteMutation.mutate(s.id)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">Сервисы приложения</h1>
                <Button size="sm" onClick={openCreate}>
                    <Plus className="size-4 mr-1" /> Создать
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Карточки на «Главной» и табы</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoading ? (
                        <div>Загрузка…</div>
                    ) : (
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Позиция</TableHead>
                                        <TableHead>Название</TableHead>
                                        <TableHead>Slug</TableHead>
                                        <TableHead>Тип</TableHead>
                                        <TableHead>Бейдж</TableHead>
                                        <TableHead>В табах</TableHead>
                                        <TableHead>Включён</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data?.map((s) => (
                                        <TableRow
                                            key={s.id}
                                            className="cursor-pointer"
                                            onClick={() => openEdit(s)}
                                        >
                                            <TableCell>{s.position}</TableCell>
                                            <TableCell className="font-medium">
                                                {s.label?.ru ||
                                                    Object.values(s.label ?? {})[0] ||
                                                    '—'}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {s.slug}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    {s.type === 'native' ? (
                                                        <>
                                                            <Smartphone className="size-3 mr-1" />
                                                            нативный
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Globe className="size-3 mr-1" />
                                                            webview
                                                        </>
                                                    )}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {s.badge === 'new' && <Badge>NEW</Badge>}
                                                {s.badge === 'soon' && (
                                                    <Badge variant="outline">СКОРО</Badge>
                                                )}
                                                {!s.badge && (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {s.show_in_tabs ? (
                                                    <Check className="size-4 text-green-600" />
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        только главная
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <Switch
                                                    checked={s.enabled}
                                                    onCheckedChange={(checked) =>
                                                        updateMutation.mutate({
                                                            id: s.id,
                                                            body: { enabled: checked },
                                                        })
                                                    }
                                                    disabled={updateMutation.isPending}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={(e) => handleDelete(e, s)}
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {data && data.length === 0 && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={8}
                                                className="text-center text-muted-foreground py-8"
                                            >
                                                Сервисов пока нет
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <ServiceDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                service={editing}
            />
        </div>
    )
}
