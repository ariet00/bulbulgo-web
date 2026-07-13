'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { bridgeAvailable, closeWebview, setTitle } from '../../bridge'
import { spectral } from '../fonts'
import {
    NewsNotFound,
    fetchNews,
    formatNewsDate,
    type NewsArticle,
} from '../lib'
import { NewsMarkdown } from '../NewsMarkdown'
import '../news.css'

// Статья — открывается пуш-диплинком (/home/web/news/page?url=…) или из
// ленты (openWebPage). Шапка нативная: заголовок приезжает из параметра
// title диплинка, а после загрузки уточняется через setTitle.

// Провал загрузки: 'gone' — новости больше нет (404 по диплинку на снятую
// статью), ретрай бессмыслен; 'error' — сбой сети/сервера, лечится повтором.
type Failure = 'gone' | 'error'

export default function NewsArticlePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = use(params)
    const router = useRouter()
    const [article, setArticle] = useState<NewsArticle | null>(null)
    const [failed, setFailed] = useState<Failure | null>(null)

    const load = () => {
        setFailed(null)
        fetchNews(id)
            .then((a) => {
                setArticle(a)
                if (bridgeAvailable()) void setTitle(a.title)
            })
            .catch((e) =>
                setFailed(e instanceof NewsNotFound ? 'gone' : 'error'),
            )
    }
    useEffect(load, [id])

    // Экран открыт поверх приложения — закрываем его мостом. Вне приложения
    // (или если мост не ответил) уходим в ленту.
    const leave = () => {
        closeWebview().catch(() => router.push('/webview/news'))
    }

    return (
        <main className={`${spectral.variable} mx-auto max-w-lg px-5 pb-12 pt-5`}>
            {failed === 'gone' && (
                <div className="flex flex-col items-center gap-3 py-24 text-center">
                    <p className="font-medium">Новость не найдена</p>
                    <p className="max-w-[17rem] text-sm text-muted-foreground">
                        Похоже, её удалили или сняли с публикации.
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
                        Не удалось загрузить новость
                    </p>
                    <button
                        onClick={load}
                        className="rounded-full border px-5 py-2 text-sm font-medium"
                    >
                        Повторить
                    </button>
                </div>
            )}

            {!failed && !article && <ArticleSkeleton />}

            {article && (
                <article>
                    <header className="news-rise">
                        <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                            <span className="mr-1.5 text-foreground/70">●</span>
                            {formatNewsDate(article.published_at)}
                        </div>
                        <h1 className="news-display mt-2 text-[22px] font-bold leading-[1.25]">
                            {article.title}
                        </h1>
                    </header>
                    {article.cover_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={article.cover_url}
                            alt=""
                            className="news-rise mt-5 w-full rounded-2xl"
                            style={{ animationDelay: '80ms' }}
                        />
                    )}
                    <div
                        className="news-rise"
                        style={{ animationDelay: '140ms' }}
                    >
                        <NewsMarkdown content={article.content} />
                    </div>
                </article>
            )}
        </main>
    )
}

function ArticleSkeleton() {
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
