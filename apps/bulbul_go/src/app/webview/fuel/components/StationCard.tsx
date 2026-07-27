'use client'

// Строка списка АЗС: имя + удаление + чипы статусов по маркам.
// Чип марки — «светофор»: цвет по статусу последнего свежего репорта,
// приглушённый для устаревших, серый контур — репортов нет.

import {
    STATUS_COLOR,
    avatarHue,
    formatDistance,
    formatPrice,
    metaLabel,
    timeAgo,
} from '../lib/format'
import type { FuelMeta, FuelType, Station } from '../lib/types'

/** Лого АЗС, а без него — буква-аватар с тоном от названия. */
export function StationAvatar({
    station,
    size = 40,
}: {
    station: Pick<Station, 'name' | 'brand' | 'logo'>
    size?: number
}) {
    const title = station.brand || station.name
    if (station.logo) {
        return (
            // eslint-disable-next-line @next/next/no-img-element -- внешний URL лого
            <img
                src={station.logo}
                alt=""
                width={size}
                height={size}
                className="shrink-0 rounded-xl object-cover"
            />
        )
    }
    const hue = avatarHue(title)
    return (
        <span
            aria-hidden
            className="flex shrink-0 items-center justify-center rounded-xl font-bold"
            style={{
                width: size,
                height: size,
                fontSize: size * 0.42,
                color: `hsl(${hue} 55% 38%)`,
                backgroundColor: `hsl(${hue} 60% 50% / 0.14)`,
            }}
        >
            {(title[0] || 'А').toUpperCase()}
        </span>
    )
}

export function StationCard({
    station,
    meta,
    onOpen,
}: {
    station: Station
    meta: FuelMeta | undefined
    onOpen: () => void
}) {
    // марки: из справочника станции; без данных — все, по которым есть репорты
    const grades: FuelType[] = station.fuel_types.length
        ? station.fuel_types
        : (Object.keys(station.statuses) as FuelType[])

    const freshest = Object.values(station.statuses)
        .filter((s) => s && !s.is_stale)
        .sort((a, b) => +new Date(b!.updated_at) - +new Date(a!.updated_at))[0]

    return (
        <button
            onClick={onOpen}
            className="w-full rounded-2xl border border-border bg-background p-3.5 text-left transition-colors active:bg-muted/60"
        >
            <div className="flex items-start gap-3">
                <StationAvatar station={station} />
                <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                        <p className="min-w-0 truncate text-[15px] font-semibold leading-tight">
                            {station.name}
                        </p>
                        <span className="shrink-0 text-[13px] font-medium tabular-nums text-[var(--fl-accent)]">
                            {formatDistance(station.distance_km)}
                        </span>
                    </div>
                    {(station.address || station.brand) && (
                        <p className="mt-0.5 truncate text-[12.5px] text-muted-foreground">
                            {station.address || station.brand}
                        </p>
                    )}
                </div>
            </div>

            {grades.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {grades.map((g) => {
                        const st = station.statuses[g]
                        const color = st ? STATUS_COLOR[st.status] : undefined
                        return (
                            <span
                                key={g}
                                className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium"
                                style={
                                    st
                                        ? {
                                              color,
                                              borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
                                              backgroundColor: `color-mix(in srgb, ${color} ${st.is_stale ? 5 : 10}%, transparent)`,
                                              opacity: st.is_stale ? 0.62 : 1,
                                          }
                                        : undefined
                                }
                            >
                                {st && (
                                    <span
                                        className={
                                            'h-1.5 w-1.5 rounded-full ' +
                                            (st.is_stale ? '' : 'fl-pulse')
                                        }
                                        style={{ backgroundColor: color, color }}
                                    />
                                )}
                                {metaLabel(meta?.fuel_types, g)}
                                {st?.price != null && (
                                    <span className="tabular-nums opacity-90">
                                        {formatPrice(st.price)}
                                    </span>
                                )}
                            </span>
                        )
                    })}
                </div>
            )}

            <p className="mt-2 text-[11.5px] text-muted-foreground">
                {freshest
                    ? `Обновлено ${timeAgo(freshest.updated_at)}`
                    : 'Нет свежих отметок — будьте первым'}
            </p>
        </button>
    )
}
