'use client'

import { useEffect, useMemo, useState } from 'react'
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Switch,
    Textarea,
} from '@doska/ui'
import {
    IMPLEMENTED_MODERATION_ACTIONS,
    MIN_STOP_WORD_LENGTH,
    MODERATION_ACTIONS,
    MODERATION_ACTION_LABELS,
    ModerationAction,
    ModerationConfig,
} from '@/apis/admin'
import { useAdminModerationSettings } from '@/hooks/queries/admin'
import { useAdminUpdateModerationSettings } from '@/hooks/mutations/admin'

/** Слово короче лимита с допуском разделителей матчит пол-чата — бэкенд такое
 * не принимает, поэтому ловим до отправки. Хвостовая `*` в счёт не идёт. */
const tooShort = (word: string) => {
    const letters = word.replace(/\*$/, '').match(/\p{L}/gu) ?? []
    return letters.length < MIN_STOP_WORD_LENGTH
}

const parseWords = (raw: string) =>
    raw
        .split('\n')
        .map((w) => w.trim())
        .filter(Boolean)

export function ModerationSettingsForm() {
    const { data, isLoading, error } = useAdminModerationSettings()
    const save = useAdminUpdateModerationSettings()

    const [enabled, setEnabled] = useState(true)
    const [checkEdited, setCheckEdited] = useState(true)
    const [exemptAdmins, setExemptAdmins] = useState(true)
    const [ruleEnabled, setRuleEnabled] = useState(true)
    const [action, setAction] = useState<ModerationAction>('delete')
    const [wordsText, setWordsText] = useState('')
    const [linksEnabled, setLinksEnabled] = useState(false)
    const [linksAction, setLinksAction] = useState<ModerationAction>('delete')
    const [allowTelegram, setAllowTelegram] = useState(false)
    const [allowDomainsText, setAllowDomainsText] = useState('')

    useEffect(() => {
        if (!data) return
        const c = data.config
        setEnabled(c.enabled)
        setCheckEdited(c.check_edited)
        setExemptAdmins(c.exempt.admins)
        setRuleEnabled(c.rules.stop_words.enabled)
        setAction(c.rules.stop_words.action)
        setWordsText(c.rules.stop_words.words.join('\n'))
        setLinksEnabled(c.rules.links.enabled)
        setLinksAction(c.rules.links.action)
        setAllowTelegram(c.rules.links.allow_telegram)
        setAllowDomainsText(c.rules.links.allow_domains.join('\n'))
    }, [data])

    const words = useMemo(() => parseWords(wordsText), [wordsText])
    const invalidWords = useMemo(() => words.filter(tooShort), [words])
    const allowDomains = useMemo(() => parseWords(allowDomainsText), [allowDomainsText])
    // Бэкенд отвергает строку без точки — ловим до отправки.
    const invalidDomains = useMemo(
        () => allowDomains.filter((d) => !d.replace(/^https?:\/\//, '').split('/')[0].includes('.')),
        [allowDomains],
    )

    if (isLoading) return <div className="text-sm text-muted-foreground">Загрузка…</div>

    if (error || !data) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Бот-модератор не подключён</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>
                        Заведите бота в BotFather и добавьте строку в <code>telegram.bots</code> с{' '}
                        <code>bot_type=&apos;moderator&apos;</code>.
                    </p>
                    <p>
                        Затем выключите у бота privacy mode и выдайте ему права администратора
                        с удалением сообщений в каждой группе.
                    </p>
                </CardContent>
            </Card>
        )
    }

    const submit = () => {
        const config: ModerationConfig = {
            enabled,
            check_edited: checkEdited,
            exempt: { admins: exemptAdmins },
            rules: {
                stop_words: { enabled: ruleEnabled, action, words },
                links: {
                    enabled: linksEnabled,
                    action: linksAction,
                    allow_domains: allowDomains,
                    allow_telegram: allowTelegram,
                },
            },
        }
        save.mutate(config)
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between gap-2">
                    <CardTitle>Бот</CardTitle>
                    <Badge variant="outline">
                        {data.bot_name ?? data.bot_slug} · {data.bot_slug}
                    </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Toggle
                        id="moderation-enabled"
                        label="Модерация включена"
                        hint="Выключатель для всех групп сразу"
                        checked={enabled}
                        onChange={setEnabled}
                    />
                    <Toggle
                        id="moderation-edited"
                        label="Проверять отредактированные сообщения"
                        hint="Иначе запрещённое слово можно дописать правкой"
                        checked={checkEdited}
                        onChange={setCheckEdited}
                    />
                    <Toggle
                        id="moderation-admins"
                        label="Пропускать администраторов группы"
                        hint="Состав админов кэшируется на 10 минут"
                        checked={exemptAdmins}
                        onChange={setExemptAdmins}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Стоп-слова</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Toggle
                        id="rule-stop-words"
                        label="Правило включено"
                        checked={ruleEnabled}
                        onChange={setRuleEnabled}
                    />

                    <div className="space-y-1.5 max-w-xs">
                        <Label>Действие при совпадении</Label>
                        <Select value={action} onValueChange={(v) => setAction(v as ModerationAction)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {MODERATION_ACTIONS.map((a) => (
                                    <SelectItem
                                        key={a}
                                        value={a}
                                        disabled={!IMPLEMENTED_MODERATION_ACTIONS.includes(a)}
                                    >
                                        {MODERATION_ACTION_LABELS[a]}
                                        {!IMPLEMENTED_MODERATION_ACTIONS.includes(a) && ' — скоро'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="stop-words">Список слов</Label>
                        <Textarea
                            id="stop-words"
                            rows={12}
                            value={wordsText}
                            onChange={(e) => setWordsText(e.target.value)}
                            placeholder={'казино\nставки*'}
                            className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                            По одному слову в строке. Совпадение — по целому слову; чтобы
                            ловить окончания, добавьте <code>*</code> в конце (<code>ставки*</code> →
                            «ставками»). Регистр, повторы букв, латинские двойники и разделители
                            внутри слова учитываются автоматически.
                        </p>
                        <p className="text-xs text-muted-foreground">Слов в списке: {words.length}</p>
                        {invalidWords.length > 0 && (
                            <p className="text-xs text-destructive">
                                Слишком короткие (нужно минимум {MIN_STOP_WORD_LENGTH} букв):{' '}
                                {invalidWords.join(', ')}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Ссылки</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Toggle
                        id="rule-links"
                        label="Удалять сообщения со ссылками"
                        hint="Ловятся и адреса в тексте, и ссылки, спрятанные за словом"
                        checked={linksEnabled}
                        onChange={setLinksEnabled}
                    />
                    <Toggle
                        id="rule-links-telegram"
                        label="Разрешить ссылки на Telegram"
                        hint="t.me и родственные хосты — например, ссылки на ваши каналы"
                        checked={allowTelegram}
                        onChange={setAllowTelegram}
                    />

                    <div className="space-y-1.5 max-w-xs">
                        <Label>Действие при совпадении</Label>
                        <Select
                            value={linksAction}
                            onValueChange={(v) => setLinksAction(v as ModerationAction)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {MODERATION_ACTIONS.map((a) => (
                                    <SelectItem
                                        key={a}
                                        value={a}
                                        disabled={!IMPLEMENTED_MODERATION_ACTIONS.includes(a)}
                                    >
                                        {MODERATION_ACTION_LABELS[a]}
                                        {!IMPLEMENTED_MODERATION_ACTIONS.includes(a) && ' — скоро'}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="allow-domains">Домены-исключения</Label>
                        <Textarea
                            id="allow-domains"
                            rows={5}
                            value={allowDomainsText}
                            onChange={(e) => setAllowDomainsText(e.target.value)}
                            placeholder={'bulbul.asia\ninstagram.com'}
                            className="font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                            По одному домену в строке. Поддомены разрешаются вместе с
                            доменом: <code>bulbul.asia</code> пропускает и{' '}
                            <code>app.bulbul.asia</code>.
                        </p>
                        {invalidDomains.length > 0 && (
                            <p className="text-xs text-destructive">
                                Не похоже на домены: {invalidDomains.join(', ')}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center gap-3">
                <Button
                    onClick={submit}
                    disabled={
                        save.isPending || invalidWords.length > 0 || invalidDomains.length > 0
                    }
                >
                    {save.isPending ? 'Сохраняю…' : 'Сохранить'}
                </Button>
                <span className="text-xs text-muted-foreground">
                    Бот подхватит изменения сразу — перезапуск не нужен.
                </span>
            </div>
        </div>
    )
}

function Toggle({
    id,
    label,
    hint,
    checked,
    onChange,
}: {
    id: string
    label: string
    hint?: string
    checked: boolean
    onChange: (v: boolean) => void
}) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div className="space-y-0.5">
                <Label htmlFor={id}>{label}</Label>
                {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            </div>
            <Switch id={id} checked={checked} onCheckedChange={onChange} />
        </div>
    )
}
