'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@doska/ui'
import { TopActiveUsersCard } from './TopActiveUsersCard'
import { TopDriversCard } from './TopDriversCard'
import { TopRoutesCard } from './TopRoutesCard'
import { TopViewedTripsCard } from './TopViewedTripsCard'
import { useTabParam, type TabSectionProps } from './shared'

// Radix unmounts inactive TabsContent, so each sub-tab's queries only fire once
// that sub-tab is opened.
export function TopsTab({ period, resetNonce }: TabSectionProps) {
    const [topsTab, setTopsTab] = useTabParam('top', 'trips')

    return (
        <Tabs value={topsTab} onValueChange={setTopsTab} className="space-y-4">
            <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                <TabsList className="inline-flex w-max bg-muted/60">
                    <TabsTrigger value="trips">Поездки</TabsTrigger>
                    <TabsTrigger value="drivers">Водители</TabsTrigger>
                    <TabsTrigger value="users">Пользователи</TabsTrigger>
                    <TabsTrigger value="routes">Маршруты</TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="trips" className="mt-0 space-y-6">
                <TopViewedTripsCard />
            </TabsContent>

            <TabsContent value="drivers" className="mt-0 space-y-6">
                <TopDriversCard
                    title="Топ по созданию поездок"
                    variant="trips"
                    period={period}
                    resetNonce={resetNonce}
                />
                <TopDriversCard
                    title="Топ по просмотрам номера"
                    variant="phone"
                    period={period}
                    resetNonce={resetNonce}
                />
                <TopDriversCard
                    title="Топ по просмотрам объявлений"
                    variant="ads"
                    period={period}
                    resetNonce={resetNonce}
                />
            </TabsContent>

            <TabsContent value="users" className="mt-0 space-y-6">
                <TopActiveUsersCard period={period} resetNonce={resetNonce} />
            </TabsContent>

            <TabsContent value="routes" className="mt-0 space-y-6">
                <TopRoutesCard period={period} resetNonce={resetNonce} />
            </TabsContent>
        </Tabs>
    )
}
