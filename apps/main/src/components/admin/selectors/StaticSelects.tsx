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
