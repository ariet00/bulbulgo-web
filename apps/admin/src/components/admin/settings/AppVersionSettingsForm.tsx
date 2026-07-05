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
    android_recommended_version: '1.0.0',
    ios_recommended_version: '1.0.0',
    android_force_update: false,
    ios_force_update: false,
}

export function AppVersionSettingsForm() {
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
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                Версии принудительного и рекомендуемого обновления + мастер-флаг
                version-gating middleware. Клиент ниже принудительной версии
                получает неубираемый экран обновления, ниже рекомендуемой —
                пропускаемый. Значения хранятся в Redis под ключами{' '}
                <code className="text-xs">app:*</code>.
            </p>

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
                            <Label>Android — принудительное обновление</Label>
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
                            <Label>iOS — принудительное обновление</Label>
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
                    <p className="text-xs text-muted-foreground">
                        Клиенты ниже этой версии получают{' '}
                        <code>X-App-ForceUpdate=true</code> — экран обновления
                        без кнопки «Пропустить».
                    </p>

                    <Separator />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label>Android — рекомендуемая версия</Label>
                            <Input
                                value={form.android_recommended_version}
                                onChange={(e) =>
                                    set('android_recommended_version', e.target.value)
                                }
                                placeholder="1.0.0"
                                disabled={isLoading}
                            />
                            <code className="text-[10px] text-muted-foreground">
                                app:android_recommended_version
                            </code>
                        </div>
                        <div>
                            <Label>iOS — рекомендуемая версия</Label>
                            <Input
                                value={form.ios_recommended_version}
                                onChange={(e) =>
                                    set('ios_recommended_version', e.target.value)
                                }
                                placeholder="1.0.0"
                                disabled={isLoading}
                            />
                            <code className="text-[10px] text-muted-foreground">
                                app:ios_recommended_version
                            </code>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Клиенты ниже этой версии (но не ниже принудительной)
                        получают пропускаемый экран «Доступно обновление» — не
                        чаще раза в сутки. Равна принудительной — рекомендация
                        отключена.
                    </p>

                    <Separator />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                            <div className="space-y-0.5">
                                <Label className="cursor-pointer">
                                    Android — force update (legacy)
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    <code>app:android_force_update</code>. Старые
                                    клиенты читают флаг из <code>GET /version</code>;
                                    на заголовки не влияет. Удалим в будущем.
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
                                    iOS — force update (legacy)
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    <code>app:ios_force_update</code>. Старые
                                    клиенты читают флаг из <code>GET /version</code>;
                                    на заголовки не влияет. Удалим в будущем.
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
