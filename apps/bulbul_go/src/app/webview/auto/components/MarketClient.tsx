'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchListings } from '../lib/api'
import { pickLabel } from '../lib/format'
import { navigateTo } from '../lib/nav'
import { useFeedStore } from '../lib/feedStore'
import {
    PAGE,
    useCatalog,
    useCategoryAttributes,
    useListingsInfinite,
    useModelOptions,
    useRates,
} from '../lib/queries'
import type { ListingFilters } from '../lib/types'
import { BottomSheet } from '../../components/BottomSheet'
import { ListingCard, ListingCardSkeleton } from './ListingCard'
import { PickerSheet } from './PickerSheet'
import {
    FilterSheet,
    countActiveFilters,
    draftToFilters,
    type FilterDraft,
} from './FilterSheet'

// Экран ленты авторынка: сегмент Продажа|Куплю, чипсы Марка/Модель/Фильтры,
// бесконечная лента карточек. Данные — React Query: справочники из общего
// кэша (staleTime 1ч), лента — SWR (возврат на экран без скелетона).

type SheetName = 'make' | 'model' | 'filters' | 'sort' | null

type SortValue = NonNullable<ListingFilters['sort']>

const SORTS: [SortValue, string][] = [
    ['fresh', 'Сначала свежие'],
    ['price_asc', 'Дешевле'],
    ['price_desc', 'Дороже'],
    ['year_desc', 'Год: новее'],
    ['mileage_asc', 'Пробег: меньше'],
]

// Пресеты-фильтры (drom-паттерн): один тап = готовый фильтр, повторный — сброс.
const PRESETS: {
    label: string
    match: (d: FilterDraft) => boolean
    toggle: (d: FilterDraft, on: boolean) => FilterDraft
}[] = [
    {
        label: 'До 10 000 $',
        match: (d) => d.priceMax === 10000 && d.priceCurrency === 'USD',
        toggle: (d, on) => ({
            ...d,
            priceMax: on ? undefined : 10000,
            priceCurrency: 'USD',
        }),
    },
    {
        label: 'Гибрид',
        match: (d) => (d.enums.fuel ?? []).includes('hybrid'),
        toggle: (d, on) => ({
            ...d,
            enums: { ...d.enums, fuel: on ? [] : ['hybrid'] },
        }),
    },
    {
        label: 'Электро',
        match: (d) => (d.enums.fuel ?? []).includes('electric'),
        toggle: (d, on) => ({
            ...d,
            enums: { ...d.enums, fuel: on ? [] : ['electric'] },
        }),
    },
    {
        label: 'Растаможен',
        match: (d) => !!d.bools.customs_cleared,
        toggle: (d, on) => ({
            ...d,
            bools: { ...d.bools, customs_cleared: !on },
        }),
    },
    {
        label: 'Руль слева',
        match: (d) => (d.enums.steering ?? []).includes('left'),
        toggle: (d, on) => ({
            ...d,
            enums: { ...d.enums, steering: on ? [] : ['left'] },
        }),
    },
]

export function MarketClient() {
    const router = useRouter()

    // ── каталог (под X-Service-Slug возвращает только корень auto) ──
    const catalogQ = useCatalog()
    const tabs = useMemo(() => {
        const auto = catalogQ.data?.find((c) => c.slug === 'auto')
        return (auto?.children ?? [])
            .filter((c) => c.is_active)
            .sort((a, b) => a.sort_order - b.sort_order)
    }, [catalogQ.data])
    const catalogError =
        catalogQ.isError || (catalogQ.isSuccess && tabs.length === 0)

    // ── фильтры: zustand-стор (переживает уход на карточку и «назад») ──
    const {
        tabId,
        kind,
        make,
        models,
        draft,
        sort,
        setKind,
        setMake,
        setModels,
        setDraft,
        setSort,
        changeTab,
    } = useFeedStore()

    // активная подкатегория-таб (Легковые/Грузовые/Мото/Запчасти/Сервисы)
    const activeTab = tabId ?? tabs[0]?.id ?? null
    const activeCat = tabs.find((t) => t.id === activeTab)
    // стороны рынка ветки (услуги — только offer)
    const tabKinds = activeCat?.kinds ?? ['offer', 'want']

    const { data: attrs = [] } = useCategoryAttributes(activeTab)
    const { data: rates = {} } = useRates()
    const hasMake = attrs.some((a) => a.key === 'make')
    const hasModel = attrs.some((a) => a.key === 'model')

    const [sheet, setSheet] = useState<SheetName>(null)
    const { data: modelOptions = [], isLoading: modelsLoading } =
        useModelOptions(make)

    // ветка без «куплю» (услуги): принудительно offer
    useEffect(() => {
        if (!tabKinds.includes(kind)) setKind('offer')
    }, [tabKinds, kind, setKind])

    // pull-to-refresh: тянем вниз от верха страницы → рефетч ленты
    // (нативного PTR у вебвью нет)
    const [pullY, setPullY] = useState(0)
    const pullStart = useRef<number | null>(null)
    const onTouchStart = (e: React.TouchEvent) => {
        pullStart.current = window.scrollY <= 0 ? e.touches[0].clientY : null
    }
    const onTouchMove = (e: React.TouchEvent) => {
        if (pullStart.current === null) return
        const dy = e.touches[0].clientY - pullStart.current
        setPullY(dy > 0 ? Math.min(dy * 0.4, 70) : 0)
    }
    const onTouchEnd = () => {
        if (pullY >= 55) void feedQ.refetch()
        setPullY(0)
        pullStart.current = null
    }

    const makeOptions = useMemo(
        () => attrs.find((a) => a.key === 'make')?.options ?? [],
        [attrs],
    )
    const optionLabel = useCallback(
        (key: string, value: string) => {
            const opt = attrs
                .find((a) => a.key === key)
                ?.options.find((o) => o.value === value)
            return opt ? pickLabel(opt.label) : value
        },
        [attrs],
    )
    const makeLabel = make
        ? pickLabel(makeOptions.find((o) => o.value === make)?.label) || make
        : null

    const filters = useMemo(
        () => ({ ...draftToFilters(draft, kind, { make, models }), sort }),
        [draft, kind, make, models, sort],
    )

    // ── лента: infinite query, ключ = категория + фильтры ──
    const feedQ = useListingsInfinite(activeTab, filters)
    const items = useMemo(
        () => feedQ.data?.pages.flatMap((p) => p.items) ?? [],
        [feedQ.data],
    )
    const total = feedQ.data?.pages[0]?.total ?? 0
    // ждём и каталог, и ленту — иначе между ними мелькает «нет объявлений»
    const loading = catalogQ.isLoading || activeTab === null || feedQ.isLoading
    const feedError = feedQ.isError

    // бесконечная прокрутка
    const sentinel = useRef<HTMLDivElement>(null)
    const { fetchNextPage, hasNextPage, isFetchingNextPage } = feedQ
    useEffect(() => {
        const el = sentinel.current
        if (!el) return
        const io = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    void fetchNextPage()
                }
            },
            { rootMargin: '600px' },
        )
        io.observe(el)
        return () => io.disconnect()
    }, [fetchNextPage, hasNextPage, isFetchingNextPage])

    const countResults = useCallback(
        async (d: FilterDraft) => {
            if (activeTab === null) return 0
            const page = await fetchListings(
                activeTab,
                draftToFilters(d, kind, { make, models }),
                0,
                1,
            )
            return page.total
        },
        [activeTab, kind, make, models],
    )

    const activeCount = countActiveFilters(draft)

    if (catalogError) {
        return (
            <div className="flex min-h-dvh flex-col items-center justify-center px-8 text-center">
                <p className="text-[17px] font-semibold">Сервис недоступен</p>
                <p className="mt-2 text-[14px] text-muted-foreground">
                    Не удалось загрузить каталог. Проверьте соединение и
                    попробуйте ещё раз.
                </p>
            </div>
        )
    }

    // высота fixed-шапки → paddingTop корня (меняется при смене ветки:
    // появляются/уходят табы, сегмент, чипсы)
    const headerRef = useRef<HTMLDivElement>(null)
    const [headerH, setHeaderH] = useState(0)
    useEffect(() => {
        const el = headerRef.current
        if (!el) return
        const ro = new ResizeObserver(() => setHeaderH(el.offsetHeight))
        ro.observe(el)
        setHeaderH(el.offsetHeight)
        return () => ro.disconnect()
    }, [])

    const chip =
        'shrink-0 rounded-full border px-3.5 py-2 text-[13px] font-medium active:bg-muted transition-colors'
    const chipActive = {
        background: 'var(--wv-accent-soft)',
        borderColor: 'var(--wv-accent-border)',
        color: 'var(--wv-accent)',
    } as React.CSSProperties

    return (
        <div
            className="min-h-dvh pb-24"
            style={{ paddingTop: headerH }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            {/* индикатор pull-to-refresh */}
            {pullY > 0 && (
                <div
                    className="flex items-center justify-center overflow-hidden text-muted-foreground transition-none"
                    style={{ height: pullY }}
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        style={{
                            transform: `rotate(${pullY * 3}deg)`,
                            opacity: Math.min(pullY / 55, 1),
                        }}
                        aria-hidden
                    >
                        <path d="M8 2a6 6 0 1 1-5.6 3.9" />
                        <path d="M2 2.6v3.6h3.6" />
                    </svg>
                </div>
            )}
            {/* сегмент рынка: прикреплён fixed'ом (sticky ломает
                overflow-x-hidden на html/body вебвью-layout); высота
                переменная (табы/сегмент/чипсы по ветке) — замеряется
                ResizeObserver'ом и компенсируется paddingTop корня */}
            <div
                ref={headerRef}
                className="fixed inset-x-0 top-0 z-20 border-b bg-background/95 px-4 pb-2.5 pt-3 backdrop-blur"
            >
                {/* табы подкатегорий (Легковые/Грузовые/Мото/Запчасти/Сервисы) */}
                {tabs.length > 1 && (
                    <div className="wv-chips -mx-4 mb-2.5 flex gap-2 overflow-x-auto px-4">
                        {tabs.map((t) => {
                            const on = t.id === activeTab
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => changeTab(t.id)}
                                    className="shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors"
                                    style={
                                        on
                                            ? {
                                                  background: 'var(--wv-primary)',
                                                  color: 'var(--wv-on-primary)',
                                              }
                                            : {
                                                  background:
                                                      'color-mix(in srgb, currentColor 8%, transparent)',
                                                  opacity: 0.8,
                                              }
                                    }
                                >
                                    {pickLabel(t.label)}
                                </button>
                            )
                        })}
                    </div>
                )}

                {/* сегмент Продажа/Куплю — только у веток с обеими сторонами */}
                {tabKinds.length > 1 && (
                    <div className="flex rounded-xl bg-muted/60 p-1 text-[14px] font-semibold">
                        {(
                            [
                                ['offer', 'Продажа'],
                                ['want', 'Куплю'],
                            ] as const
                        ).map(([k, label]) => (
                            <button
                                key={k}
                                onClick={() => setKind(k)}
                                className="flex-1 rounded-[10px] py-1.5 transition-colors"
                                style={
                                    kind === k
                                        ? {
                                              background: 'var(--wv-primary)',
                                              color: 'var(--wv-on-primary)',
                                          }
                                        : { color: 'inherit', opacity: 0.7 }
                                }
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                )}

                {/* чипсы фильтров (Марка/Модель — только у веток с этими
                    атрибутами: легковые/грузовые; у запчастей/услуг их нет) */}
                <div className="wv-chips -mx-4 mt-2.5 flex gap-2 overflow-x-auto px-4">
                    {hasMake && (
                        <button
                            className={chip}
                            style={make ? chipActive : undefined}
                            onClick={() => setSheet('make')}
                        >
                            {makeLabel ?? 'Марка'} ▾
                        </button>
                    )}
                    {hasModel && (
                        <button
                            className={`${chip} disabled:opacity-40`}
                            style={models.length ? chipActive : undefined}
                            disabled={!make}
                            onClick={() => setSheet('model')}
                        >
                            {models.length
                                ? `Модель (${models.length})`
                                : 'Модель'}{' '}
                            ▾
                        </button>
                    )}
                    <button
                        className={chip}
                        style={activeCount ? chipActive : undefined}
                        onClick={() => setSheet('filters')}
                    >
                        Фильтры{activeCount ? ` · ${activeCount}` : ''}
                    </button>
                    <button
                        className={chip}
                        style={sort !== 'fresh' ? chipActive : undefined}
                        onClick={() => setSheet('sort')}
                    >
                        {SORTS.find(([v]) => v === sort)?.[1]} ▾
                    </button>
                </div>

                {/* пресеты: готовые фильтры одним тапом */}
                <div className="wv-chips -mx-4 mt-2 flex gap-1.5 overflow-x-auto px-4">
                    {PRESETS.map((p) => {
                        const on = p.match(draft)
                        return (
                            <button
                                key={p.label}
                                onClick={() => setDraft(p.toggle(draft, on))}
                                className="shrink-0 rounded-full border px-3 py-1 text-[12px] transition-colors"
                                style={on ? chipActive : { opacity: 0.85 }}
                            >
                                {p.label}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* лента */}
            <div className="space-y-3 px-4 pt-3">
                {!loading && !feedError && total > 0 && (
                    <p className="text-[12px] text-muted-foreground">
                        {total} объявлений
                    </p>
                )}

                {loading ? (
                    <>
                        <ListingCardSkeleton />
                        <ListingCardSkeleton />
                        <ListingCardSkeleton />
                    </>
                ) : feedError ? (
                    <p className="py-16 text-center text-[14px] text-muted-foreground">
                        Не удалось загрузить объявления
                    </p>
                ) : items.length === 0 ? (
                    <div className="py-16 text-center">
                        <p className="text-[16px] font-semibold">
                            {kind === 'offer'
                                ? 'Пока нет объявлений'
                                : 'Пока нет запросов «куплю»'}
                        </p>
                        <p className="mt-1.5 text-[14px] text-muted-foreground">
                            {activeCount || make
                                ? 'Попробуйте смягчить фильтры'
                                : 'Станьте первым — подайте объявление'}
                        </p>
                    </div>
                ) : (
                    items.map((l, i) => (
                        <ListingCard
                            key={l.id}
                            listing={l}
                            rates={rates}
                            optionLabel={optionLabel}
                            delayMs={Math.min((i % PAGE) * 40, 320)}
                            onOpen={(x) =>
                                navigateTo(
                                    router,
                                    `/webview/auto/${x.id}`,
                                    typeof x.title === 'string' ? x.title : undefined,
                                )
                            }
                        />
                    ))
                )}
                <div ref={sentinel} />
            </div>

            {/* шиты */}
            <PickerSheet
                open={sheet === 'make'}
                onClose={() => setSheet(null)}
                title="Марка"
                options={makeOptions}
                selected={make ? [make] : []}
                onApply={([v]) => {
                    if (v !== make) setModels([])
                    setMake(v)
                }}
            />
            <PickerSheet
                open={sheet === 'model'}
                onClose={() => setSheet(null)}
                title={makeLabel ? `Модели ${makeLabel}` : 'Модель'}
                options={modelOptions}
                loading={modelsLoading}
                selected={models}
                multi
                onApply={setModels}
            />
            <FilterSheet
                open={sheet === 'filters'}
                onClose={() => setSheet(null)}
                attributes={attrs}
                draft={draft}
                onApply={setDraft}
                countResults={countResults}
            />
            <BottomSheet
                open={sheet === 'sort'}
                onClose={() => setSheet(null)}
                title="Сортировка"
            >
                {SORTS.map(([value, label]) => (
                    <button
                        key={value}
                        onClick={() => {
                            setSort(value)
                            setSheet(null)
                        }}
                        className="flex w-full items-center justify-between border-t py-3 text-left text-[15px] first:border-t-0"
                        style={
                            sort === value
                                ? { color: 'var(--wv-accent)', fontWeight: 600 }
                                : undefined
                        }
                    >
                        {label}
                        {sort === value && (
                            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                <path d="M2 6.5L4.8 9 10 3.5" />
                            </svg>
                        )}
                    </button>
                ))}
            </BottomSheet>
        </div>
    )
}
