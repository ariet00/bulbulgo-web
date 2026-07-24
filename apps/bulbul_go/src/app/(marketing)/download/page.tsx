'use client'

import { useEffect } from 'react'
import { Smartphone, Download, ArrowRight } from 'lucide-react'
import { STORE_LINKS as links } from '@/lib/store-links'

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
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-20 bg-gradient-to-br from-blue-50 to-white">
            <div className="max-w-4xl w-full text-center">
                <div className="inline-block p-4 bg-blue-100 rounded-2xl mb-8">
                    <Download className="w-12 h-12 text-blue-600 animate-bounce" />
                </div>

                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                    Скачайте <span className="text-blue-600">BulBul Go</span>
                </h1>
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
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
                        className="w-full md:w-auto flex items-center gap-4 bg-white text-black border-2 border-gray-100 px-8 py-4 rounded-2xl hover:border-blue-200 transition-all transform hover:-translate-y-1 shadow-xl"
                    >
                        <Download className="w-8 h-8 text-blue-600" />
                        <div className="text-left leading-tight">
                            <p className="text-[12px] uppercase font-medium text-gray-500">
                                Скачайте в
                            </p>
                            <p className="text-xl font-bold">App Store</p>
                        </div>
                        <ArrowRight className="w-5 h-5 ml-2 opacity-50 text-blue-600" />
                    </a>
                </div>

                <div className="mt-16 bg-white p-8 rounded-3xl shadow-sm border border-gray-100 inline-block">
                    <p className="text-sm text-gray-500 font-medium max-w-xs mx-auto">
                        BulBul Go — первое самое удобное приложение для поиска
                        попутчиков по всему Кыргызстану.
                    </p>
                </div>
            </div>
        </div>
    )
}
