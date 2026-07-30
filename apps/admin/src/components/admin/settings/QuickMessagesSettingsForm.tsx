'use client'

import { type AdminQuickMessages } from '@/apis/admin'
import { useAdminQuickMessages } from '@/hooks/queries/admin'
import { useUpdateAdminQuickMessages } from '@/hooks/mutations/admin'
import {
    Button,
    Card,
    CardContent,
    Input,
    Label,
    Textarea,
} from '@doska/ui'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

// Плоская строка редактора: сервис + роль + фразы (по одной на строку).
// Вложенную карту service->role->[phrases] разворачиваем в такие строки и
// собираем обратно на сохранении.
type Row = { service: string; role: string; phrases: string }

function toRows(data: AdminQuickMessages): Row[] {
    const rows: Row[] = []
    for (const [service, roles] of Object.entries(data)) {
        for (const [role, phrases] of Object.entries(roles)) {
            rows.push({ service, role, phrases: phrases.join('\n') })
        }
    }
    return rows
}

function toMap(rows: Row[]): AdminQuickMessages {
    const map: AdminQuickMessages = {}
    for (const r of rows) {
        const service = r.service.trim()
        const role = r.role.trim()
        if (!service || !role) continue
        const phrases = r.phrases
            .split('\n')
            .map((p) => p.trim())
            .filter(Boolean)
        if (!map[service]) map[service] = {}
        map[service][role] = phrases
    }
    return map
}

export function QuickMessagesSettingsForm() {
    const { data, isLoading } = useAdminQuickMessages()
    const update = useUpdateAdminQuickMessages()
    const [rows, setRows] = useState<Row[]>([])

    useEffect(() => {
        if (data) setRows(toRows(data))
    }, [data])

    const setRow = (i: number, patch: Partial<Row>) =>
        setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
    const removeRow = (i: number) =>
        setRows((prev) => prev.filter((_, idx) => idx !== i))
    const addRow = () =>
        setRows((prev) => [...prev, { service: '', role: '', phrases: '' }])

    const submit = () => update.mutate(toMap(rows))

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                Быстрые сообщения (чипы над полем ввода в чате). Набор зависит от{' '}
                <b>сервиса</b> и <b>роли</b>. Роли: rideshare/freight —{' '}
                <code className="text-xs">driver</code>/
                <code className="text-xs">passenger</code>, auto —{' '}
                <code className="text-xs">seller</code>/
                <code className="text-xs">buyer</code>; фолбэк —{' '}
                <code className="text-xs">default</code>. Одна фраза на строку.
                Хранится в Redis <code className="text-xs">app:quick_messages</code>,
                отдаётся клиенту в <code className="text-xs">/app/config</code>.
            </p>

            <div className="space-y-3">
                {rows.map((row, i) => (
                    <Card key={i}>
                        <CardContent className="pt-4 space-y-3">
                            <div className="flex gap-3 items-end">
                                <div className="flex-1">
                                    <Label>Сервис</Label>
                                    <Input
                                        value={row.service}
                                        onChange={(e) =>
                                            setRow(i, { service: e.target.value })
                                        }
                                        placeholder="rideshare / auto / default"
                                    />
                                </div>
                                <div className="flex-1">
                                    <Label>Роль</Label>
                                    <Input
                                        value={row.role}
                                        onChange={(e) =>
                                            setRow(i, { role: e.target.value })
                                        }
                                        placeholder="driver / passenger / default"
                                    />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeRow(i)}
                                    aria-label="Удалить"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <div>
                                <Label>Фразы (по одной на строку)</Label>
                                <Textarea
                                    value={row.phrases}
                                    onChange={(e) =>
                                        setRow(i, { phrases: e.target.value })
                                    }
                                    rows={4}
                                    placeholder={'Выезжаю\nЯ на месте\nЗадержусь на 5 минут'}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex justify-between">
                <Button variant="outline" onClick={addRow}>
                    <Plus className="h-4 w-4 mr-1" /> Добавить строку
                </Button>
                <Button onClick={submit} disabled={isLoading || update.isPending}>
                    {update.isPending ? 'Сохранение…' : 'Сохранить'}
                </Button>
            </div>
        </div>
    )
}
