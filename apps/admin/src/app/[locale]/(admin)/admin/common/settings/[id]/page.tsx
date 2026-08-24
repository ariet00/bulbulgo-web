'use client'

import { useSettingsRegistryItem, useUpdateSetting } from '@doska/shared'
import { Button } from '@doska/ui'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import {
    emptySetting,
    SettingForm,
    SettingFormActions,
    settingFromRow,
    validateSetting,
} from '@/components/admin/settings-registry/SettingForm'

export default function EditSettingPage() {
    const router = useRouter()
    const params = useParams<{ id: string }>()
    const settingId = Number(params.id)

    const { data: row, isLoading } = useSettingsRegistryItem(settingId)
    const update = useUpdateSetting()

    const [state, setState] = useState(emptySetting)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (row) setState(settingFromRow(row))
    }, [row])

    if (isLoading || !row) return <div>Loading…</div>

    const save = async () => {
        const v = validateSetting(state)
        if (!v.ok) {
            setError(v.error)
            return
        }
        await update.mutateAsync({ id: settingId, body: v.body })
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
                <Link href="/admin/common/settings">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="size-4 mr-1" /> К списку
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">
                    <span className="font-mono text-base text-muted-foreground">
                        {row.group}
                    </span>{' '}
                    /{' '}
                    <span className="font-mono">{row.key}</span>
                </h1>
            </div>

            <SettingForm
                value={state}
                onChange={setState}
                error={error}
                onClearError={() => setError(null)}
            />

            <SettingFormActions
                onSave={save}
                onCancel={() => router.push('/admin/common/settings')}
                saveLabel="Сохранить"
                saving={update.isPending}
            />
        </div>
    )
}
