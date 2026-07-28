'use client'

// React Query-хуки «Где Бензин». Meta — справочник (staleTime 1 час);
// станции — SWR с фоновым рефетчем и refetch на возврат в приложение
// (статусы живут минутами); карточка — мгновенный рендер из кэша списка.

import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchMeta, fetchStation, fetchStations } from './api'
import type { LatLng, Station } from './types'

const HOUR = 3_600_000

export const qk = {
    meta: ['fuel', 'meta'] as const,
    stations: (origin: LatLng | null, fuelType: string | null) =>
        [
            'fuel',
            'stations',
            // ~110 м точности достаточно — не перезапрашиваем на каждый метр
            origin ? `${origin.lat.toFixed(3)},${origin.lng.toFixed(3)}` : 'none',
            fuelType ?? 'all',
        ] as const,
    station: (id: number) => ['fuel', 'station', id] as const,
}

export function useFuelMeta() {
    return useQuery({ queryKey: qk.meta, queryFn: fetchMeta, staleTime: HOUR })
}

export function useStations(origin: LatLng | null, fuelType: string | null) {
    return useQuery({
        queryKey: qk.stations(origin, fuelType),
        queryFn: () => fetchStations(origin!, { fuelType }),
        enabled: origin !== null,
        // краудсорс-статусы протухают быстро — держим список живым
        staleTime: 60_000,
        refetchOnWindowFocus: true,
        // смена ключа (уточнилась позиция, сменился фильтр) не сбрасывает
        // список в скелетон — старые данные видны до прихода новых
        placeholderData: keepPreviousData,
    })
}

export function useStation(id: number | null, origin: LatLng | null) {
    const qc = useQueryClient()
    return useQuery({
        queryKey: qk.station(id ?? 0),
        queryFn: () => fetchStation(id!, origin),
        enabled: id !== null,
        placeholderData: () => {
            for (const [, data] of qc.getQueriesData<Station[]>({
                queryKey: ['fuel', 'stations'],
            })) {
                const hit = data?.find((s) => s.id === id)
                if (hit) return hit ? { ...hit, phone: null, working_hours: null, reports: [] } : undefined
            }
            return undefined
        },
    })
}

/** После отправки репорта: протухнуть ленту, карту, карточку станции и
 * «Мои метки» — везде, где виден агрегат статусов. */
export function useFuelInvalidation() {
    const qc = useQueryClient()
    return (stationId: number) => {
        void qc.invalidateQueries({ queryKey: ['fuel', 'stations'] })
        void qc.invalidateQueries({ queryKey: ['fuel', 'map-stations'] })
        void qc.invalidateQueries({ queryKey: qk.station(stationId) })
        void qc.invalidateQueries({ queryKey: ['fuel', 'my-reports'] })
    }
}
