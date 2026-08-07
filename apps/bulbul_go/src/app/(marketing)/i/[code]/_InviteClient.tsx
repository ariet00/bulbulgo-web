'use client'

import { useEffect, useState } from 'react'
import { Smartphone, Download, ArrowRight, Copy, Check, Gift } from 'lucide-react'
import { STORE_LINKS as links } from '@/lib/store-links'

/// Инвайт-лендинг: показывает промокод, кладёт его в буфер обмена (в приложении
/// человек вставит его в поле «У меня есть промокод» на экране номера) и ведёт
/// в стор. `/i/*` исключён из universal/app links (AASA + AndroidManifest), так
/// что страница открывается в браузере и с установленным приложением.
export default function InviteClient({ code }: { code: string }) {
    const [copied, setCopied] = useState(false)

    // Копируем код в буфер сразу — так приложение подхватит его автоподстановкой.
    useEffect(() => {
        navigator.clipboard?.writeText(code).catch(() => {})
    }, [code])

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(code)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            /* буфер недоступен — пользователь перепишет код вручную */
        }
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-background">
            <div className="max-w-2xl w-full text-center">
                <div className="inline-block p-4 bg-blue-100 dark:bg-blue-950/50 rounded-2xl mb-8">
                    <Gift className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                </div>

                <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
                    Вас пригласил друг в{' '}
                    <span className="text-blue-600 dark:text-blue-400">BulBul Go</span>
                </h1>

                <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
                    Установите приложение и введите промокод при входе по
                    номеру телефона — и находите попутчиков по всему
                    Кыргызстану.
                </p>

                {/* Промокод */}
                <div className="mb-10">
                    <p className="text-sm font-medium text-muted-foreground mb-3">
                        Ваш промокод
                    </p>
                    <button
                        onClick={copy}
                        className="group inline-flex items-center gap-4 bg-card border-2 border-blue-100 dark:border-blue-900 hover:border-blue-300 dark:hover:border-blue-700 rounded-2xl px-8 py-5 shadow-lg transition-all"
                    >
                        <span className="text-3xl md:text-4xl font-bold tracking-[0.3em] text-foreground">
                            {code}
                        </span>
                        {copied ? (
                            <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
                        ) : (
                            <Copy className="w-6 h-6 text-blue-600 dark:text-blue-400 opacity-70 group-hover:opacity-100" />
                        )}
                    </button>
                    <p className="text-xs text-muted-foreground mt-3">
                        {copied
                            ? 'Код скопирован'
                            : 'Нажмите, чтобы скопировать'}
                    </p>
                </div>

                {/* Сторы */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    <a
                        href={links.playStore}
                        className="w-full md:w-auto flex items-center gap-4 bg-black text-white px-8 py-4 rounded-2xl hover:bg-gray-800 transition-all transform hover:-translate-y-1 shadow-xl"
                    >
                        <Smartphone className="w-8 h-8" />
                        <div className="text-left leading-tight">
                            <p className="text-[12px] uppercase font-medium opacity-80">
                                Доступно в
                            </p>
                            <p className="text-xl font-bold">Google Play</p>
                        </div>
                        <ArrowRight className="w-5 h-5 ml-2 opacity-50" />
                    </a>

                    <a
                        href={links.appStore}
                        className="w-full md:w-auto flex items-center gap-4 bg-card text-foreground border-2 border-border px-8 py-4 rounded-2xl hover:border-blue-300 dark:hover:border-blue-700 transition-all transform hover:-translate-y-1 shadow-xl"
                    >
                        <Download className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        <div className="text-left leading-tight">
                            <p className="text-[12px] uppercase font-medium text-muted-foreground">
                                Скачайте в
                            </p>
                            <p className="text-xl font-bold">App Store</p>
                        </div>
                        <ArrowRight className="w-5 h-5 ml-2 opacity-50 text-blue-600 dark:text-blue-400" />
                    </a>
                </div>

                <p className="mt-12 text-sm text-muted-foreground max-w-md mx-auto">
                    Промокод скопирован в буфер обмена — вставьте его в поле
                    «У меня есть промокод» на экране входа.
                </p>
            </div>
        </div>
    )
}
