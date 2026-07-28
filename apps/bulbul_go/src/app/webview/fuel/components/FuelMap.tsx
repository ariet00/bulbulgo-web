'use client'

// Таб «Карта»: MapLibre GL, АЗС — свой GeoJSON-слой поверх подложки
// (пин = светофор по лучшему свежему статусу станции), кластеризация,
// точка «я тут», тап по пину → StationSheet (общий с лентой).
// Библиотека живёт только в чанке этого роута (Next режет по страницам).

import { useEffect, useRef, useState } from 'react'
// maplibre-gl зафиксирован на ^5: у 6.0.0 стиль не завершает загрузку
// (styleLoaded=false навсегда, тайлы не запрашиваются) — проверено в Chrome
// и WebKit. При обновлении на 6.x перепроверить карту глазами.
import {
    Map as MapLibreMap,
    Marker,
    type GeoJSONSource,
    type MapLayerMouseEvent,
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useQuery } from '@tanstack/react-query'
import { fetchStations } from '../lib/api'
import { useFuelMeta } from '../lib/queries'
import { useOrigin } from '../lib/useOrigin'
import type { FuelStatus, Station } from '../lib/types'
import { ReportSheet } from './ReportSheet'
import { StationSheet } from './StationSheet'

// Подложка: OpenFreeMap — данные OSM, безлимит, без ключа. После деплоя
// geo-стека заменить одной строкой на свой стиль:
//   https://tiles.bulbul.asia/styles/<style>/style.json
const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty'

//: приоритет статусов для цвета пина: чем «хуже», тем важнее показать
const STATUS_PRIORITY: FuelStatus[] = ['out', 'queue', 'low', 'incoming', 'available']

/** Цвет пина станции: худший из свежих статусов; без свежих — серый. */
function stationColor(
    station: Station,
    palette: Record<FuelStatus, string>,
): string {
    const fresh = Object.values(station.statuses).filter((s) => s && !s.is_stale)
    for (const status of STATUS_PRIORITY) {
        if (fresh.some((s) => s!.status === status)) return palette[status]
    }
    return '#9aa1ab'
}

/** Группа станции для долей доната: ok — есть/мало, bad — очередь/
 * закончилось/ждём подвоз, na — свежих отметок нет. */
function stationGroup(station: Station): 'ok' | 'bad' | 'na' {
    const fresh = Object.values(station.statuses).filter((s) => s && !s.is_stale)
    if (!fresh.length) return 'na'
    return fresh.some((s) => ['out', 'queue', 'incoming'].includes(s!.status))
        ? 'bad'
        : 'ok'
}

/** SVG-донат кластера: дуги — доли групп, в центре — число станций. */
function donutElement(
    counts: { ok: number; bad: number; na: number },
    total: number,
    colors: { ok: string; bad: string; na: string },
): HTMLDivElement {
    const r = total >= 25 ? 26 : total >= 10 ? 23 : 20
    const r0 = r - 5.5 // внутренний радиус кольца
    const segments: [number, string][] = (
        [
            [counts.bad, colors.bad],
            [counts.ok, colors.ok],
            [counts.na, colors.na],
        ] as [number, string][]
    ).filter(([n]) => n > 0)

    const arc = (start: number, end: number, color: string) => {
        // полный круг одной дугой SVG не рисует — чуть ужимаем
        if (end - start >= 1) end = start - 1e-5 + 1
        const a0 = 2 * Math.PI * (start - 0.25)
        const a1 = 2 * Math.PI * (end - 0.25)
        const x0 = r + r * Math.cos(a0)
        const y0 = r + r * Math.sin(a0)
        const x1 = r + r * Math.cos(a1)
        const y1 = r + r * Math.sin(a1)
        const large = end - start > 0.5 ? 1 : 0
        return `<path d="M ${r} ${r} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z" fill="${color}"/>`
    }

    let offset = 0
    let paths = ''
    const sum = counts.ok + counts.bad + counts.na || 1
    for (const [n, color] of segments) {
        paths += arc(offset / sum, (offset + n) / sum, color)
        offset += n
    }

    const el = document.createElement('div')
    el.innerHTML =
        `<svg width="${r * 2}" height="${r * 2}" viewBox="0 0 ${r * 2} ${r * 2}" style="display:block;filter:drop-shadow(0 1px 4px rgb(0 0 0 / .25));cursor:pointer">` +
        `<circle cx="${r}" cy="${r}" r="${r}" fill="#ffffff"/>` +
        paths +
        `<circle cx="${r}" cy="${r}" r="${r0}" fill="#ffffff"/>` +
        `<text x="${r}" y="${r}" text-anchor="middle" dominant-baseline="central" font-size="${r >= 23 ? 13 : 12}" font-weight="700" font-family="system-ui, sans-serif" fill="#1c2430">${total}</text>` +
        `</svg>`
    return el
}

/** CSS-переменные светофора → конкретные цвета для WebGL-слоя. */
function resolvePalette(): Record<FuelStatus, string> {
    const cs = getComputedStyle(document.documentElement)
    const v = (name: string, fallback: string) =>
        cs.getPropertyValue(name).trim() || fallback
    return {
        available: v('--fl-ok', '#189a58'),
        low: v('--fl-low', '#a88a0b'),
        incoming: v('--fl-soon', '#2f7fd1'),
        queue: v('--fl-warn', '#d9840a'),
        out: v('--fl-bad', '#d3372f'),
    }
}

export function FuelMap() {
    const { origin, geoDenied } = useOrigin()
    const meta = useFuelMeta()
    const containerRef = useRef<HTMLDivElement>(null)
    const mapRef = useRef<MapLibreMap | null>(null)
    const [mapReady, setMapReady] = useState(false)
    const [openedStation, setOpenedStation] = useState<Station | null>(null)
    const [reportStation, setReportStation] = useState<Station | null>(null)
    // видимые донат-маркеры кластеров по cluster_id; в ref — чтобы update-путь
    // эффекта (setData) мог их очистить и sync пересоздал со свежими долями
    const donutsRef = useRef(new Map<number, Marker>())

    // Станции для карты: широкий радиус от позиции (не фильтруем по марке —
    // на карте видно всё; лимит бэка 200 покрывает пол-страны от любой точки)
    const stations = useQuery({
        queryKey: [
            'fuel',
            'map-stations',
            origin ? `${origin.lat.toFixed(2)},${origin.lng.toFixed(2)}` : 'none',
        ],
        queryFn: () => fetchStations(origin!, { radiusKm: 200, limit: 200 }),
        enabled: origin !== null,
        staleTime: 60_000,
        refetchOnWindowFocus: true,
    })

    // ── инициализация карты (после получения позиции) ──
    useEffect(() => {
        if (!origin || !containerRef.current || mapRef.current) return
        const map = new MapLibreMap({
            container: containerRef.current,
            style: MAP_STYLE_URL,
            center: [origin.lng, origin.lat],
            zoom: 12,
            attributionControl: { compact: true },
        })
        mapRef.current = map
        map.on('load', () => setMapReady(true))

        // точка «я тут» — только при реальной позиции (не фолбэк-центре)
        if (!geoDenied) {
            const dot = document.createElement('div')
            dot.style.cssText =
                'width:14px;height:14px;border-radius:50%;background:#1f6ff0;' +
                'border:3px solid #fff;box-shadow:0 0 0 2px rgb(31 111 240 / .35)'
            new Marker({ element: dot })
                .setLngLat([origin.lng, origin.lat])
                .addTo(map)
        }

        return () => {
            mapRef.current = null
            setMapReady(false)
            map.remove()
        }
        // origin меняется один раз (null → значение) — реинит не нужен
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [origin])

    // ── слой АЗС: source + донат-кластеры + пины + обработчики ──
    useEffect(() => {
        const map = mapRef.current
        const items = stations.data
        if (!map || !mapReady || !items) return

        const palette = resolvePalette()
        const geojson = {
            type: 'FeatureCollection' as const,
            features: items.map((s) => ({
                type: 'Feature' as const,
                geometry: { type: 'Point' as const, coordinates: [s.lng, s.lat] },
                properties: {
                    id: s.id,
                    color: stationColor(s, palette),
                    grp: stationGroup(s),
                },
            })),
        }

        const existing = map.getSource('stations') as GeoJSONSource | undefined
        if (existing) {
            existing.setData(geojson)
            // cluster_id после setData переиспользуются — старые донаты
            // остались бы со стухшими долями; сносим, sync нарисует заново
            for (const marker of donutsRef.current.values()) marker.remove()
            donutsRef.current.clear()
            return
        }

        map.addSource('stations', {
            type: 'geojson',
            data: geojson,
            cluster: true,
            clusterRadius: 52,
            // агрегаты по группам — из них строятся доли донатов
            clusterProperties: {
                ok: ['+', ['case', ['==', ['get', 'grp'], 'ok'], 1, 0]],
                bad: ['+', ['case', ['==', ['get', 'grp'], 'bad'], 1, 0]],
                na: ['+', ['case', ['==', ['get', 'grp'], 'na'], 1, 0]],
            },
        })
        // Кластеры рисуются HTML-маркерами (донаты) — WebGL-слоя для них нет.
        map.addLayer({
            id: 'station-pins',
            type: 'circle',
            source: 'stations',
            filter: ['!', ['has', 'point_count']],
            paint: {
                'circle-color': ['get', 'color'],
                'circle-radius': 8,
                'circle-stroke-width': 2.5,
                'circle-stroke-color': '#ffffff',
            },
        })

        map.on('click', 'station-pins', (e: MapLayerMouseEvent) => {
            const id = e.features?.[0]?.properties?.id
            const hit = (stations.data ?? []).find((s) => s.id === id)
            if (hit) setOpenedStation(hit)
        })
        map.on('mouseenter', 'station-pins', () => {
            map.getCanvas().style.cursor = 'pointer'
        })
        map.on('mouseleave', 'station-pins', () => {
            map.getCanvas().style.cursor = ''
        })

        // ── донаты кластеров: HTML-маркеры, пересинк на каждый кадр ──
        // (паттерн из примеров MapLibre: querySourceFeatures на 'render',
        // маркеры добавляются/удаляются по видимым cluster_id)
        const donuts = donutsRef.current
        const groupColors = {
            ok: palette.available,
            bad: palette.out,
            na: '#9aa1ab',
        }

        const syncDonuts = () => {
            if (!map.isSourceLoaded('stations')) return
            const seen = new Set<number>()
            for (const f of map.querySourceFeatures('stations')) {
                const p = f.properties as {
                    cluster?: boolean
                    cluster_id?: number
                    point_count?: number
                    ok?: number
                    bad?: number
                    na?: number
                }
                if (!p.cluster || p.cluster_id == null) continue
                if (seen.has(p.cluster_id)) continue
                seen.add(p.cluster_id)
                if (donuts.has(p.cluster_id)) continue

                const coords = (
                    f.geometry as { coordinates: [number, number] }
                ).coordinates
                const el = donutElement(
                    { ok: p.ok ?? 0, bad: p.bad ?? 0, na: p.na ?? 0 },
                    p.point_count ?? 0,
                    groupColors,
                )
                el.addEventListener('click', () => {
                    map.easeTo({ center: coords, zoom: map.getZoom() + 2 })
                })
                donuts.set(
                    p.cluster_id,
                    new Marker({ element: el }).setLngLat(coords).addTo(map),
                )
            }
            for (const [id, marker] of donuts) {
                if (!seen.has(id)) {
                    marker.remove()
                    donuts.delete(id)
                }
            }
        }
        map.on('render', syncDonuts)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mapReady, stations.data])

    return (
        <main>
            {/* карта на весь экран; таббар (z-40) поверх. Контейнеру карты
                нельзя давать fixed напрямую: maplibre вешает на него свой
                .maplibregl-map { position: relative } и перебивает класс —
                поэтому fixed на обёртке, карта растягивается по ней */}
            <div className="fixed inset-0">
                <div ref={containerRef} className="h-full w-full" />
            </div>

            {geoDenied && (
                <div className="wv-rise fixed inset-x-3 top-3 z-30 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-[13px] leading-snug text-amber-700 backdrop-blur dark:text-amber-400">
                    Геолокация недоступна — показан Бишкек.
                </div>
            )}

            {/* «к себе»: перецентровка на позицию */}
            {!geoDenied && origin && (
                <button
                    aria-label="К моей позиции"
                    onClick={() =>
                        mapRef.current?.easeTo({
                            center: [origin.lng, origin.lat],
                            zoom: 13,
                        })
                    }
                    className="fixed bottom-[calc(env(safe-area-inset-bottom)+104px)] right-3 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/95 text-[var(--wv-accent)] shadow-lg backdrop-blur active:bg-muted"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                        <circle cx="12" cy="12" r="7" />
                        <circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none" />
                        <path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5" />
                    </svg>
                </button>
            )}

            <StationSheet
                station={openedStation}
                origin={origin}
                meta={meta.data}
                onClose={() => setOpenedStation(null)}
                onReport={(s) => {
                    setOpenedStation(null)
                    setReportStation(s)
                }}
            />
            <ReportSheet
                station={reportStation}
                meta={meta.data}
                origin={origin}
                geoKnown={!geoDenied}
                onClose={() => setReportStation(null)}
            />
        </main>
    )
}
