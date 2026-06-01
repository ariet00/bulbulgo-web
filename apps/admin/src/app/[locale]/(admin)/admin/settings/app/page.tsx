'use client'

import { type AdminAppVersionSettings } from '@/apis/admin'
import { useAdminAppVersionSettings } from '@/hooks/queries/admin'
import { useUpdateAdminAppVersionSettings } from '@/hooks/mutations/admin'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Separator,
    Switch,
} from '@doska/ui'
import { useEffect, useState } from 'react'

const DEFAULT_FORM: AdminAppVersionSettings = {
    set_version_header: false,
    android_min_version: '1.0.0',
    ios_min_version: '1.0.0',
    android_force_update: false,
    ios_force_update: false,
}

export default function AdminAppSettingsPage() {
    const { data, isLoading } = useAdminAppVersionSettings()
    const update = useUpdateAdminAppVersionSettings()
    const [form, setForm] = useState<AdminAppVersionSettings>(DEFAULT_FORM)

    useEffect(() => {
        if (data) setForm(data)
    }, [data])

    const set = <K extends keyof AdminAppVersionSettings>(
        key: K,
        value: AdminAppVersionSettings[K],
    ) => setForm((prev) => ({ ...prev, [key]: value }))

    const submit = () => update.mutate(form)

    return (
        <div className="space-y-6 p-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-semibold">Настройки приложения</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Минимальные версии, force-update и мастер-флаг version-gating
                    middleware. Значения хранятся в Redis под ключами{' '}
                    <code className="text-xs">app:*</code>.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Version gating</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                        <div className="space-y-0.5">
                            <Label className="cursor-pointer">
                                Включить проверку версии
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                <code>app:set_version_header</code>. Когда выключено,
                                middleware на каждый запрос делает 1 GET в Redis и
                                сразу выходит — без сравнения версий.
                            </p>
                        </div>
                        <Switch
                            checked={form.set_version_header}
                            onCheckedChange={(v) => set('set_version_header', v)}
                            disabled={isLoading}
                        />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label>Android — мин. версия</Label>
                            <Input
                                value={form.android_min_version}
                                onChange={(e) =>
                                    set('android_min_version', e.target.value)
                                }
                                placeholder="1.0.0"
                                disabled={isLoading}
                            />
                            <code className="text-[10px] text-muted-foreground">
                                app:android_min_version
                            </code>
                        </div>
                        <div>
                            <Label>iOS — мин. версия</Label>
                            <Input
                                value={form.ios_min_version}
                                onChange={(e) => set('ios_min_version', e.target.value)}
                                placeholder="1.0.0"
                                disabled={isLoading}
                            />
                            <code className="text-[10px] text-muted-foreground">
                                app:ios_min_version
                            </code>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                            <div className="space-y-0.5">
                                <Label className="cursor-pointer">
                                    Android — force update
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Возвращать <code>X-App-ForceUpdate=true</code>{' '}
                                    клиентам ниже минимума.
                                </p>
                            </div>
                            <Switch
                                checked={form.android_force_update}
                                onCheckedChange={(v) =>
                                    set('android_force_update', v)
                                }
                                disabled={isLoading}
                            />
                        </div>
                        <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                            <div className="space-y-0.5">
                                <Label className="cursor-pointer">
                                    iOS — force update
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Возвращать <code>X-App-ForceUpdate=true</code>{' '}
                                    клиентам ниже минимума.
                                </p>
                            </div>
                            <Switch
                                checked={form.ios_force_update}
                                onCheckedChange={(v) => set('ios_force_update', v)}
                                disabled={isLoading}
                            />
                        </div>
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
