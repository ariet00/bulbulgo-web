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
import { AdminTglabUser } from '@/apis/admin'
import {
    useAdminCreateTglabUser,
    useAdminUpdateTglabUser,
} from '@/hooks/mutations/admin'
import { useAdminTglabRoles } from '@/hooks/queries/admin'

// Дефолты берём такие же, как в apps/tglab/constants.py.
const DEFAULT_MAX_ACCOUNTS = 10
const DEFAULT_MAX_RUNNING_TASKS = 3

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    /** Задан — редактирование, пусто — создание. */
    user?: AdminTglabUser | null
}

export function TglabUserDialog({ open, onOpenChange, user }: Props) {
    const roles = useAdminTglabRoles()
    const create = useAdminCreateTglabUser()
    const update = useAdminUpdateTglabUser()
    const isEdit = Boolean(user)

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')
    const [name, setName] = useState('')
    const [surname, setSurname] = useState('')
    const [roleSlug, setRoleSlug] = useState('')
    const [maxAccounts, setMaxAccounts] = useState(DEFAULT_MAX_ACCOUNTS)
    const [maxRunningTasks, setMaxRunningTasks] = useState(DEFAULT_MAX_RUNNING_TASKS)

    useEffect(() => {
        if (!open) return
        setUsername(user?.username ?? '')
        setPassword('')
        setEmail(user?.email ?? '')
        setName('')
        setSurname('')
        setRoleSlug(user?.role_slug ?? roles.data?.[0]?.slug ?? '')
        setMaxAccounts(user?.max_accounts ?? DEFAULT_MAX_ACCOUNTS)
        setMaxRunningTasks(user?.max_running_tasks ?? DEFAULT_MAX_RUNNING_TASKS)
    }, [open, user, roles.data])

    const canSubmit = isEdit
        ? Boolean(roleSlug)
        : username.trim().length >= 3 && password.length >= 6 && Boolean(roleSlug)

    const submit = () => {
        const done = { onSuccess: () => onOpenChange(false) }
        const common = {
            email: email || null,
            role_slug: roleSlug,
            max_accounts: maxAccounts,
            max_running_tasks: maxRunningTasks,
        }
        if (user) {
            update.mutate(
                {
                    id: user.id,
                    ...common,
                    // Пустой пароль в форме = «не менять».
                    ...(password ? { password } : {}),
                    ...(name ? { name } : {}),
                    ...(surname ? { surname } : {}),
                },
                done,
            )
        } else {
            create.mutate(
                {
                    username: username.trim(),
                    password,
                    name: name || null,
                    surname: surname || null,
                    ...common,
                },
                done,
            )
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Оператор' : 'Новый оператор'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Логин</Label>
                        <Input
                            id="username"
                            value={username}
                            disabled={isEdit}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">
                            {isEdit ? 'Новый пароль (пусто — не менять)' : 'Пароль'}
                        </Label>
                        <Input
                            id="password"
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="name">Имя</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="surname">Фамилия</Label>
                            <Input
                                id="surname"
                                value={surname}
                                onChange={(e) => setSurname(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Почта</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Роль</Label>
                        <Select value={roleSlug} onValueChange={setRoleSlug}>
                            <SelectTrigger>
                                <SelectValue placeholder="Выберите роль" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.data?.map((role) => (
                                    <SelectItem key={role.slug} value={role.slug}>
                                        {role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label htmlFor="max-accounts">Лимит аккаунтов</Label>
                            <Input
                                id="max-accounts"
                                type="number"
                                min={0}
                                value={maxAccounts}
                                onChange={(e) => setMaxAccounts(Number(e.target.value))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="max-tasks">Активных задач</Label>
                            <Input
                                id="max-tasks"
                                type="number"
                                min={0}
                                value={maxRunningTasks}
                                onChange={(e) => setMaxRunningTasks(Number(e.target.value))}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Отмена
                    </Button>
                    <Button
                        onClick={submit}
                        disabled={!canSubmit || create.isPending || update.isPending}
                    >
                        {isEdit ? 'Сохранить' : 'Создать'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
