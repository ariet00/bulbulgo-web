'use client'

import { useState } from 'react'
import { useIsFetching, useQueryClient } from '@tanstack/react-query'
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@doska/ui'
import { RefreshCw } from 'lucide-react'
import { adminKeys } from '@/hooks/queries/admin'
import { PERIODS, useTabParam } from './components/shared'
import { OverviewTab } from './components/OverviewTab'
import { TrendsTab } from './components/TrendsTab'
import { TopsTab } from './components/TopsTab'
import { WalletsTab } from './components/WalletsTab'
import { LimitsTab } from './components/LimitsTab'
import { FraudTab } from './components/FraudTab'

// Every tab owns its own queries, and Radix unmounts inactive TabsContent — so a
// tab's data is fetched the first time it is opened, not on page load.
export default function BulbulGoAnalyticsPage() {
    const [mainTab, setMainTab] = useTabParam('tab', 'overview')
    const [period, setPeriod] = useState('24h')
    const [resetNonce, setResetNonce] = useState(0)

    // Picking a global period also resets every card's override (via the nonce).
    const selectGlobal = (p: string) => {
        setPeriod(p)
        setResetNonce(n => n + 1)
    }

    const queryClient = useQueryClient()
    const isFetching = useIsFetching({ queryKey: adminKeys.analytics() }) > 0
    // Помечает аналитику устаревшей: видимые запросы перезапрашиваются сразу,
    // остальные — при открытии своего таба.
    const refreshAll = () => queryClient.invalidateQueries({ queryKey: adminKeys.analytics() })

    const tabProps = { period, resetNonce }

    return (
        <div className="p-4 sm:p-6">
            <div className="sticky top-0 z-20 -mx-4 mb-6 border-b bg-background/85 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:-mx-6 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                            BulBul Go — аналитика
                        </h1>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                            Rideshare, такси, маршрутки, автобусы, грузовые
                        </p>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto sm:overflow-visible">
                        <span className="hidden shrink-0 text-sm text-muted-foreground lg:inline">
                            Период:
                        </span>
                        <div className="flex shrink-0 items-center gap-1">
                            {PERIODS.map(p => (
                                <Button
                                    key={p.value}
                                    variant={period === p.value ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => selectGlobal(p.value)}
                                >
                                    {p.label}
                                </Button>
                            ))}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="shrink-0"
                            onClick={refreshAll}
                            disabled={isFetching}
                            title="Обновить все"
                        >
                            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
                            <span className="ml-1 hidden sm:inline">Обновить</span>
                        </Button>
                    </div>
                </div>
            </div>

            <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-6">
                <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                    <TabsList className="inline-flex w-max">
                        <TabsTrigger value="overview">Обзор</TabsTrigger>
                        <TabsTrigger value="trends">Динамика</TabsTrigger>
                        <TabsTrigger value="tops">Топы</TabsTrigger>
                        <TabsTrigger value="wallets">Кошельки</TabsTrigger>
                        <TabsTrigger value="limits">Лимиты</TabsTrigger>
                        <TabsTrigger value="fraud">Антифрод</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview" className="mt-0 space-y-6">
                    <OverviewTab {...tabProps} />
                </TabsContent>

                <TabsContent value="trends" className="mt-0 space-y-6">
                    <TrendsTab {...tabProps} />
                </TabsContent>

                <TabsContent value="tops" className="mt-0">
                    <TopsTab {...tabProps} />
                </TabsContent>

                <TabsContent value="wallets" className="mt-0 space-y-6">
                    <WalletsTab {...tabProps} />
                </TabsContent>

                <TabsContent value="limits" className="mt-0 space-y-6">
                    <LimitsTab />
                </TabsContent>

                <TabsContent value="fraud" className="mt-0 space-y-6">
                    <FraudTab />
                </TabsContent>
            </Tabs>
        </div>
    )
}
