'use client'

import { Button } from '@doska/ui'
import { Construction, Send } from 'lucide-react'
import { Link } from '@doska/i18n'

// Заглушка для временно закрытых страниц старого веб-поиска. Сам функционал
// сохранён рядом в page.disabled.tsx — вернём, когда снова займёмся веб-версией.
export default function ComingSoon({
    title = 'Раздел временно недоступен',
    description = 'Мы обновляем веб-версию. Пользуйтесь мобильным приложением BulBul Go — там всё уже работает.',
}: {
    title?: string
    description?: string
}) {
    return (
        <div className="container mx-auto px-4 py-20 max-w-2xl flex flex-col items-center text-center">
            <div className="bg-primary/5 p-10 rounded-[3rem] mb-10 ring-1 ring-primary/10">
                <Construction className="h-24 w-24 text-primary animate-bounce" />
            </div>

            <h1 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {title}
            </h1>

            <p className="text-xl text-muted-foreground font-medium mb-10 leading-relaxed max-w-lg">
                {description}
            </p>

            <Button
                size="lg"
                className="h-14 rounded-2xl font-black text-lg gap-2 shadow-xl shadow-primary/20"
                asChild
            >
                <Link href="/">
                    <Send className="h-5 w-5" />
                    На главную
                </Link>
            </Button>
        </div>
    )
}
