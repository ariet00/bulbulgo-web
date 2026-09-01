'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { bridgeAvailable, openWebPage } from '../bridge'
import { spectral } from './fonts'
import { fetchNewsList, formatNewsDate, type NewsListItem } from './lib'
import './news.css'

// Лента новостей — корневая страница webview-сервиса `news` (карточка
// «Новости» на Главной). Заголовок рисует нативный AppBar приложения.

export default function NewsFeedPage() {
    const router = useRouter()
    const [items, setItems] = useState<NewsListItem[] | null>(null)
    const [failed, setFailed] = useState(false)

    const load = () => {
        setFailed(false)
        fetchNewsList()
            .then(setItems)
            .catch(() => setFailed(true))
    }
    useEffect(load, [])

    const open = (n: NewsListItem) => {
        const path = `/webview/news/${n.id}`
        if (bridgeAvailable()) {
            // Отдельный нативный экран поверх ленты (SPA-переход без
            // перезагрузки), назад — нативный свайп.
            void openWebPage(path, n.title)
        } else {
            router.push(path)
        }
    }

    return (
        <main className={`${spectral.variable} mx-auto max-w-lg px-5 pb-10 pt-4`}>
            {failed && (
                <div className="flex flex-col items-center gap-3 py-24 text-center">
                    <p className="text-muted-foreground">
                        Не удалось загрузить новости
                    </p>
                    <button
                        onClick={load}
                        className="rounded-full border px-5 py-2 text-sm font-medium"
                    >
                        Повторить
                    </button>
                </div>
            )}

            {!failed && items === null && <FeedSkeleton />}

            {items?.length === 0 && <EmptyFeed />}

            {items && items.length > 0 && (
                <div className="space-y-7">
                    {items.map((n, i) => (
                        <article
                            key={n.id}
                            className="news-rise"
                            style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
                        >
                            <button
                                onClick={() => open(n)}
                                className="block w-full text-left active:opacity-70"
                            >
                                {i === 0 ? <HeroCard n={n} /> : <RowCard n={n} />}
                            </button>
                            {i === 0 && items.length > 1 && (
                                <div className="mt-7 border-t" />
                            )}
                        </article>
                    ))}
                </div>
            )}
        </main>
    )
}

// Первая новость — крупно: обложка на всю ширину, заголовок под ней.
function HeroCard({ n }: { n: NewsListItem }) {
    return (
        <div>
            {n.cover_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={n.cover_url}
                    alt=""
                    className="mb-4 aspect-[16/9] w-full rounded-2xl object-cover"
                />
            )}
            <Dateline date={n.published_at} />
            <h2 className="news-display mt-1.5 text-[20px] font-bold leading-[1.25]">
                {n.title}
            </h2>
        </div>
    )
}

// Остальные — компактной строкой: текст слева, миниатюра справа.
function RowCard({ n }: { n: NewsListItem }) {
    return (
        <div className="flex items-start gap-4">
            <div className="min-w-0 flex-1">
                <Dateline date={n.published_at} />
                <h3 className="news-display mt-1 line-clamp-3 text-[17px] font-semibold leading-snug">
                    {n.title}
                </h3>
            </div>
            {n.cover_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={n.cover_url}
                    alt=""
                    className="h-[72px] w-[96px] shrink-0 rounded-xl object-cover"
                />
            )}
        </div>
    )
}

// Пустая лента — парящая иллюстрация вместо голого текста.
function EmptyFeed() {
    return (
        <div className="news-rise flex flex-col items-center px-6 py-24 text-center">
            <div className="news-float flex h-20 w-20 items-center justify-center rounded-3xl bg-foreground/[0.05] text-foreground/60">
                <NewspaperIcon />
            </div>
            <h2 className="news-display mt-6 text-[19px] font-bold">
                Пока нет новостей
            </h2>
            <p className="mt-2 max-w-[260px] text-sm leading-relaxed text-muted-foreground">
                Здесь появятся новости и обновления BulBul Go — загляните
                позже.
            </p>
        </div>
    )
}

function NewspaperIcon() {
    return (
        <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
        >
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
            <path d="M18 14h-8" />
            <path d="M15 18h-5" />
            <path d="M10 6h8v4h-8V6Z" />
        </svg>
    )
}

function Dateline({ date }: { date: string | null }) {
    if (!date) return null
    return (
        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <span className="mr-1.5 text-foreground/70">●</span>
            {formatNewsDate(date)}
        </div>
    )
}

function FeedSkeleton() {
    return (
        <div className="space-y-7">
            <div>
                <div className="news-skeleton mb-4 aspect-[16/9] w-full !rounded-2xl" />
                <div className="news-skeleton h-3 w-28" />
                <div className="news-skeleton mt-3 h-6 w-full" />
                <div className="news-skeleton mt-2 h-6 w-3/4" />
            </div>
            {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-start gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="news-skeleton h-3 w-24" />
                        <div className="news-skeleton mt-3 h-5 w-full" />
                        <div className="news-skeleton mt-2 h-5 w-2/3" />
                    </div>
                    <div className="news-skeleton h-[72px] w-[96px] shrink-0 !rounded-xl" />
                </div>
            ))}
        </div>
    )
}
