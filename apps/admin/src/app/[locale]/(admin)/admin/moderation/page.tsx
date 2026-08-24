'use client'

import { Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@doska/ui'
import { useFilterParams } from '@/hooks/useFilterParams'
import { ModerationSettingsForm } from '@/components/admin/moderation/ModerationSettingsForm'
import { ModeratedChatsTable } from '@/components/admin/moderation/ModeratedChatsTable'
import { ModerationLogTable } from '@/components/admin/moderation/ModerationLogTable'

const FILTER_DEFAULTS = { tab: 'settings' }
const TABS = ['settings', 'chats', 'log'] as const

function ModerationTabs() {
    const { values, setValues } = useFilterParams(FILTER_DEFAULTS)
    const active = (TABS as readonly string[]).includes(values.tab) ? values.tab : 'settings'

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Модерация групп</h1>
                <p className="text-sm text-muted-foreground">
                    Бот проверяет сообщения и подписи в группах и удаляет совпавшие со
                    стоп-словами.
                </p>
            </div>

            <Tabs value={active} onValueChange={(v) => setValues({ tab: v })}>
                <TabsList>
                    <TabsTrigger value="settings">Стоп-слова</TabsTrigger>
                    <TabsTrigger value="chats">Группы</TabsTrigger>
                    <TabsTrigger value="log">Журнал</TabsTrigger>
                </TabsList>
                <TabsContent value="settings" className="max-w-3xl pt-2">
                    <ModerationSettingsForm />
                </TabsContent>
                <TabsContent value="chats" className="pt-2">
                    <ModeratedChatsTable />
                </TabsContent>
                <TabsContent value="log" className="pt-2">
                    <ModerationLogTable />
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default function AdminModerationPage() {
    // useFilterParams опирается на useSearchParams → нужен Suspense.
    return (
        <Suspense fallback={null}>
            <ModerationTabs />
        </Suspense>
    )
}
