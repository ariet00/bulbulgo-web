import Link from 'next/link'
import { Newspaper, ArrowRight } from 'lucide-react'

export default function NewsPage() {
    return (
        <section className="py-20 bg-background min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold text-foreground mb-12 flex items-center">
                    <Newspaper className="mr-4 text-blue-600 dark:text-blue-400" /> Новости сервиса
                </h1>

                <div className="bg-muted/50 border border-border rounded-3xl p-12 text-center">
                    <div className="inline-block p-4 bg-blue-100 dark:bg-blue-950/50 rounded-2xl mb-6">
                        <Newspaper className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-3">
                        Скоро здесь появятся новости
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto mb-8">
                        Мы готовим раздел с новостями и обновлениями BulBul Go.
                        Загляните сюда чуть позже.
                    </p>
                    <Link
                        href="/download"
                        className="inline-flex items-center text-blue-600 dark:text-blue-400 font-bold hover:translate-x-1 transition-transform"
                    >
                        А пока — скачайте приложение{' '}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
