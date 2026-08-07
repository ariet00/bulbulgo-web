'use client'

import { useEffect } from 'react'
import { Smartphone, Download, ArrowRight, Apple } from 'lucide-react'
import { STORE_LINKS as links } from '@/lib/store-links'

const storeButtons = [
    { href: links.playStore, name: 'Google Play', Icon: Smartphone },
    { href: links.appStore, name: 'App Store', Icon: Apple },
]

export default function DownloadPage() {
    useEffect(() => {
        const userAgent = navigator.userAgent || navigator.vendor || ''

        if (/iPad|iPhone|iPod/.test(userAgent)) {
            window.location.href = links.appStore
        } else if (/android/i.test(userAgent)) {
            window.location.href = links.playStore
        }
    }, [])

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 pt-8 pb-20 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-background">
            <div className="max-w-4xl w-full text-center">
                <div className="inline-block p-4 bg-blue-100 dark:bg-blue-950/50 rounded-2xl mb-8">
                    <Download className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-bounce" />
                </div>

                <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6">
                    Скачайте <span className="text-blue-600 dark:text-blue-400">BulBul Go</span>
                </h1>
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                    {storeButtons.map(({ href, name, Icon }) => (
                        <a
                            key={name}
                            href={href}
                            className="w-full md:w-auto flex items-center gap-4 bg-black text-white px-8 py-4 rounded-2xl hover:bg-gray-800 transition-all transform hover:-translate-y-1 shadow-xl"
                        >
                            <Icon className="w-8 h-8" />
                            <div className="text-left leading-tight">
                                <p className="text-[12px] uppercase font-medium opacity-80">
                                    Скачайте в
                                </p>
                                <p className="text-xl font-bold">{name}</p>
                            </div>
                            <ArrowRight className="w-5 h-5 ml-2 opacity-50" />
                        </a>
                    ))}
                </div>

                <div className="mt-8 bg-card p-8 rounded-3xl shadow-sm border border-border inline-block">
                    <p className="text-sm text-muted-foreground font-medium max-w-xs mx-auto">
                        BulBul Go — первое самое удобное приложение для поиска
                        попутчиков по всему Кыргызстану.
                    </p>
                </div>
            </div>
        </div>
    )
}
