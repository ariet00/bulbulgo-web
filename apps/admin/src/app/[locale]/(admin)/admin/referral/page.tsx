'use client'

import { Suspense } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@doska/ui'
import { useFilterParams } from '@/hooks/useFilterParams'
import { ReferralSettingsForm } from '@/components/admin/referral/ReferralSettingsForm'
import { ReferralReportTable } from '@/components/admin/referral/ReferralReportTable'

const FILTER_DEFAULTS = { tab: 'settings' }

function ReferralTabs() {
    const { values, setValues } = useFilterParams(FILTER_DEFAULTS)
    const active = values.tab === 'report' ? 'report' : 'settings'

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-2xl font-semibold">Реферальная программа</h1>

            <Tabs value={active} onValueChange={(v) => setValues({ tab: v })}>
                <TabsList>
                    <TabsTrigger value="settings">Настройки</TabsTrigger>
                    <TabsTrigger value="report">Отчёт</TabsTrigger>
                </TabsList>
                <TabsContent value="settings" className="max-w-2xl pt-2">
                    <ReferralSettingsForm />
                </TabsContent>
                <TabsContent value="report" className="pt-2">
                    <ReferralReportTable />
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default function AdminReferralPage() {
    // useFilterParams relies on useSearchParams → needs a Suspense boundary.
    return (
        <Suspense fallback={null}>
            <ReferralTabs />
        </Suspense>
    )
}
