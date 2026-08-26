'use client'

import { type MouseEvent } from 'react'
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
import { Link, useRouter } from '@doska/i18n'
import { Check, Globe, LayoutGrid, Plus, Smartphone, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { AdminService } from '@/apis/admin'
import {
    useAdminDeleteService,
    useAdminUpdateService,
} from '@/hooks/mutations/admin'
import { useAdminServices } from '@/hooks/queries/admin'
import { useConfirm } from '@/components/admin/ConfirmProvider'

export default function AdminServicesPage() {
    const { data, isLoading } = useAdminServices()
    const updateMutation = useAdminUpdateService()
    const deleteMutation = useAdminDeleteService()
    const router = useRouter()
    const confirm = useConfirm()

    const handleDelete = async (e: MouseEvent, s: AdminService) => {
        e.stopPropagation()
        if (s.type === 'native') {
            toast.info(
                'Нативный сервис зашит в приложение — вместо удаления выключите его.',
            )
            return
        }
        if (await confirm(`Удалить сервис «${s.label?.ru ?? s.slug}»?`)) {
            deleteMutation.mutate(s.id)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <h1 className="text-2xl font-bold">Сервисы приложения</h1>
                <div className="flex items-center gap-2">
                    <Button asChild size="sm" variant="outline">
                        <Link href="/admin/services/groups">
                            <LayoutGrid className="size-4 mr-1" /> Группы
                        </Link>
                    </Button>
                    <Button asChild size="sm">
                        <Link href="/admin/services/new">
                            <Plus className="size-4 mr-1" /> Создать
                        </Link>
                    </Button>
                </div>
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
                                        <TableHead>Группа</TableHead>
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
                                            onClick={() =>
                                                router.push(`/admin/services/${s.id}`)
                                            }
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
                                            <TableCell className="text-muted-foreground">
                                                {s.group ?? '—'}
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
                                                {s.hidden ? (
                                                    <Badge variant="outline">скрыт</Badge>
                                                ) : s.show_in_tabs ? (
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
        </div>
    )
}
