import Link from 'next/link'
import { MessageCircleQuestion, ArrowRight } from 'lucide-react'

export default function FaqPage() {
    return (
        <section className="py-20 bg-gray-50 min-h-screen">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-12 text-center">
                    Вопросы и ответы
                </h1>

                <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-12 text-center">
                    <div className="inline-block p-4 bg-blue-100 rounded-2xl mb-6">
                        <MessageCircleQuestion className="w-10 h-10 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        Раздел наполняется
                    </h2>
                    <p className="text-gray-600 max-w-md mx-auto mb-8">
                        Скоро здесь появятся ответы на частые вопросы о
                        BulBul Go. Если вопрос есть уже сейчас — напишите нам,
                        мы отвечаем быстро.
                    </p>
                    <Link
                        href="/support"
                        className="inline-flex items-center text-blue-600 font-bold hover:translate-x-1 transition-transform"
                    >
                        Задать вопрос <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
