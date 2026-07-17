'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const faqs = [
    {
        q: 'Как зарегистрироваться водителем?',
        a: 'Для регистрации водителем загрузите документы в личном кабинете. Проверка занимает до 24 часов.',
    },
    {
        q: 'Сколько стоит использование BulBul Go?',
        a: 'Поиск поездок для пассажиров бесплатен. Для водителей предусмотрена небольшая комиссия за бронь.',
    },
    {
        q: 'Безопасно ли это?',
        a: 'Мы верифицируем профили и документы каждого пользователя, а также используем систему честных отзывов.',
    },
]

export default function FaqPage() {
    const [activeFaq, setActiveFaq] = useState<number | null>(null)

    const toggleFaq = (index: number) => {
        setActiveFaq(activeFaq === index ? null : index)
    }

    return (
        <section className="py-20 bg-gray-50 min-h-screen">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-12 text-center">
                    Вопросы и ответы
                </h1>
                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
                        >
                            <button
                                onClick={() => toggleFaq(i)}
                                className="w-full flex justify-between items-center p-6 text-left hover:bg-gray-50 transition"
                            >
                                <span className="font-bold text-gray-900">
                                    {faq.q}
                                </span>
                                {activeFaq === i ? (
                                    <ChevronUp className="text-blue-600" />
                                ) : (
                                    <ChevronDown className="text-gray-400" />
                                )}
                            </button>
                            {activeFaq === i && (
                                <div className="p-6 pt-0 text-gray-600 border-t border-gray-50">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
