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

export const CHART_COLORS = [
    '#2563eb', // blue
    '#16a34a', // green
    '#dc2626', // red
    '#f59e0b', // amber
    '#8b5cf6', // violet
    '#06b6d4', // cyan
    '#ec4899', // pink
    '#64748b', // slate
] as const

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
}: {
    data: Array<{ event_type: string; count: number }>
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
                <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
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
