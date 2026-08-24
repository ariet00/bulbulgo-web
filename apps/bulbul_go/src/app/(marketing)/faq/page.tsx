import Link from 'next/link'
import { MessageCircleQuestion, ArrowRight } from 'lucide-react'

export default function FaqPage() {
    return (
        <section className="py-20 bg-background min-h-screen">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold text-foreground mb-12 text-center">
                    Вопросы и ответы
                </h1>

                <div className="bg-card border border-border rounded-3xl shadow-sm p-12 text-center">
                    <div className="inline-block p-4 bg-blue-100 dark:bg-blue-950/50 rounded-2xl mb-6">
                        <MessageCircleQuestion className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-3">
                        Раздел наполняется
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto mb-8">
                        Скоро здесь появятся ответы на частые вопросы о
                        BulBul Go. Если вопрос есть уже сейчас — напишите нам,
                        мы отвечаем быстро.
                    </p>
                    <Link
                        href="/support"
                        className="inline-flex items-center text-blue-600 dark:text-blue-400 font-bold hover:translate-x-1 transition-transform"
                    >
                        Задать вопрос <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
