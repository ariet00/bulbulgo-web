'use client'

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

// Tailwind chart palette — neutral but distinguishable. Recharts wants concrete
// hex/color strings (no CSS variables), so keep this in sync with theme.css if
// you ever want light/dark parity.
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

export function ActiveUsersChart({
    data,
}: {
    data: Array<{ bucket: string; users: number }>
}) {
    const series = data.map(d => ({
        ...d,
        label: new Date(d.bucket).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    }))

    return (
        <ResponsiveContainer width="100%" height={260}>
            <LineChart data={series} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
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
    return (
        <ResponsiveContainer width="100%" height={Math.max(220, data.length * 26)}>
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" allowDecimals={false} fontSize={12} />
                <YAxis dataKey="event_type" type="category" width={150} fontSize={12} />
                <Tooltip />
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
                    label
                >
                    {data.map((_, i) => (
                        <Cell key={i} fill={pickColor(i)} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    )
}

export function DailyStackedBarChart({
    data,
    eventTypes,
}: {
    data: Array<{ day: string; events: Record<string, number>; total: number }>
    eventTypes: string[]
}) {
    // Convert {day, events: {type: n}} → flat rows {day, type1: n, type2: m}
    const series = [...data]
        .reverse() // chronological (oldest left)
        .map(d => ({
            day: new Date(d.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            ...d.events,
        }))

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={series} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis allowDecimals={false} fontSize={12} />
                <Tooltip />
                <Legend />
                {eventTypes.map((ev, i) => (
                    <Bar key={ev} dataKey={ev} stackId="events" fill={pickColor(i)} />
                ))}
            </BarChart>
        </ResponsiveContainer>
    )
}
