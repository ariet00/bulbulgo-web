'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@doska/ui'
import {
    useAdminRideshareInstallsByDay,
    useAdminRideshareTripsByDay,
} from '@/hooks/queries/admin'
import { DailyStackedBarChart } from '@/components/admin/analytics/charts-lazy'
import {
    AsyncBlock,
    PeriodPicker,
    ROLE_LABELS,
    useCardPeriod,
    type TabSectionProps,
} from './shared'

export function TrendsTab({ period, resetNonce }: TabSectionProps) {
    const [tripsP, setTripsP, tripsOver] = useCardPeriod(period, resetNonce)
    const [installsP, setInstallsP, installsOver] = useCardPeriod(period, resetNonce)

    // Same period, two stackings shown side by side: by trip type and by role.
    const tripsByType = useAdminRideshareTripsByDay(tripsP, 'type')
    const tripsByRole = useAdminRideshareTripsByDay(tripsP, 'role')
    const installsByDay = useAdminRideshareInstallsByDay(installsP)

    return (
        <>
            <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
                    <CardTitle>Поездки по дням ({tripsP})</CardTitle>
                    <PeriodPicker value={tripsP} onChange={setTripsP} overridden={tripsOver} />
                </CardHeader>
                <CardContent className="grid gap-6 lg:grid-cols-2">
                    <TripsByDayBlock title="По типам" query={tripsByType} />
                    <TripsByDayBlock
                        title="По ролям"
                        query={tripsByRole}
                        seriesLabels={ROLE_LABELS}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between space-y-0">
                    <CardTitle>Установки и регистрации по дням ({installsP})</CardTitle>
                    <PeriodPicker
                        value={installsP}
                        onChange={setInstallsP}
                        overridden={installsOver}
                    />
                </CardHeader>
                <CardContent>
                    <AsyncBlock
                        loading={installsByDay.isLoading}
                        empty={!installsByDay.data || installsByDay.data.days.length === 0}
                    >
                        {installsByDay.data && (
                            <DailyStackedBarChart
                                data={[...installsByDay.data.days].reverse()}
                                eventTypes={installsByDay.data.event_types}
                                granularity={installsByDay.data.granularity}
                            />
                        )}
                    </AsyncBlock>
                </CardContent>
            </Card>
        </>
    )
}

function TripsByDayBlock({
    title,
    query,
    seriesLabels,
}: {
    title: string
    query: ReturnType<typeof useAdminRideshareTripsByDay>
    seriesLabels?: Record<string, string>
}) {
    return (
        <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">{title}</div>
            <AsyncBlock
                loading={query.isLoading}
                empty={!query.data || query.data.days.length === 0}
            >
                {query.data && (
                    <DailyStackedBarChart
                        data={[...query.data.days].reverse()}
                        eventTypes={query.data.trip_types}
                        granularity={query.data.granularity}
                        seriesLabels={seriesLabels}
                    />
                )}
            </AsyncBlock>
        </div>
    )
}
