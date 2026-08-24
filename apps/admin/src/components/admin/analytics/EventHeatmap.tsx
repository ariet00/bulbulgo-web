'use client'

// Hour-of-day × day-of-week heatmap. Plain CSS grid — no recharts, so it can
// be imported statically without dragging the chart bundle in.
import { CHART_COLORS } from './chart-constants'

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] // ISO dow 1..7

export type HeatmapCell = { dow: number; hour: number; events: number }

export function EventHeatmap({ data }: { data: HeatmapCell[] }) {
    const byCell = new Map<string, number>()
    let max = 0
    for (const c of data) {
        byCell.set(`${c.dow}:${c.hour}`, c.events)
        if (c.events > max) max = c.events
    }

    return (
        <div className="overflow-x-auto">
            <div
                className="grid w-max gap-0.5"
                style={{ gridTemplateColumns: `2rem repeat(24, 1.25rem)` }}
            >
                {/* header row: hours */}
                <div />
                {Array.from({ length: 24 }, (_, h) => (
                    <div key={h} className="text-center text-[10px] text-muted-foreground">
                        {h % 3 === 0 ? h : ''}
                    </div>
                ))}
                {DAYS.map((day, i) => {
                    const dow = i + 1
                    return (
                        <div key={day} className="contents">
                            <div className="pr-1 text-right text-[10px] leading-5 text-muted-foreground">
                                {day}
                            </div>
                            {Array.from({ length: 24 }, (_, h) => {
                                const v = byCell.get(`${dow}:${h}`) ?? 0
                                return (
                                    <div
                                        key={h}
                                        title={`${day} ${String(h).padStart(2, '0')}:00 — ${v.toLocaleString()}`}
                                        className="h-5 w-5 rounded-[3px] bg-muted"
                                        style={
                                            v > 0
                                                ? {
                                                      backgroundColor: CHART_COLORS[0],
                                                      // 0.15..1 so even rare cells stay visible
                                                      opacity: 0.15 + 0.85 * (v / max),
                                                  }
                                                : undefined
                                        }
                                    />
                                )
                            })}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
