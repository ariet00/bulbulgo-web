'use client'

import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@doska/ui'
import { Plus, ShieldOff } from 'lucide-react'
import { useState } from 'react'
import { AdminTglabUser } from '@/apis/admin'
import { TglabUserDialog } from '@/components/admin/tglab/TglabUserDialog'
import { useAdminRevokeTglabAccess } from '@/hooks/mutations/admin'
import { useAdminTglabUsers } from '@/hooks/queries/admin'

export default function TglabOperatorsPage() {
    const [q, setQ] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState<AdminTglabUser | null>(null)
    const { data, isLoading } = useAdminTglabUsers(1, 50, q || undefined)
    const revoke = useAdminRevokeTglabAccess()

    const openCreate = () => {
        setEditing(null)
        setDialogOpen(true)
    }
    const openEdit = (user: AdminTglabUser) => {
        setEditing(user)
        setDialogOpen(true)
    }
    const onRevoke = (user: AdminTglabUser) => {
        if (confirm(`Снять доступ к Tglab у «${user.username}»? Данные останутся.`)) {
            revoke.mutate(user.id)
        }
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-2xl font-semibold">Tglab — операторы</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Учётки внутреннего кабинета продвижения. Саморегистрации нет:
                        логин, пароль и лимиты выдаются здесь.
                    </p>
                </div>
                <Button onClick={openCreate}>
                    <Plus className="mr-1 h-4 w-4" />
                    Новый оператор
                </Button>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-3">
                    <CardTitle>Операторы {data ? `(${data.total})` : ''}</CardTitle>
                    <Input
                        placeholder="Поиск по логину, почте, имени"
                        className="max-w-xs"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div>Загрузка…</div>
                    ) : !data || data.items.length === 0 ? (
                        <div className="text-muted-foreground">
                            Операторов нет — создайте первого.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-16">ID</TableHead>
                                    <TableHead>Логин</TableHead>
                                    <TableHead>Имя</TableHead>
                                    <TableHead>Роль</TableHead>
                                    <TableHead className="w-32 text-right">Аккаунтов</TableHead>
                                    <TableHead className="w-32 text-right">Задач</TableHead>
                                    <TableHead className="w-40 text-right">Действия</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.items.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.id}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{user.username}</div>
                                            {user.email && (
                                                <div className="text-xs text-muted-foreground">
                                                    {user.email}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>{user.full_name || '—'}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {user.role_slug ?? '—'}
                                            </Badge>
                                            {user.status !== 'active' && (
                                                <Badge variant="destructive" className="ml-2">
                                                    {user.status}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {user.max_accounts}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {user.max_running_tasks}
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openEdit(user)}
                                            >
                                                Изменить
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                title="Снять доступ"
                                                onClick={() => onRevoke(user)}
                                            >
                                                <ShieldOff className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <TglabUserDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                user={editing}
            />
        </div>
    )
}
