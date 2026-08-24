'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Bird, Smartphone, Download } from 'lucide-react'

export default function Footer() {
    const searchParams = useSearchParams()

    if (searchParams.get('mode') === 'app') {
        return null
    }

    return (
        <footer className="bg-gray-900 text-white py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div>
                        <div className="flex items-center justify-center md:justify-start mb-4">
                            <Bird className="h-6 w-6 text-blue-400 mr-2" />
                            <span className="text-xl font-bold">BulBul Go</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Инновационный сервис для поиска попутчиков.
                            Путешествуйте комфортно и безопасно по всей стране.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-bold mb-4 text-blue-400">Навигация</h4>
                            <ul className="text-gray-400 space-y-2 text-sm">
                                <li>
                                    <Link href="/">Главная</Link>
                                </li>
                                <li>
                                    <Link href="/news">Новости</Link>
                                </li>
                                <li>
                                    <Link href="/faq">Вопросы</Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4 text-blue-400">Юридически</h4>
                            <ul className="text-gray-400 space-y-2 text-sm">
                                <li>
                                    <Link href="/privacy">Политика</Link>
                                </li>
                                <li>
                                    <Link href="/terms">Условия</Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="font-bold text-blue-400">Свяжитесь с нами</h4>
                        <p className="text-sm text-gray-400">support@bulbulgo.com</p>
                        <div className="flex justify-center md:justify-start gap-4">
                            <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
                                <Smartphone size={18} />
                            </button>
                            <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
                                <Download size={18} />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
                    © {new Date().getFullYear()} BulBul Go. Сделано с любовью к
                    путешествиям.
                </div>
            </div>
        </footer>
    )
}
