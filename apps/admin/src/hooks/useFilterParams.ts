'use client'

import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { usePathname, useRouter } from '@doska/i18n'

type FilterValue = string | number | boolean
type Defaults = Record<string, FilterValue>

/**
 * Keeps table filters / pagination in the URL query string so they survive
 * navigation (open an item → back), refresh, and can be shared as a link.
 *
 * The URL is the single source of truth. Only non-default values are written,
 * so the address stays clean. Changing any filter other than `page` resets
 * `page` back to its default.
 *
 * Define `defaults` as a module-level constant so its identity is stable.
 */
export function useFilterParams<T extends Defaults>(defaults: T) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const router = useRouter()

    const values = useMemo(() => {
        const out: Record<string, FilterValue> = { ...defaults }
        for (const key of Object.keys(defaults)) {
            const raw = searchParams.get(key)
            if (raw === null) continue
            const def = defaults[key]
            if (typeof def === 'number') {
                const n = Number(raw)
                out[key] = raw === '' || Number.isNaN(n) ? def : n
            } else if (typeof def === 'boolean') {
                out[key] = raw === 'true'
            } else {
                out[key] = raw
            }
        }
        return out as T
    }, [searchParams, defaults])

    const setValues = useCallback(
        (patch: Partial<T>) => {
            const next = new URLSearchParams(searchParams.toString())

            // Any filter change (other than paging itself) returns to page 1.
            const changingNonPage = Object.keys(patch).some((k) => k !== 'page')
            if (changingNonPage && 'page' in defaults && !('page' in patch)) {
                next.delete('page')
            }

            for (const [k, v] of Object.entries(patch)) {
                const def = defaults[k]
                if (v === undefined || v === null || v === '' || v === def) {
                    next.delete(k)
                } else {
                    next.set(k, String(v))
                }
            }

            router.replace(
                { pathname, query: Object.fromEntries(next.entries()) },
                { scroll: false },
            )
        },
        [searchParams, defaults, router, pathname],
    )

    const reset = useCallback(() => {
        router.replace({ pathname, query: {} }, { scroll: false })
    }, [router, pathname])

    return { values, setValues, reset }
}
