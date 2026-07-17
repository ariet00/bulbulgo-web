import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { newsData } from '../../_data/news'

export default async function NewsDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const news = newsData.find((n) => n.id === parseInt(id, 10))

    if (!news) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Новость не найдена
                    </h2>
                    <Link href="/news" className="text-blue-600 hover:underline">
                        Вернуться к списку новостей
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <section className="py-20 bg-white min-h-screen">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link
                    href="/news"
                    className="flex items-center text-gray-500 hover:text-blue-600 transition mb-10 font-medium"
                >
                    <ChevronLeft className="mr-1 h-5 w-5" /> Ко всем новостям
                </Link>
                <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-8">
                    {news.title}
                </h1>
                <div className="w-full aspect-video rounded-[2rem] overflow-hidden mb-12 shadow-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={news.image}
                        alt={news.title}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="prose prose-lg text-gray-700 leading-relaxed space-y-6">
                    <p>{news.content}</p>
                </div>
            </div>
        </section>
    )
}
