'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { bridgeAvailable, closeWebview, setTitle } from '../../bridge'
import {
    NewsNotFound,
    fetchNews,
    type NewsArticle,
} from '../../news/lib'
import { NewsMarkdown } from '../../news/NewsMarkdown'
import { spectral } from '../../news/fonts'
import { guideCategoryLabel } from '../lib'
import '../../news/news.css'
import '../training.css'

// Страница гайда — открывается из списка (openWebPage) или пуш-диплинком
// (/home/web/training/page?url=…). Гайд — та же запись news (kind='guide'),
// поэтому рендер контента, шрифты и стили переиспользуются из news.

type Failure = 'gone' | 'error'

export default function GuidePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const router = useRouter()
    const [guide, setGuide] = useState<NewsArticle | null>(null)
    const [failed, setFailed] = useState<Failure | null>(null)

    const load = () => {
        setFailed(null)
        fetchNews(id)
            .then((g) => {
                setGuide(g)
                if (bridgeAvailable()) void setTitle(g.title)
            })
            .catch((e) =>
                setFailed(e instanceof NewsNotFound ? 'gone' : 'error'),
            )
    }
    useEffect(load, [id])

    // Экран открыт поверх приложения — закрываем его мостом. Вне приложения
    // (или если мост не ответил) уходим в список гайдов.
    const leave = () => {
        closeWebview().catch(() => router.push('/webview/training'))
    }

    return (
        <main className={`${spectral.variable} mx-auto max-w-lg px-5 pb-12 pt-5`}>
            {failed === 'gone' && (
                <div className="flex flex-col items-center gap-3 py-24 text-center">
                    <p className="font-medium">Гайд не найден</p>
                    <p className="max-w-[17rem] text-sm text-muted-foreground">
                        Похоже, его удалили или сняли с публикации.
                    </p>
                    <button
                        onClick={leave}
                        className="mt-1 rounded-full border px-5 py-2 text-sm font-medium"
                    >
                        Закрыть
                    </button>
                </div>
            )}

            {failed === 'error' && (
                <div className="flex flex-col items-center gap-3 py-24 text-center">
                    <p className="text-muted-foreground">
                        Не удалось загрузить гайд
                    </p>
                    <button
                        onClick={load}
                        className="rounded-full border px-5 py-2 text-sm font-medium"
                    >
                        Повторить
                    </button>
                </div>
            )}

            {!failed && !guide && <GuideSkeleton />}

            {guide && (
                <article>
                    <header className="news-rise">
                        {guide.category && (
                            <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--wv-accent)]">
                                {guideCategoryLabel(guide.category)}
                            </div>
                        )}
                        <h1 className="news-display mt-2 text-[22px] font-bold leading-[1.25]">
                            {guide.title}
                        </h1>
                    </header>
                    {guide.cover_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={guide.cover_url}
                            alt=""
                            className="news-rise mt-5 w-full rounded-2xl"
                            style={{ animationDelay: '80ms' }}
                        />
                    )}
                    <div
                        className="news-rise"
                        style={{ animationDelay: '140ms' }}
                    >
                        <NewsMarkdown content={guide.content} />
                    </div>
                </article>
            )}
        </main>
    )
}

function GuideSkeleton() {
    return (
        <div>
            <div className="news-skeleton h-3 w-28" />
            <div className="news-skeleton mt-4 h-7 w-full" />
            <div className="news-skeleton mt-2 h-7 w-4/5" />
            <div className="news-skeleton mt-5 aspect-[16/9] w-full !rounded-2xl" />
            <div className="mt-6 space-y-3">
                {[0, 1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="news-skeleton h-4"
                        style={{ width: `${[100, 95, 90, 100, 60][i]}%` }}
                    />
                ))}
            </div>
        </div>
    )
}
