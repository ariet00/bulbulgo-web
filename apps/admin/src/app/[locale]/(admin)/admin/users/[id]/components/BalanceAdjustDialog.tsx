'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Loader2, Minus, Plus } from 'lucide-react'
import {
    Button,
    Checkbox,
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Input,
    Label,
    Switch,
} from '@doska/ui'
import {
    BALANCE_DIRECTION_LABELS,
    type AdminBalanceDirection,
} from '@/apis/admin'
import { useAdminAdjustUserBalance } from '@/hooks/mutations/admin'

// Быстрые суммы — самые частые ручные корректировки.
const QUICK_AMOUNTS = [50, 100, 300, 500]

const DIRECTIONS: AdminBalanceDirection[] = ['income', 'expense']

export interface BalanceWalletOption {
    id: number
    name: string
    currency: string
    balance: number
    product: string
}

export function BalanceAdjustDialog({
    uid,
    wallets,
    initialType,
}: {
    uid: number
    wallets: BalanceWalletOption[]
    initialType: AdminBalanceDirection
}) {
    const [open, setOpen] = useState(false)
    const [type, setType] = useState<AdminBalanceDirection>(initialType)
    const [amount, setAmount] = useState('')
    const [walletId, setWalletId] = useState<number | null>(null)
    const [comment, setComment] = useState('')
    const [notify, setNotify] = useState(true)
    const [allowNegative, setAllowNegative] = useState(false)
    const adjust = useAdminAdjustUserBalance()

    // Первый кошелёк по умолчанию; пустой список → бэкенд возьмёт дефолтный.
    useEffect(() => {
        if (open) {
            setType(initialType)
            setAmount('')
            setComment('')
            setNotify(true)
            setAllowNegative(false)
            setWalletId(wallets[0]?.id ?? null)
        }
    }, [open, initialType, wallets])

    const value = Number(amount.replace(',', '.'))
    const valid = Number.isFinite(value) && value > 0
    const wallet = wallets.find(w => w.id === walletId)
    const currency = wallet?.currency ?? 'KGS'
    const isExpense = type === 'expense'
    // Бэкенд не пустит списание в минус без allow_negative — предупреждаем заранее.
    const overBalance = isExpense && valid && wallet != null && value > wallet.balance
    const blocked = overBalance && !allowNegative

    const submit = () => {
        if (!valid || blocked) return
        adjust.mutate(
            {
                id: uid,
                body: {
                    amount: value,
                    type,
                    ...(walletId != null ? { wallet_id: walletId } : {}),
                    ...(comment.trim() ? { comment: comment.trim() } : {}),
                    notify,
                    ...(overBalance ? { allow_negative: true } : {}),
                },
            },
            { onSuccess: () => setOpen(false) },
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="sm"
                    variant={initialType === 'income' ? 'default' : 'outline'}
                    className="gap-1.5"
                >
                    {initialType === 'income' ? (
                        <Plus className="h-4 w-4" />
                    ) : (
                        <Minus className="h-4 w-4" />
                    )}
                    {BALANCE_DIRECTION_LABELS[initialType]}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Изменить баланс</DialogTitle>
                    <DialogDescription>
                        Сумма проведётся по кошельку пользователя и попадёт в историю
                        транзакций.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex items-center gap-0.5 rounded-lg border bg-muted/40 p-0.5">
                        {DIRECTIONS.map(d => (
                            <Button
                                key={d}
                                type="button"
                                variant={type === d ? 'default' : 'ghost'}
                                size="sm"
                                className="flex-1 gap-1.5"
                                onClick={() => setType(d)}
                            >
                                {d === 'income' ? (
                                    <Plus className="h-4 w-4" />
                                ) : (
                                    <Minus className="h-4 w-4" />
                                )}
                                {BALANCE_DIRECTION_LABELS[d]}
                            </Button>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="balance-amount">Сумма</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="balance-amount"
                                inputMode="decimal"
                                autoFocus
                                placeholder="0"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && submit()}
                                className="text-lg font-semibold tabular-nums"
                            />
                            <span className="w-12 shrink-0 text-sm text-muted-foreground">
                                {currency}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {QUICK_AMOUNTS.map(q => (
                                <Button
                                    key={q}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2.5 text-xs"
                                    onClick={() => setAmount(String(q))}
                                >
                                    {isExpense ? '−' : '+'}
                                    {q}
                                </Button>
                            ))}
                            {isExpense && wallet && wallet.balance > 0 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2.5 text-xs"
                                    onClick={() => setAmount(String(wallet.balance))}
                                >
                                    Весь баланс
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Кошелёк</Label>
                        {wallets.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                У пользователя нет кошельков — будет создан кошелёк BulBul Go.
                            </p>
                        ) : (
                            <div className="grid gap-2 sm:grid-cols-2">
                                {wallets.map(w => (
                                    <button
                                        key={w.id}
                                        type="button"
                                        onClick={() => setWalletId(w.id)}
                                        className={`rounded-lg border p-2.5 text-left transition-colors ${
                                            walletId === w.id
                                                ? 'border-primary bg-primary/5'
                                                : 'hover:border-foreground/20'
                                        }`}
                                    >
                                        <div className="truncate text-sm font-medium">
                                            {w.name}
                                        </div>
                                        <div className="mt-0.5 text-xs text-muted-foreground">
                                            {w.balance.toLocaleString()} {w.currency} ·{' '}
                                            {w.product}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {overBalance && (
                        <div className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-900/60 dark:bg-amber-950/30">
                            <div className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>
                                    Списание больше баланса: на кошельке{' '}
                                    {wallet?.balance.toLocaleString()} {currency}, баланс уйдёт
                                    в минус.
                                </span>
                            </div>
                            <label className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
                                <Checkbox
                                    checked={allowNegative}
                                    onCheckedChange={v => setAllowNegative(v === true)}
                                />
                                Разрешить отрицательный баланс
                            </label>
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="balance-comment">Комментарий</Label>
                        <Input
                            id="balance-comment"
                            placeholder="Причина (видна в истории транзакций)"
                            value={comment}
                            maxLength={255}
                            onChange={e => setComment(e.target.value)}
                        />
                    </div>

                    <div className="flex items-start justify-between gap-3 rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <Label htmlFor="balance-notify">Уведомить пользователя</Label>
                            <p className="text-xs text-muted-foreground">
                                Пуш «{isExpense ? 'Списание с баланса' : 'Баланс пополнен'}» на
                                устройства пользователя.
                            </p>
                        </div>
                        <Switch
                            id="balance-notify"
                            checked={notify}
                            onCheckedChange={setNotify}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Отмена</Button>
                    </DialogClose>
                    <Button
                        onClick={submit}
                        disabled={!valid || blocked || adjust.isPending}
                        variant={isExpense ? 'destructive' : 'default'}
                        className="gap-2"
                    >
                        {adjust.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                        {BALANCE_DIRECTION_LABELS[type]}
                        {valid ? ` ${value} ${currency}` : ''}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
