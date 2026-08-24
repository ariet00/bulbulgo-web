'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
    Send,
    Mail,
    User,
    MessageSquare,
    AlertCircle,
    CheckCircle,
} from 'lucide-react'

const reasons = [
    { value: '', label: 'Выберите причину обращения' },
    { value: 'question', label: 'Общий вопрос' },
    { value: 'technical', label: 'Техническая проблема' },
    { value: 'account', label: 'Вопрос по аккаунту' },
    { value: 'data_deletion', label: 'Запрос на удаление данных' },
    { value: 'complaint', label: 'Жалоба' },
    { value: 'suggestion', label: 'Предложение' },
    { value: 'other', label: 'Другое' },
]

type FormData = {
    name: string
    email: string
    reason: string
    message: string
}

export default function ContactPage() {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        reason: '',
        message: '',
    })
    const [submitted, setSubmitted] = useState(false)
    const [errors, setErrors] = useState<Partial<FormData>>({})

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
        if (errors[name as keyof FormData]) {
            setErrors((prev) => ({ ...prev, [name]: '' }))
        }
    }

    const validateForm = () => {
        const newErrors: Partial<FormData> = {}

        if (!formData.name.trim()) {
            newErrors.name = 'Пожалуйста, введите ваше имя'
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Пожалуйста, введите email'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Пожалуйста, введите корректный email'
        }

        if (!formData.reason) {
            newErrors.reason = 'Пожалуйста, выберите причину обращения'
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Пожалуйста, введите сообщение'
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Сообщение должно содержать не менее 10 символов'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (validateForm()) {
            setSubmitted(true)
            setTimeout(() => {
                setFormData({ name: '', email: '', reason: '', message: '' })
                setSubmitted(false)
            }, 3000)
        }
    }

    return (
        <section className="py-20 bg-background min-h-screen">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-foreground mb-4">
                        Обратная связь
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Мы всегда рады вашим вопросам, предложениям и отзывам
                    </p>
                </div>

                <div className="bg-card border border-border rounded-2xl shadow-lg p-8 md:p-10">
                    {submitted ? (
                        <div className="text-center py-12">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-foreground mb-2">
                                Спасибо за ваше обращение!
                            </h2>
                            <p className="text-muted-foreground">
                                Мы свяжемся с вами в ближайшее время.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label
                                    htmlFor="name"
                                    className="flex items-center text-sm font-semibold text-foreground mb-2"
                                >
                                    <User className="w-4 h-4 mr-2 text-blue-600" />
                                    Ваше имя
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-xl border bg-background text-foreground ${
                                        errors.name
                                            ? 'border-red-500'
                                            : 'border-input'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                                    placeholder="Введите ваше имя"
                                />
                                {errors.name && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="flex items-center text-sm font-semibold text-foreground mb-2"
                                >
                                    <Mail className="w-4 h-4 mr-2 text-blue-600" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-xl border bg-background text-foreground ${
                                        errors.email
                                            ? 'border-red-500'
                                            : 'border-input'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                                    placeholder="example@mail.com"
                                />
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="reason"
                                    className="flex items-center text-sm font-semibold text-foreground mb-2"
                                >
                                    <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
                                    Причина обращения
                                </label>
                                <select
                                    id="reason"
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-3 rounded-xl border bg-background text-foreground ${
                                        errors.reason
                                            ? 'border-red-500'
                                            : 'border-input'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                                >
                                    {reasons.map((reason) => (
                                        <option
                                            key={reason.value}
                                            value={reason.value}
                                        >
                                            {reason.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.reason && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors.reason}
                                    </p>
                                )}
                            </div>

                            {formData.reason === 'data_deletion' && (
                                <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-xl p-4">
                                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                        <strong>Обратите внимание:</strong> Запрос
                                        на удаление данных будет обработан в
                                        соответствии с нашей{' '}
                                        <Link
                                            href="/privacy"
                                            className="underline hover:text-yellow-900"
                                        >
                                            Политикой конфиденциальности
                                        </Link>
                                        . Пожалуйста, укажите в сообщении, какие
                                        именно данные вы хотите удалить.
                                    </p>
                                </div>
                            )}

                            <div>
                                <label
                                    htmlFor="message"
                                    className="flex items-center text-sm font-semibold text-foreground mb-2"
                                >
                                    <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
                                    Сообщение
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={6}
                                    className={`w-full px-4 py-3 rounded-xl border bg-background text-foreground ${
                                        errors.message
                                            ? 'border-red-500'
                                            : 'border-input'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none`}
                                    placeholder="Опишите ваш вопрос или проблему..."
                                />
                                {errors.message && (
                                    <p className="mt-2 text-sm text-red-600 flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        {errors.message}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                <Send className="w-5 h-5 mr-2" />
                                Отправить сообщение
                            </button>
                        </form>
                    )}
                </div>

                <div className="mt-8 text-center text-muted-foreground">
                    <p className="text-sm">
                        Обычно мы отвечаем в течение 24 часов в рабочие дни
                    </p>
                </div>
            </div>
        </section>
    )
}
