'use client'

// Lazy boundary for every recharts-backed chart. Pages import charts from HERE,
// never from ./charts directly — the dynamic import() keeps recharts (~5MB) out
// of each page's static graph, so it's fetched only when a chart actually renders.
// recharts is client-only, hence ssr: false.
import dynamic from 'next/dynamic'

const loading = () => <div className="text-muted-foreground text-sm">Загрузка графика…</div>

export const ActiveUsersChart = dynamic(
    () => import('./charts').then(m => m.ActiveUsersChart),
    { ssr: false, loading },
)

export const TopEventsChart = dynamic(
    () => import('./charts').then(m => m.TopEventsChart),
    { ssr: false, loading },
)

export const CountPieChart = dynamic(
    () => import('./charts').then(m => m.CountPieChart),
    { ssr: false, loading },
)

export const DailyStackedBarChart = dynamic(
    () => import('./charts').then(m => m.DailyStackedBarChart),
    { ssr: false, loading },
)

export const VersionsTimeseriesChart = dynamic(
    () => import('./charts').then(m => m.VersionsTimeseriesChart),
    { ssr: false, loading },
)

export const EventTimeseriesChart = dynamic(
    () => import('./charts').then(m => m.EventTimeseriesChart),
    { ssr: false, loading },
)

export const ImpressionsClicksChart = dynamic(
    () => import('./charts').then(m => m.ImpressionsClicksChart),
    { ssr: false, loading },
)

export const FrequencyBarChart = dynamic(
    () => import('./charts').then(m => m.FrequencyBarChart),
    { ssr: false, loading },
)

export const ErrorsTimeseriesChart = dynamic(
    () => import('./charts').then(m => m.ErrorsTimeseriesChart),
    { ssr: false, loading },
)

export const ErrorSignatureSparkline = dynamic(
    () => import('./charts').then(m => m.ErrorSignatureSparkline),
    { ssr: false, loading },
)
