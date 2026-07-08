'use client'

import { useAdminUserPreBlockWarning } from '@/hooks/queries/admin'
import { useUpdateAdminUserPreBlockWarning } from '@/hooks/mutations/admin'
import {
    Button,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Switch,
    Textarea,
} from '@doska/ui'
import { useEffect, useState } from 'react'

// Готовые формулировки предупреждения. Выбор из списка подставляет текст в поле —
// его можно отредактировать перед сохранением.
const PRESETS: { label: string; text: string }[] = [
    {
        label: 'Нарушение правил',
        text: 'Мы зафиксировали нарушения правил сервиса. Пожалуйста, ознакомьтесь с правилами — при повторных нарушениях аккаунт будет заблокирован.',
    },
    {
        label: 'Жалобы на объявления',
        text: 'На ваши объявления поступают жалобы. Проверьте корректность публикаций, иначе доступ к аккаунту будет ограничен.',
    },
    {
        label: 'Спам / накрутка',
        text: 'Замечена подозрительная активность (спам или накрутка). Прекратите подобные действия, чтобы избежать блокировки.',
    },
    {
        label: 'Недостоверные данные',
        text: 'Вы указываете недостоверные данные в поездках. Исправьте информацию, чтобы избежать блокировки аккаунта.',
    },
    {
        label: 'Итоговое предупреждение',
        text: 'Итоговое предупреждение: следующее нарушение правил приведёт к блокировке аккаунта.',
    },
]

export function UserPreBlockWarningForm({ userId }: { userId: number }) {
    const { data, isLoading } = useAdminUserPreBlockWarning(userId)
    const update = useUpdateAdminUserPreBlockWarning()

    const [enabled, setEnabled] = useState(false)
    const [message, setMessage] = useState('')
    const [rulesUrl, setRulesUrl] = useState('')

    useEffect(() => {
        if (!data) return
        setEnabled(data.enabled)
        setMessage(data.message ?? '')
        setRulesUrl(data.rules_url ?? '')
    }, [data])

    const submit = () =>
        update.mutate({
            id: userId,
            enabled,
            message: message.trim() || null,
            rules_url: rulesUrl.trim() || null,
        })

    if (isLoading) {
        return <p className="text-sm text-muted-foreground">Загрузка…</p>
    }

    return (
        <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
                Мягкое предупреждение показывается пользователю в приложении на
                отдельном экране (можно закрыть и продолжить пользоваться). Не
                блокирует аккаунт — снимите флаг, когда предупреждение больше не
                нужно.
            </p>

            <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                <div className="space-y-0.5">
                    <Label className="cursor-pointer">Показывать предупреждение</Label>
                    <p className="text-xs text-muted-foreground">
                        <code>pre_block_warning</code>
                    </p>
                </div>
                <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>

            <div className="space-y-1">
                <Label>Готовые формулировки</Label>
                <Select
                    onValueChange={(v) => {
                        const preset = PRESETS.find((p) => p.label === v)
                        if (preset) setMessage(preset.text)
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Выбрать из списка…" />
                    </SelectTrigger>
                    <SelectContent>
                        {PRESETS.map((p) => (
                            <SelectItem key={p.label} value={p.label}>
                                {p.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1">
                <Label>Текст предупреждения</Label>
                <Textarea
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Текст, который увидит пользователь…"
                />
                <p className="text-[10px] text-muted-foreground">
                    <code>pre_block_message</code>. Если пусто — покажется текст по
                    умолчанию.
                </p>
            </div>

            <div className="space-y-1">
                <Label>Ссылка на правила (необязательно)</Label>
                <Input
                    type="url"
                    value={rulesUrl}
                    onChange={(e) => setRulesUrl(e.target.value)}
                    placeholder="https://…"
                />
                <p className="text-[10px] text-muted-foreground">
                    <code>pre_block_rules_url</code>. Если пусто — кнопка «Правила»
                    в приложении скрыта.
                </p>
            </div>

            <div className="flex justify-end">
                <Button onClick={submit} disabled={isLoading || update.isPending}>
                    {update.isPending ? 'Сохранение…' : 'Сохранить'}
                </Button>
            </div>
        </div>
    )
}
