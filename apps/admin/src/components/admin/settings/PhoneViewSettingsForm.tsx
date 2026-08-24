'use client'

import { type AdminPhoneViewSettings } from '@/apis/admin'
import { useAdminPhoneViewSettings } from '@/hooks/queries/admin'
import { useUpdateAdminPhoneViewSettings } from '@/hooks/mutations/admin'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Label,
} from '@doska/ui'
import { useEffect, useState } from 'react'

const DEFAULT_FORM: AdminPhoneViewSettings = {
    window_hours: 48,
}

export function PhoneViewSettingsForm() {
    const { data, isLoading } = useAdminPhoneViewSettings()
    const update = useUpdateAdminPhoneViewSettings()
    const [form, setForm] = useState<AdminPhoneViewSettings>(DEFAULT_FORM)

    useEffect(() => {
        if (data) setForm(data)
    }, [data])

    const submit = () => update.mutate(form)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Просмотры номеров — окно</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-1">
                    <Label>Показывать просмотры за последние, часов</Label>
                    <Input
                        type="number"
                        min={1}
                        max={720}
                        value={form.window_hours}
                        onChange={(e) =>
                            setForm({
                                window_hours: parseInt(e.target.value) || 0,
                            })
                        }
                        disabled={isLoading}
                    />
                    <p className="text-[10px] text-muted-foreground">
                        <code>phone_view_window_hours</code> в{' '}
                        <code>app:settings</code>. Вкладки «Я смотрел» и «Меня
                        смотрели» показывают только просмотры за это окно.
                        По умолчанию 48.
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
    )
}
