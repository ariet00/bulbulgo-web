'use client'

import { Suspense } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@doska/ui'
import { useFilterParams } from '@/hooks/useFilterParams'
import { AppVersionSettingsForm } from '@/components/admin/settings/AppVersionSettingsForm'
import { FeatureFlagsSettingsForm } from '@/components/admin/settings/FeatureFlagsSettingsForm'
import { ContactLimitsSettingsForm } from '@/components/admin/settings/ContactLimitsSettingsForm'
import { SubscriptionSettingsForm } from '@/components/admin/settings/SubscriptionSettingsForm'

const TABS = [
    { value: 'app', label: 'Версии приложения', Form: AppVersionSettingsForm },
    { value: 'features', label: 'Фичи', Form: FeatureFlagsSettingsForm },
    { value: 'contact-limits', label: 'Лимиты номеров', Form: ContactLimitsSettingsForm },
    { value: 'subscriptions', label: 'Подписки', Form: SubscriptionSettingsForm },
] as const

const FILTER_DEFAULTS = { tab: 'app' }

function SettingsTabs() {
    const { values, setValues } = useFilterParams(FILTER_DEFAULTS)
    const active = TABS.some((t) => t.value === values.tab) ? values.tab : 'app'

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-2xl font-semibold">Настройки BulBul Go</h1>

            <Tabs value={active} onValueChange={(v) => setValues({ tab: v })}>
                <TabsList className="flex flex-wrap h-auto">
                    {TABS.map((t) => (
                        <TabsTrigger key={t.value} value={t.value}>
                            {t.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {TABS.map(({ value, Form }) => (
                    <TabsContent key={value} value={value} className="max-w-2xl pt-2">
                        <Form />
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}

export default function AdminSettingsPage() {
    // useFilterParams relies on useSearchParams → needs a Suspense boundary.
    return (
        <Suspense fallback={null}>
            <SettingsTabs />
        </Suspense>
    )
}
