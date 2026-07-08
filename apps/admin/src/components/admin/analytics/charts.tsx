'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import { CHART_COLORS } from './chart-constants'

function pickColor(i: number) {
    return CHART_COLORS[i % CHART_COLORS.length]
}

function useChartTheme() {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])
    const dark = mounted && resolvedTheme === 'dark'
    return {
        grid: dark ? '#27272a' : '#e5e7eb',
        axis: dark ? '#a1a1aa' : '#52525b',
        tooltipBg: dark ? '#18181b' : '#ffffff',
        tooltipBorder: dark ? '#3f3f46' : '#e5e7eb',
        tooltipText: dark ? '#fafafa' : '#18181b',
    }
}

function tooltipProps(t: ReturnType<typeof useChartTheme>) {
    return {
        contentStyle: {
            backgroundColor: t.tooltipBg,
            border: `1px solid ${t.tooltipBorder}`,
            borderRadius: 6,
            color: t.tooltipText,
        },
        labelStyle: { color: t.tooltipText },
        itemStyle: { color: t.tooltipText },
        cursor: { fill: t.grid, fillOpacity: 0.3 },
    } as const
}

export function ActiveUsersChart({
    data,
}: {
    data: Array<{ bucket: string; users: number }>
}) {
    const t = useChartTheme()
    const series = data.map(d => ({
        ...d,
        label: new Date(d.bucket).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    }))

    return (
        <ResponsiveContainer width="100%" height={260}>
            <LineChart data={series} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
                <XAxis dataKey="label" fontSize={12} stroke={t.axis} tick={{ fill: t.axis }} />
                <YAxis allowDecimals={false} fontSize={12} stroke={t.axis} tick={{ fill: t.axis }} />
                <Tooltip {...tooltipProps(t)} />
                <Line type="monotone" dataKey="users" stroke={CHART_COLORS[0]} strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    )
}

export function TopEventsChart({
    data,
    onSelect,
}: {
    data: Array<{ event_type: string; count: number }>
    onSelect?: (eventType: string) => void
}) {
    const t = useChartTheme()
    const maxLabel = data.reduce((m, d) => Math.max(m, d.event_type.length), 0)
    // ~6.5px per char at 12px font, capped so we don't eat the whole chart.
    const yWidth = Math.min(240, Math.max(120, Math.round(maxLabel * 6.5) + 12))
    const truncate = (s: string) => (s.length > 28 ? s.slice(0, 27) + '…' : s)

    return (
        <ResponsiveContainer width="100%" height={Math.max(220, data.length * 28)}>
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
                <XAxis type="number" allowDecimals={false} fontSize={12} stroke={t.axis} tick={{ fill: t.axis }} />
                <YAxis
                    dataKey="event_type"
                    type="category"
                    width={yWidth}
                    fontSize={12}
                    stroke={t.axis}
                    tick={{ fill: t.axis }}
                    interval={0}
                    tickFormatter={truncate}
                />
                <Tooltip {...tooltipProps(t)} />
                <Bar
                    dataKey="count"
                    fill={CHART_COLORS[0]}
                    radius={[0, 4, 4, 0]}
                    cursor={onSelect ? 'pointer' : undefined}
                    onClick={(d: any) => {
                        const ev = d?.event_type ?? d?.payload?.event_type
                        if (ev) onSelect?.(ev)
                    }}
                />
            </BarChart>
        </ResponsiveContainer>
    )
}

export function CountPieChart({
    data,
    dataKey,
    nameKey,
}: {
    data: Array<Record<string, any>>
    dataKey: string
    nameKey: string
}) {
    const t = useChartTheme()
    return (
        <ResponsiveContainer width="100%" height={260}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey={dataKey}
                    nameKey={nameKey}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={{ fill: t.axis }}
                >
                    {data.map((_, i) => (
                        <Cell key={i} fill={pickColor(i)} />
                    ))}
                </Pie>
                <Tooltip {...tooltipProps(t)} />
                <Legend wrapperStyle={{ color: t.axis }} />
            </PieChart>
        </ResponsiveContainer>
    )
}

// Bucket label formatting keyed by the backend's date_trunc unit: sub-day
// granularity shows the time, day shows the date.
function formatBucket(iso: string, granularity: 'minute' | 'hour' | 'day') {
    const d = new Date(iso)
    if (granularity === 'minute') {
        return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    }
    if (granularity === 'hour') {
        return d.toLocaleString(undefined, {
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function DailyStackedBarChart({
    data,
    eventTypes,
    granularity = 'day',
    seriesLabels,
}: {
    data: Array<{ day: string; events: Record<string, number>; total: number }>
    eventTypes: string[]
    granularity?: 'minute' | 'hour' | 'day'
    seriesLabels?: Record<string, string> // dataKey -> display name (legend/tooltip)
}) {
    const t = useChartTheme()
    // Convert {day, events: {type: n}} → flat rows {day, type1: n, type2: m}
    const series = [...data]
        .reverse() // chronological (oldest left)
        .map(d => ({
            day: formatBucket(d.day, granularity),
            ...d.events,
        }))
    const labelFor = (ev: string) => seriesLabels?.[ev] ?? ev

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={series} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
                <XAxis dataKey="day" fontSize={12} stroke={t.axis} tick={{ fill: t.axis }} />
                <YAxis allowDecimals={false} fontSize={12} stroke={t.axis} tick={{ fill: t.axis }} />
                <Tooltip {...tooltipProps(t)} />
                <Legend wrapperStyle={{ color: t.axis }} />
                {eventTypes.map((ev, i) => (
                    <Bar key={ev} dataKey={ev} name={labelFor(ev)} stackId="events" fill={pickColor(i)} />
                ))}
            </BarChart>
        </ResponsiveContainer>
    )
}

// Short dd.mm bucket label for the app-versions timeseries.
function formatVersionBucket(iso: string): string {
    const d = new Date(iso)
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    return `${dd}.${mm}`
}

export function VersionsTimeseriesChart({
    lineData,
    lineKeys,
}: {
    lineData: Array<Record<string, number | string>>
    lineKeys: string[]
}) {
    const t = useChartTheme()
    return (
        <ResponsiveContainer width="100%" height={360}>
            <LineChart data={lineData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
                <XAxis
                    dataKey="bucket"
                    tickFormatter={formatVersionBucket}
                    fontSize={12}
                    stroke={t.axis}
                    tick={{ fill: t.axis }}
                />
                <YAxis allowDecimals={false} fontSize={12} stroke={t.axis} tick={{ fill: t.axis }} />
                <Tooltip
                    labelFormatter={v => formatVersionBucket(String(v))}
                    {...tooltipProps(t)}
                />
                <Legend wrapperStyle={{ color: t.axis }} />
                {lineKeys.map((v, i) => (
                    <Line
                        key={v}
                        type="monotone"
                        dataKey={v}
                        stroke={v === 'Прочие' ? t.axis : CHART_COLORS[i % CHART_COLORS.length]}
                        strokeWidth={2}
                        dot={false}
                        connectNulls
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    )
}

// Per-event drill-down: events (left axis) + unique users (right axis) over time.
export function EventTimeseriesChart({
    data,
    granularity = 'day',
}: {
    data: Array<{ bucket: string; events: number; users: number }>
    granularity?: 'hour' | 'day' | 'week'
}) {
    const t = useChartTheme()
    const series = data.map(d => ({
        ...d,
        label: formatBucket(d.bucket, granularity === 'hour' ? 'hour' : 'day'),
    }))

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={series} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
                <XAxis dataKey="label" fontSize={12} stroke={t.axis} tick={{ fill: t.axis }} />
                <YAxis
                    yAxisId="events"
                    allowDecimals={false}
                    fontSize={12}
                    stroke={CHART_COLORS[0]}
                    tick={{ fill: t.axis }}
                />
                <YAxis
                    yAxisId="users"
                    orientation="right"
                    allowDecimals={false}
                    fontSize={12}
                    stroke={CHART_COLORS[1]}
                    tick={{ fill: t.axis }}
                />
                <Tooltip {...tooltipProps(t)} />
                <Legend wrapperStyle={{ color: t.axis }} />
                <Line
                    yAxisId="events"
                    type="monotone"
                    dataKey="events"
                    name="События"
                    stroke={CHART_COLORS[0]}
                    strokeWidth={2}
                    dot={false}
                />
                <Line
                    yAxisId="users"
                    type="monotone"
                    dataKey="users"
                    name="Пользователи"
                    stroke={CHART_COLORS[1]}
                    strokeWidth={2}
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    )
}

// Promo drill-down: impressions (left axis) + clicks (right axis) over time.
export function ImpressionsClicksChart({
    data,
    granularity = 'day',
}: {
    data: Array<{ bucket: string; impressions: number; clicks: number }>
    granularity?: 'hour' | 'day' | 'week'
}) {
    const t = useChartTheme()
    const series = data.map(d => ({
        ...d,
        label: formatBucket(d.bucket, granularity === 'hour' ? 'hour' : 'day'),
    }))

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={series} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
                <XAxis dataKey="label" fontSize={12} stroke={t.axis} tick={{ fill: t.axis }} />
                <YAxis
                    yAxisId="impressions"
                    allowDecimals={false}
                    fontSize={12}
                    stroke={CHART_COLORS[0]}
                    tick={{ fill: t.axis }}
                />
                <YAxis
                    yAxisId="clicks"
                    orientation="right"
                    allowDecimals={false}
                    fontSize={12}
                    stroke={CHART_COLORS[1]}
                    tick={{ fill: t.axis }}
                />
                <Tooltip {...tooltipProps(t)} />
                <Legend wrapperStyle={{ color: t.axis }} />
                <Line
                    yAxisId="impressions"
                    type="monotone"
                    dataKey="impressions"
                    name="Показы"
                    stroke={CHART_COLORS[0]}
                    strokeWidth={2}
                    dot={false}
                />
                <Line
                    yAxisId="clicks"
                    type="monotone"
                    dataKey="clicks"
                    name="Клики"
                    stroke={CHART_COLORS[1]}
                    strokeWidth={2}
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    )
}

// Histogram: users bucketed by how many times they triggered an event.
export function FrequencyBarChart({
    data,
}: {
    data: Array<{ bucket: string; users: number }>
}) {
    const t = useChartTheme()
    return (
        <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
                <XAxis dataKey="bucket" fontSize={12} stroke={t.axis} tick={{ fill: t.axis }} />
                <YAxis allowDecimals={false} fontSize={12} stroke={t.axis} tick={{ fill: t.axis }} />
                <Tooltip {...tooltipProps(t)} />
                <Bar dataKey="users" name="Пользователи" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    )
}

const ERROR_SERIES = [
    { key: 'server', label: '5xx', color: '#dc2626' },
    { key: 'client', label: '4xx', color: '#f97316' },
    { key: 'validation', label: '422', color: '#f59e0b' },
] as const

export function ErrorsTimeseriesChart({
    data,
    granularity = 'day',
}: {
    data: Array<{ bucket: string; server: number; client: number; validation: number; total: number }>
    granularity?: 'hour' | 'day' | 'week' | 'month'
}) {
    const t = useChartTheme()
    const series = data.map(d => ({
        ...d,
        label:
            granularity === 'hour'
                ? new Date(d.bucket).toLocaleString(undefined, { day: 'numeric', hour: '2-digit' })
                : new Date(d.bucket).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    }))

    return (
        <ResponsiveContainer width="100%" height={280}>
            <BarChart data={series} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={t.grid} />
                <XAxis dataKey="label" fontSize={12} stroke={t.axis} tick={{ fill: t.axis }} />
                <YAxis allowDecimals={false} fontSize={12} stroke={t.axis} tick={{ fill: t.axis }} />
                <Tooltip {...tooltipProps(t)} />
                <Legend wrapperStyle={{ color: t.axis }} />
                {ERROR_SERIES.map(s => (
                    <Bar key={s.key} dataKey={s.key} name={s.label} stackId="errors" fill={s.color} />
                ))}
            </BarChart>
        </ResponsiveContainer>
    )
}
