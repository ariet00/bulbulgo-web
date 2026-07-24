import { SearchX } from 'lucide-react'
import { Link } from '@doska/i18n'

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 pt-8 pb-20 bg-gradient-to-br from-blue-50 to-white">
            <div className="max-w-xl w-full text-center">
                <div className="inline-block p-4 bg-blue-100 rounded-2xl mb-8">
                    <SearchX className="w-12 h-12 text-blue-600" />
                </div>

                <p className="text-6xl md:text-7xl font-extrabold text-blue-600 mb-4">
                    404
                </p>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">
                    Страница не найдена
                </h1>
                <p className="text-gray-500 mb-10">
                    Такой страницы не существует или она была перемещена.
                </p>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-black text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all transform hover:-translate-y-1 shadow-xl"
                >
                    На главную
                </Link>
            </div>
        </div>
    )
}
