'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { bridgeAvailable, openWebPage } from '../bridge'
import { Chip } from '../components/Chip'
import { EmptyState } from '../components/EmptyState'
import { fetchNewsList, type NewsListItem } from '../news/lib'
import { GUIDE_CATEGORIES, guideCategoryLabel } from './lib'
import './training.css'
import { Icon } from '../components/icons'

// Список гайдов — корневая страница webview-сервиса `training` (пункт
// «Обучение» в профиле). Контент — записи news с kind='guide' (админка,
// таб «Гайды обучения»); заголовок рисует нативный AppBar приложения.

export default function TrainingPage() {
    const router = useRouter()
    const [items, setItems] = useState<NewsListItem[] | null>(null)
    const [failed, setFailed] = useState(false)
    const [category, setCategory] = useState<string | null>(null)

    const load = () => {
        setFailed(false)
        fetchNewsList('guide')
            .then(setItems)
            .catch(() => setFailed(true))
    }
    useEffect(load, [])

    // Чипы — только категории, в которых есть гайды (и только если их > 1).
    const categories = useMemo(() => {
        const present = new Set((items ?? []).map((g) => g.category))
        return GUIDE_CATEGORIES.filter((c) => present.has(c.id))
    }, [items])

    const visible = useMemo(
        () =>
            (items ?? []).filter((g) => !category || g.category === category),
        [items, category],
    )

    const open = (g: NewsListItem) => {
        const path = `/webview/training/${g.id}`
        if (bridgeAvailable()) {
            // Отдельный нативный экран поверх списка (SPA-переход без
            // перезагрузки), назад — нативный свайп.
            void openWebPage(path, g.title)
        } else {
            router.push(path)
        }
    }

    return (
        <main className="mx-auto max-w-lg px-5 pb-10 pt-4">
            {failed && (
                <div className="flex flex-col items-center gap-3 py-24 text-center">
                    <p className="text-muted-foreground">
                        Не удалось загрузить гайды
                    </p>
                    <button
                        onClick={load}
                        className="rounded-full border px-5 py-2 text-sm font-medium"
                    >
                        Повторить
                    </button>
                </div>
            )}

            {!failed && items === null && <ListSkeleton />}

            {items?.length === 0 && (
                <EmptyState
                    icon={<Icon name="book" size={24} />}
                    title="Гайдов пока нет"
                    text="Скоро здесь появятся инструкции и видео о том, как пользоваться приложением."
                />
            )}

            {items && items.length > 0 && (
                <>
                    {categories.length > 1 && (
                        <div className="wv-chips -mx-5 mb-4 flex gap-2 overflow-x-auto px-5">
                            <Chip
                                active={category === null}
                                onClick={() => setCategory(null)}
                            >
                                Все
                            </Chip>
                            {categories.map((c) => (
                                <Chip
                                    key={c.id}
                                    active={category === c.id}
                                    onClick={() =>
                                        setCategory(
                                            category === c.id ? null : c.id,
                                        )
                                    }
                                >
                                    {c.label}
                                </Chip>
                            ))}
                        </div>
                    )}

                    <div className="divide-y divide-border/70">
                        {visible.map((g, i) => (
                            <button
                                key={g.id}
                                onClick={() => open(g)}
                                className="wv-rise flex w-full items-center gap-4 py-4 text-left active:opacity-70"
                                style={
                                    {
                                        '--wv-delay': `${Math.min(i, 8) * 40}ms`,
                                    } as React.CSSProperties
                                }
                            >
                                <div className="min-w-0 flex-1">
                                    {g.category && (
                                        <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--wv-accent)]">
                                            {guideCategoryLabel(g.category)}
                                        </div>
                                    )}
                                    <div className="mt-1 line-clamp-2 text-[15.5px] font-semibold leading-snug">
                                        {g.title}
                                    </div>
                                </div>
                                {g.cover_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={g.cover_url}
                                        alt=""
                                        className="h-[64px] w-[88px] shrink-0 rounded-xl object-cover"
                                    />
                                ) : (
                                    <div className="flex h-[64px] w-[88px] shrink-0 items-center justify-center rounded-xl bg-[var(--wv-accent-soft)] text-[var(--wv-accent)]">
                                        <Icon name="book" size={24} />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </main>
    )
}

function ListSkeleton() {
    return (
        <div className="space-y-5 pt-1">
            {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="wv-skeleton h-3 w-24 rounded" />
                        <div className="wv-skeleton mt-2.5 h-5 w-full rounded" />
                        <div className="wv-skeleton mt-1.5 h-5 w-2/3 rounded" />
                    </div>
                    <div className="wv-skeleton h-[64px] w-[88px] shrink-0 rounded-xl" />
                </div>
            ))}
        </div>
    )
}

