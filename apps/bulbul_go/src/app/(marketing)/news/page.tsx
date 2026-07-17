import Link from 'next/link'
import { Newspaper, ArrowRight } from 'lucide-react'
import { newsData } from '../_data/news'

export default function NewsPage() {
    return (
        <section className="py-20 bg-white min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-12 flex items-center">
                    <Newspaper className="mr-4 text-blue-600" /> Новости сервиса
                </h1>
                <div className="grid gap-12">
                    {newsData.map((news) => (
                        <article
                            key={news.id}
                            className="flex flex-col md:flex-row gap-8 items-start border-b border-gray-100 pb-12 last:border-0"
                        >
                            <div className="w-full md:w-1/3 aspect-video rounded-2xl overflow-hidden shadow-md">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={news.image}
                                    alt={news.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center gap-4 mb-3">
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                                        {news.tag}
                                    </span>
                                    <span className="text-gray-400 text-sm">
                                        {news.date}
                                    </span>
                                </div>
                                <Link
                                    href={`/news/${news.id}`}
                                    className="text-2xl font-bold text-gray-900 mb-4 hover:text-blue-600 transition cursor-pointer block"
                                >
                                    {news.title}
                                </Link>
                                <p className="text-gray-600 mb-6">
                                    {news.preview}
                                </p>
                                <Link
                                    href={`/news/${news.id}`}
                                    className="text-blue-600 font-bold flex items-center hover:translate-x-1 transition-transform"
                                >
                                    Читать статью{' '}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
