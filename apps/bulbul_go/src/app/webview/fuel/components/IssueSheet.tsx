'use client'

// Жалоба на данные АЗС («данные неверны» / «станции больше нет»): причина из
// общего словаря жалоб (context=fuel) + опциональный комментарий. Уходит в
// админскую модерацию «Жалобы». Открывается ПОВЕРХ карточки станции
// (второй vaul-дровер стекуется над первым).

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ensureAuth } from '../../auth'
import { BottomSheet } from '../../components/BottomSheet'
import { Chip } from '../../components/Chip'
import { bridgeAvailable, haptic, toast } from '../../bridge'
import {
    IssueAlreadyReported,
    fetchIssueReasons,
    submitStationIssue,
} from '../lib/api'
import type { LatLng, Station } from '../lib/types'

async function notify(text: string, type: 'success' | 'error' | 'warning') {
    if (bridgeAvailable()) await toast(text, type).catch(() => {})
    else window.alert(text)
}

export function IssueSheet({
    station,
    origin,
    onClose,
}: {
    station: Station | null
    origin: LatLng | null
    onClose: () => void
}) {
    const [reasonId, setReasonId] = useState<number | null>(null)
    const [comment, setComment] = useState('')
    const [sending, setSending] = useState(false)

    const reasons = useQuery({
        queryKey: ['fuel', 'issue-reasons'],
        queryFn: fetchIssueReasons,
        staleTime: 3_600_000,
        enabled: station !== null,
    })

    useEffect(() => {
        if (station) {
            setReasonId(null)
            setComment('')
            setSending(false)
        }
    }, [station])

    const submit = async () => {
        if (!station || reasonId == null || sending) return
        setSending(true)
        try {
            if (!(await ensureAuth())) {
                await notify('Войдите в приложение, чтобы отправить', 'warning')
                return
            }
            await submitStationIssue(station.id, {
                reason_id: reasonId,
                comment: comment.trim() || null,
                location: origin,
            })
            void haptic('success').catch(() => {})
            await notify('Спасибо! Проверим и поправим', 'success')
            onClose()
        } catch (e) {
            if (e instanceof IssueAlreadyReported) {
                await notify('Вы уже сообщали об этой АЗС', 'warning')
                onClose()
            } else {
                void haptic('error').catch(() => {})
                await notify('Не получилось отправить — попробуйте ещё раз', 'error')
            }
        } finally {
            setSending(false)
        }
    }

    return (
        <BottomSheet
            open={station !== null}
            onClose={onClose}
            title="Ошибка в данных АЗС?"
            footer={
                <button
                    disabled={reasonId == null || sending}
                    onClick={() => void submit()}
                    className="w-full rounded-xl bg-[var(--wv-accent)] py-3 text-[15px] font-semibold text-white transition-opacity active:opacity-80 disabled:opacity-40"
                >
                    {sending ? 'Отправляем…' : 'Отправить'}
                </button>
            }
        >
            {station && (
                <div className="flex flex-col gap-4">
                    <p className="-mt-1 text-[13px] text-muted-foreground">
                        {station.name} — сообщение уйдёт модераторам.
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                        {(reasons.data ?? []).map((r) => (
                            <Chip
                                key={r.id}
                                active={reasonId === r.id}
                                onClick={() => setReasonId(r.id)}
                            >
                                {r.text}
                            </Chip>
                        ))}
                        {reasons.isLoading && (
                            <span className="wv-skeleton h-8 w-40 rounded-full" />
                        )}
                    </div>

                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Что именно не так? (необязательно)"
                        rows={3}
                        maxLength={500}
                        className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2.5 text-[14px] outline-none placeholder:text-muted-foreground/60 focus:border-[var(--wv-accent-border)]"
                    />
                </div>
            )}
        </BottomSheet>
    )
}
