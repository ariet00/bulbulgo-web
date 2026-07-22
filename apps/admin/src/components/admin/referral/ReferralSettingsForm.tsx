'use client'

import { type AdminReferralSettings } from '@/apis/admin'
import { useAdminReferralSettings } from '@/hooks/queries/admin'
import { useUpdateAdminReferralSettings } from '@/hooks/mutations/admin'
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

const DEFAULT_FORM: AdminReferralSettings = {
    capture_enabled: false,
    rewards_enabled: false,
    referrer_reward: 0,
    referee_reward: 0,
    per_referrer_cap: 0,
    currency: 'KGS',
}

export function ReferralSettingsForm() {
    const { data, isLoading } = useAdminReferralSettings()
    const update = useUpdateAdminReferralSettings()
    const [form, setForm] = useState<AdminReferralSettings>(DEFAULT_FORM)

    useEffect(() => {
        if (data) setForm(data)
    }, [data])

    const setBool = (
        key: 'capture_enabled' | 'rewards_enabled',
        value: boolean,
    ) => setForm((prev) => ({ ...prev, [key]: value }))

    const setNum = (
        key: 'referrer_reward' | 'referee_reward' | 'per_referrer_cap',
        value: number,
    ) => setForm((prev) => ({ ...prev, [key]: value }))

    const submit = () => update.mutate(form)

    return (
        <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
                Реферальная программа: два независимых переключателя + суммы
                бонусов. Хранятся в Redis под ключом{' '}
                <code className="text-xs">app:referral</code>. Награда
                начисляется на баланс BulBul Go обоим, когда приглашённый{' '}
                <b>подтверждает номер телефона</b>. Приглашать может только
                пользователь с подтверждённым номером.
            </p>

            <Card>
                <CardHeader>
                    <CardTitle>Переключатели</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                        <div className="space-y-0.5">
                            <Label className="cursor-pointer">
                                Приём новых приглашений
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Вкл — выдаём коды и привязываем новых
                                приглашённых. Выкл — «остановить реферал»: новые
                                не привязываются (уже привязанных решает второй
                                флаг).
                            </p>
                        </div>
                        <Switch
                            checked={form.capture_enabled}
                            onCheckedChange={(v) =>
                                setBool('capture_enabled', v)
                            }
                            disabled={isLoading}
                        />
                    </div>
                    <div className="flex items-start justify-between gap-3 rounded border px-3 py-2">
                        <div className="space-y-0.5">
                            <Label className="cursor-pointer">
                                Начисление наград
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Вкл — уже привязанные (pending) рефералы
                                оплачиваются при подтверждении номера. Выкл —
                                выплаты приостановлены.
                            </p>
                        </div>
                        <Switch
                            checked={form.rewards_enabled}
                            onCheckedChange={(v) =>
                                setBool('rewards_enabled', v)
                            }
                            disabled={isLoading}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Награды и лимиты</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Бонус пригласившему</Label>
                            <Input
                                type="number"
                                step={0.01}
                                value={form.referrer_reward}
                                onChange={(e) =>
                                    setNum(
                                        'referrer_reward',
                                        parseFloat(e.target.value) || 0,
                                    )
                                }
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Бонус приглашённому</Label>
                            <Input
                                type="number"
                                step={0.01}
                                value={form.referee_reward}
                                onChange={(e) =>
                                    setNum(
                                        'referee_reward',
                                        parseFloat(e.target.value) || 0,
                                    )
                                }
                                disabled={isLoading}
                            />
                            <p className="text-[10px] text-muted-foreground">
                                Начисляется тому, кто зарегистрировался по коду.
                                0 — без бонуса.
                            </p>
                        </div>
                        <div className="space-y-1">
                            <Label>Лимит на пригласившего</Label>
                            <Input
                                type="number"
                                value={form.per_referrer_cap}
                                onChange={(e) =>
                                    setNum(
                                        'per_referrer_cap',
                                        parseInt(e.target.value) || 0,
                                    )
                                }
                                disabled={isLoading}
                            />
                            <p className="text-[10px] text-muted-foreground">
                                Максимум оплаченных рефералов на одного
                                пользователя. 0 — без лимита.
                            </p>
                        </div>
                        <div className="space-y-1">
                            <Label>Валюта</Label>
                            <Input
                                value={form.currency}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        currency: e.target.value.toUpperCase(),
                                    }))
                                }
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <Separator />

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
