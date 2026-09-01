'use client'

import { useEffect, useMemo, useState } from 'react'
import {
    bridgeAvailable,
    currentLocale,
    haptic,
    onLocaleChanged,
    openRoute,
    waitForBridge,
} from '../bridge'
import { Chip } from '../components/Chip'
import { EmptyState } from '../components/EmptyState'
import {
    FAQ_CATEGORIES,
    FAQ_ITEMS,
    FAQ_UI,
    type FaqCategoryId,
    type FaqItem,
    type Localized,
} from './content'
import './faq.css'

// FAQ — webview-сервис `faq` (пункт «Частые вопросы» в профиле). Контент
// статический (content.ts, три локали); заголовок рисует нативный AppBar.

type Locale = 'ru' | 'en' | 'ky'

export default function FaqPage() {
    // ru на первом рендере (SSR), реальная локаль — после маунта: иначе
    // hydration mismatch между сервером и страницей внутри приложения.
    const [locale, setLocale] = useState<Locale>('ru')
    const [query, setQuery] = useState('')
    const [category, setCategory] = useState<FaqCategoryId | null>(null)
    const [openIds, setOpenIds] = useState<Set<string>>(new Set())
    const [inApp, setInApp] = useState(false)

    useEffect(() => {
        setLocale(currentLocale())
        void waitForBridge().then(setInApp)
        return onLocaleChanged(setLocale)
    }, [])

    const t = (l: Localized) => l[locale]

    const q = query.trim().toLowerCase()
    const items = useMemo(
        () =>
            FAQ_ITEMS.filter(
                (i) =>
                    (!category || i.category === category) &&
                    (!q ||
                        i.question[locale].toLowerCase().includes(q) ||
                        i.answer[locale].toLowerCase().includes(q)),
            ),
        [category, q, locale],
    )

    const toggle = (id: string) => {
        if (bridgeAvailable()) void haptic('selection')
        setOpenIds((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    return (
        <main className="mx-auto max-w-lg px-5 pb-10">
            <div className="sticky top-0 z-10 -mx-5 bg-background/90 px-5 pb-3 pt-4 backdrop-blur">
                <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <SearchIcon />
                    </span>
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t(FAQ_UI.searchPlaceholder)}
                        className="h-11 w-full rounded-2xl border bg-muted/40 pl-10 pr-9 text-[15px] outline-none transition-colors focus:border-[var(--wv-accent-border)]"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            aria-label="Clear"
                            className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
                        >
                            <ClearIcon />
                        </button>
                    )}
                </div>

                <div className="wv-chips -mx-5 mt-3 flex gap-2 overflow-x-auto px-5">
                    <Chip
                        active={category === null}
                        onClick={() => setCategory(null)}
                    >
                        {t(FAQ_UI.allChip)}
                    </Chip>
                    {FAQ_CATEGORIES.map((c) => (
                        <Chip
                            key={c.id}
                            active={category === c.id}
                            onClick={() =>
                                setCategory(category === c.id ? null : c.id)
                            }
                        >
                            {t(c.label)}
                        </Chip>
                    ))}
                </div>
            </div>

            {items.length === 0 ? (
                <EmptyState
                    icon={<SearchIcon />}
                    title={t(FAQ_UI.notFoundTitle)}
                    text={t(FAQ_UI.notFoundText)}
                />
            ) : (
                <div className="divide-y divide-border/70">
                    {items.map((item, i) => (
                        <FaqRow
                            key={item.id}
                            item={item}
                            locale={locale}
                            query={q}
                            open={openIds.has(item.id)}
                            onToggle={() => toggle(item.id)}
                            delay={i * 40}
                        />
                    ))}
                </div>
            )}

            {inApp && (
                <div className="mt-8 rounded-3xl border bg-muted/30 p-5 text-center">
                    <p className="text-[15px] font-semibold">
                        {t(FAQ_UI.ctaTitle)}
                    </p>
                    <p className="mt-1 text-[13.5px] leading-snug text-muted-foreground">
                        {t(FAQ_UI.ctaText)}
                    </p>
                    <button
                        onClick={() => void openRoute('/support')}
                        className="mt-4 h-11 w-full rounded-2xl bg-[var(--wv-accent)] text-[15px] font-semibold text-white active:opacity-85"
                    >
                        {t(FAQ_UI.ctaButton)}
                    </button>
                </div>
            )}
        </main>
    )
}

function FaqRow({
    item,
    locale,
    query,
    open,
    onToggle,
    delay,
}: {
    item: FaqItem
    locale: Locale
    query: string
    open: boolean
    onToggle: () => void
    delay: number
}) {
    return (
        <div
            className="wv-rise"
            style={{ '--wv-delay': `${delay}ms` } as React.CSSProperties}
        >
            <button
                onClick={onToggle}
                className="flex w-full items-start gap-3 py-4 text-left"
            >
                <span
                    className={`flex-1 text-[15px] font-medium leading-snug transition-colors ${
                        open ? 'text-[var(--wv-accent)]' : ''
                    }`}
                >
                    <Highlight text={item.question[locale]} query={query} />
                </span>
                <span
                    className={`mt-0.5 shrink-0 transition-transform duration-300 ${
                        open
                            ? 'rotate-180 text-[var(--wv-accent)]'
                            : 'text-muted-foreground/60'
                    }`}
                >
                    <ChevronIcon />
                </span>
            </button>
            <div
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
            >
                <div className="overflow-hidden">
                    <p className="pb-4 pr-8 text-[14.5px] leading-relaxed text-muted-foreground">
                        {item.answer[locale]}
                    </p>
                </div>
            </div>
        </div>
    )
}

// Подсветка первого совпадения поискового запроса в вопросе.
function Highlight({ text, query }: { text: string; query: string }) {
    if (!query) return <>{text}</>
    const idx = text.toLowerCase().indexOf(query)
    if (idx === -1) return <>{text}</>
    return (
        <>
            {text.slice(0, idx)}
            <mark className="rounded bg-[var(--wv-accent-soft)] text-[var(--wv-accent)]">
                {text.slice(idx, idx + query.length)}
            </mark>
            {text.slice(idx + query.length)}
        </>
    )
}

function SearchIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
        >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
        </svg>
    )
}

function ClearIcon() {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
        >
            <path d="M6 6l12 12M18 6 6 18" />
        </svg>
    )
}

function ChevronIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
        >
            <path d="m6 9 6 6 6-6" />
        </svg>
    )
}
