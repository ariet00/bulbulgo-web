'use client'

import { useRef, useState } from 'react'
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    ImageUploadInput,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Textarea,
} from '@doska/ui'
import { uploadFile } from '@doska/shared'
import { toast } from 'sonner'
import { Copy, ExternalLink, ImagePlus, Loader2, Video } from 'lucide-react'
import {
    GUIDE_CATEGORIES,
    GUIDE_CATEGORY_LABELS,
    type AdminNews,
    type AdminNewsInput,
    type AdminNewsKind,
    type GuideCategory,
} from '@/apis/admin'

interface NewsFormProps {
    initial?: AdminNews
    /** Вид записи для создания; при редактировании берётся из initial. */
    kind?: AdminNewsKind
    saving: boolean
    onSubmit: (values: AdminNewsInput) => void
}

// Разделы приложения для ссылок из статьи: [Текст](app:/route) → мостовой
// openRoute. Маршруты — go_router, см. app_router.dart (source of truth).
const APP_LINK_PRESETS: { route: string; label: string }[] = [
    { route: '/rideshare', label: 'Попутки' },
    { route: '/freight', label: 'Грузовые' },
    { route: '/bus', label: 'Автобусы' },
    { route: '/real_estate', label: 'Недвижимость' },
    { route: '/messages', label: 'Сообщения' },
    { route: '/profile', label: 'Профиль' },
    { route: '/profile/wallet', label: 'Кошелёк' },
    { route: '/profile/vehicles', label: 'Автомобили' },
]

// Редактор новости/гайда: markdown + inline-HTML (для <video>). Медиа
// грузятся в публичное хранилище (permanent URL) и вставляются сниппетом в
// текст. YouTube — вставить обычную ссылку на видео отдельной строкой,
// страница отрендерит плеер.
export function NewsForm({ initial, kind, saving, onSubmit }: NewsFormProps) {
    const effectiveKind: AdminNewsKind = initial?.kind ?? kind ?? 'news'
    const isGuide = effectiveKind === 'guide'
    const [title, setTitle] = useState(initial?.title ?? '')
    const [coverUrl, setCoverUrl] = useState(initial?.cover_url ?? '')
    const [status, setStatus] = useState<'draft' | 'published'>(
        initial?.status ?? 'draft',
    )
    const [category, setCategory] = useState<GuideCategory>(
        initial?.category ?? 'start',
    )
    const [position, setPosition] = useState(String(initial?.position ?? 0))
    const [content, setContent] = useState(initial?.content ?? '')
    const [uploading, setUploading] = useState<'image' | 'video' | null>(null)

    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const pendingKind = useRef<'image' | 'video'>('image')

    const insertAtCursor = (snippet: string) => {
        const el = textareaRef.current
        setContent((prev) => {
            if (!el) return `${prev}\n${snippet}\n`
            const start = el.selectionStart ?? prev.length
            const end = el.selectionEnd ?? prev.length
            return `${prev.slice(0, start)}\n${snippet}\n${prev.slice(end)}`
        })
    }

    const pickMedia = (kind: 'image' | 'video') => {
        pendingKind.current = kind
        if (fileInputRef.current) {
            fileInputRef.current.accept = kind === 'image' ? 'image/*' : 'video/*'
            fileInputRef.current.click()
        }
    }

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const kind = pendingKind.current
        setUploading(kind)
        try {
            const formData = new FormData()
            formData.append('file', file)
            const { url } = await uploadFile(formData, true)
            insertAtCursor(
                kind === 'image' ? `![](${url})` : `<video src="${url}"></video>`,
            )
        } catch {
            toast.error('Не удалось загрузить файл')
        } finally {
            setUploading(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const submit = () => {
        if (!title.trim()) {
            toast.error('Укажите заголовок')
            return
        }
        onSubmit({
            title: title.trim(),
            content,
            kind: effectiveKind,
            status,
            cover_url: coverUrl.trim() || null,
            ...(isGuide && {
                category,
                position: Number(position) || 0,
            }),
        })
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>
                        {isGuide
                            ? initial
                                ? 'Редактирование гайда'
                                : 'Новый гайд'
                            : initial
                              ? 'Редактирование новости'
                              : 'Новая новость'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="news-title">Заголовок</Label>
                        <Input
                            id="news-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Встречайте новый раздел…"
                        />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label>Обложка (необязательно)</Label>
                            <ImageUploadInput
                                value={coverUrl}
                                onChange={setCoverUrl}
                                isPublic
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Статус</Label>
                            <Select
                                value={status}
                                onValueChange={(v) =>
                                    setStatus(v as 'draft' | 'published')
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Черновик</SelectItem>
                                    <SelectItem value="published">
                                        Опубликована
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Черновики не видны в приложении.
                            </p>
                        </div>
                    </div>

                    {isGuide && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Категория</Label>
                                <Select
                                    value={category}
                                    onValueChange={(v) =>
                                        setCategory(v as GuideCategory)
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {GUIDE_CATEGORIES.map((c) => (
                                            <SelectItem key={c} value={c}>
                                                {GUIDE_CATEGORY_LABELS[c]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="guide-position">Позиция</Label>
                                <Input
                                    id="guide-position"
                                    type="number"
                                    value={position}
                                    onChange={(e) => setPosition(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Порядок в списке гайдов: меньше — выше.
                                </p>
                            </div>
                        </div>
                    )}

                    <Tabs defaultValue="edit">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <TabsList>
                                <TabsTrigger value="edit">Текст</TabsTrigger>
                                <TabsTrigger value="preview">Превью</TabsTrigger>
                            </TabsList>
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={uploading !== null}
                                    onClick={() => pickMedia('image')}
                                >
                                    {uploading === 'image' ? (
                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    ) : (
                                        <ImagePlus className="h-4 w-4 mr-1" />
                                    )}
                                    Фото
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={uploading !== null}
                                    onClick={() => pickMedia('video')}
                                >
                                    {uploading === 'video' ? (
                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                    ) : (
                                        <Video className="h-4 w-4 mr-1" />
                                    )}
                                    Видео
                                </Button>
                                <Select
                                    value=""
                                    onValueChange={(route) => {
                                        const preset = APP_LINK_PRESETS.find(
                                            (p) => p.route === route,
                                        )
                                        insertAtCursor(
                                            `[Открыть «${preset?.label ?? ''}»](app:${route})`,
                                        )
                                    }}
                                >
                                    <SelectTrigger size="sm" className="w-44">
                                        <SelectValue placeholder="Ссылка в раздел…" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {APP_LINK_PRESETS.map((p) => (
                                            <SelectItem key={p.route} value={p.route}>
                                                {p.label} — {p.route}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <TabsContent value="edit" className="mt-2">
                            <Textarea
                                ref={textareaRef}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={18}
                                className="font-mono text-sm"
                                placeholder={
                                    'Markdown: **жирный**, ## заголовок, - список, > цитата.\n' +
                                    'Фото, видео и ссылки в разделы приложения — кнопками выше.\n' +
                                    'Ссылка в раздел вручную: [Текст](app:/real_estate).\n' +
                                    'YouTube: вставьте ссылку на видео отдельной строкой — страница отрендерит плеер.'
                                }
                            />
                        </TabsContent>
                        <TabsContent value="preview" className="mt-2">
                            <div className="rounded-md border p-4 min-h-[200px] max-w-lg [&_p]:my-3 [&_p]:leading-relaxed [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-bold [&_h3]:mt-4 [&_h3]:mb-1 [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_img]:my-3 [&_img]:rounded-lg [&_video]:my-3 [&_video]:w-full [&_video]:rounded-lg [&_a]:underline">
                                {content.trim() ? (
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeRaw]}
                                        urlTransform={(url) =>
                                            url.startsWith('app:')
                                                ? url
                                                : defaultUrlTransform(url)
                                        }
                                        components={{
                                            video: ({ node: _n, ...props }) => (
                                                <video {...props} controls playsInline />
                                            ),
                                            a: ({ href, children }) =>
                                                href?.startsWith('app:') ? (
                                                    <span className="my-1 inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background">
                                                        {children} →
                                                    </span>
                                                ) : (
                                                    <a href={href}>{children}</a>
                                                ),
                                        }}
                                    >
                                        {content}
                                    </ReactMarkdown>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Пусто — напишите текст на вкладке «Текст».
                                    </p>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>

                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFile}
                    />

                    <div className="flex flex-wrap items-center gap-2">
                        <Button onClick={submit} disabled={saving}>
                            {saving && (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            )}
                            {initial ? 'Сохранить' : 'Создать'}
                        </Button>
                        {initial && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            initial.click_action,
                                        )
                                        toast.success(
                                            'Диплинк скопирован — вставьте его в click_action рассылки',
                                        )
                                    }}
                                >
                                    <Copy className="h-4 w-4 mr-1" />
                                    Диплинк для пуша
                                </Button>
                                <a
                                    href={initial.public_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button variant="outline">
                                        <ExternalLink className="h-4 w-4 mr-1" />
                                        Открыть страницу
                                    </Button>
                                </a>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
