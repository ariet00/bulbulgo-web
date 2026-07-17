'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Bird, Menu, X } from 'lucide-react'

const navLinks = [
    { path: '/', title: 'Главная' },
    { path: '/news', title: 'Новости' },
    { path: '/faq', title: 'Вопросы и ответы' },
    { path: '/support', title: 'Обратная связь' },
]

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const pathname = usePathname()
    const searchParams = useSearchParams()

    // Внутри вебвью приложения (?mode=app) свой хром скрываем — AppBar рисует
    // само приложение.
    if (searchParams.get('mode') === 'app') {
        return null
    }

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/'
        return pathname.startsWith(path)
    }

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link
                        href="/"
                        className="flex items-center cursor-pointer"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <Bird className="h-8 w-8 text-blue-600 mr-2" />
                        <span className="text-2xl font-bold text-blue-900 tracking-tight">
                            BulBul Go
                        </span>
                    </Link>

                    <div className="hidden md:flex space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                href={link.path}
                                className={`text-sm font-medium transition-colors ${
                                    isActive(link.path)
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-600 hover:text-blue-500'
                                }`}
                            >
                                {link.title}
                            </Link>
                        ))}
                    </div>

                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-600"
                        >
                            {isMenuOpen ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 pb-4 shadow-lg">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            href={link.path}
                            onClick={() => setIsMenuOpen(false)}
                            className="block w-full text-left px-6 py-3 text-base font-medium text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                        >
                            {link.title}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    )
}
