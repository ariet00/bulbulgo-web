'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@doska/ui'

const TIMEZONES = [
    'UTC',
    'Asia/Almaty',
    'Asia/Bishkek',
    'Asia/Tashkent',
    'Asia/Yekaterinburg',
    'Europe/Moscow',
    'Europe/Kiev',
]

const CURRENCIES = ['KZT', 'KGS', 'UZS', 'RUB', 'USD', 'EUR']

const COMPANY_TYPES = ['booking', 'dealership', 'shop', 'agency', 'other']

const COMPANY_STATUSES = ['active', 'moderation', 'disabled']

// Mirror of backend apps/companies/constants.py:CATEGORIES_BY_TYPE.
export const CATEGORIES_BY_TYPE: Record<string, { value: string; label: string }[]> = {
    booking: [
        { value: 'beauty_salon', label: 'Салон красоты' },
        { value: 'dentistry', label: 'Стоматология' },
        { value: 'barbershop', label: 'Барбершоп' },
    ],
    dealership: [],
    shop: [],
    agency: [],
    other: [],
}

type Props = {
    value: string | undefined
    onChange: (v: string) => void
    placeholder?: string
    className?: string
}

function makeSelect(options: string[], defaultPlaceholder: string) {
    return function StaticSelect({ value, onChange, placeholder, className }: Props) {
        return (
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className={className}>
                    <SelectValue placeholder={placeholder ?? defaultPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((o) => (
                        <SelectItem key={o} value={o}>
                            {o}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        )
    }
}

export const TimezoneSelect = makeSelect(TIMEZONES, 'Таймзона')
export const CurrencySelect = makeSelect(CURRENCIES, 'Валюта')
export const CompanyTypeSelect = makeSelect(COMPANY_TYPES, 'Тип компании')
export const CompanyStatusSelect = makeSelect(COMPANY_STATUSES, 'Статус')

type CategoryProps = Props & { type: string | undefined }

export function CompanyCategorySelect({ type, value, onChange, placeholder, className }: CategoryProps) {
    const options = (type && CATEGORIES_BY_TYPE[type]) || []
    if (options.length === 0) return null
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className={className}>
                <SelectValue placeholder={placeholder ?? 'Категория'} />
            </SelectTrigger>
            <SelectContent>
                {options.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                        {o.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}
