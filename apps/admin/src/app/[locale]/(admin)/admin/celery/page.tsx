'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@doska/ui'

import { HistoryTab } from '@/components/admin/celery/HistoryTab'
import { ScheduleTab } from '@/components/admin/celery/ScheduleTab'
import { WorkersTab } from '@/components/admin/celery/WorkersTab'

export default function CeleryAdminPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Celery</h1>

            <Tabs defaultValue="workers">
                <TabsList>
                    <TabsTrigger value="workers">Воркеры</TabsTrigger>
                    <TabsTrigger value="history">История</TabsTrigger>
                    <TabsTrigger value="schedule">Расписание</TabsTrigger>
                </TabsList>

                <TabsContent value="workers" className="mt-4">
                    <WorkersTab />
                </TabsContent>
                <TabsContent value="history" className="mt-4">
                    <HistoryTab />
                </TabsContent>
                <TabsContent value="schedule" className="mt-4">
                    <ScheduleTab />
                </TabsContent>
            </Tabs>
        </div>
    )
}
