'use client'

import { type AdminSupportSettings } from '@/apis/admin'
import { useAdminSupportSettings } from '@/hooks/queries/admin'
import { useUpdateAdminSupportSettings } from '@/hooks/mutations/admin'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Switch,
} from '@doska/ui'
import { useEffect, useState } from 'react'

const DEFAULT_FORM: AdminSupportSettings = {
    in_app_enabled: true,
    tg_enabled: false,
    tg_url: '',
    wa_enabled: false,
    wa_phone: '',
}

export function SupportSettingsForm() {
    const { data, isLoading } = useAdminSupportSettings()
    const update = useUpdateAdminSupportSettings()
    const [form, setForm] = useState<AdminSupportSettings>(DEFAULT_FORM)

    useEffect(() => {
        if (data)
            setForm({
                ...data,
                tg_url: data.tg_url ?? '',
                wa_phone: data.wa_phone ?? '',
            })
    }, [data])

    const set = <K extends keyof AdminSupportSettings>(
        key: K,
        value: AdminSupportSettings[K],
    ) => setForm((prev) => ({ ...prev, [key]: value }))

    const submit = () =>
        update.mutate({
            ...form,
            tg_url: form.tg_url?.trim() || null,
            wa_phone: form.wa_phone?.trim() || null,
        })

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                Каналы связи с поддержкой на экране «Поддержка» в приложении.
                Управляется без релиза (Redis <code className="text-xs">app:support</code>);
                отдаётся клиенту в <code className="text-xs">/me</code> (
                <code className="text-xs">settings.support</code>) и в публичном{' '}
                <code className="text-xs">/app/config</code>.
            </p>

            <Card>
                <CardHeader>
                    <CardTitle>Поддержка</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                        <div className="space-y-0.5">
                            <Label className="cursor-pointer">
                                Чат в приложении
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Кнопка «Написать в приложении» — чат с учёткой
                                «Техподдержка». Ответы пишутся из этой админки.
                            </p>
                        </div>
                        <Switch
                            checked={form.in_app_enabled}
                            onCheckedChange={(v) => set('in_app_enabled', v)}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                        <div className="space-y-0.5">
                            <Label className="cursor-pointer">
                                Telegram-поддержка
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Кнопка «Написать в Telegram». Показывается,
                                только если включена и указана ссылка.
                            </p>
                        </div>
                        <Switch
                            checked={form.tg_enabled}
                            onCheckedChange={(v) => set('tg_enabled', v)}
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <Label>Ссылка на Telegram</Label>
                        <Input
                            value={form.tg_url ?? ''}
                            onChange={(e) => set('tg_url', e.target.value)}
                            placeholder="https://t.me/your_support"
                            disabled={isLoading || !form.tg_enabled}
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                            Пустая ссылка = кнопка Telegram скрыта, даже если
                            переключатель включён.
                        </p>
                    </div>

                    <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                        <div className="space-y-0.5">
                            <Label className="cursor-pointer">
                                WhatsApp-поддержка
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Кнопка «Написать в WhatsApp». Показывается,
                                только если включена и указан номер.
                            </p>
                        </div>
                        <Switch
                            checked={form.wa_enabled}
                            onCheckedChange={(v) => set('wa_enabled', v)}
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <Label>Номер WhatsApp</Label>
                        <Input
                            value={form.wa_phone ?? ''}
                            onChange={(e) => set('wa_phone', e.target.value)}
                            placeholder="+996700123456"
                            disabled={isLoading || !form.wa_enabled}
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                            Сохраняется в формате E.164 (
                            <code className="text-xs">+996700123456</code>);
                            принимаются KG/KZ/RU/UZ номера в любом виде. Пустой
                            номер = кнопка WhatsApp скрыта.
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            onClick={submit}
                            disabled={isLoading || update.isPending}
                        >
                            {update.isPending ? 'Сохранение…' : 'Сохранить'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
