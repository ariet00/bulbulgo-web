'use client'

import React, { useMemo, useState } from 'react'

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
} from '@doska/ui'
import {
  useCreateWhatsAppTemplate,
  useDeleteContentAccount,
  useDeleteWhatsAppTemplate,
  useSendWhatsAppInteractive,
  useSendWhatsAppTemplate,
  useSendWhatsAppText,
  useWhatsAppAnalytics,
  useWhatsAppConversations,
  useWhatsAppMessages,
  useWhatsAppTemplates,
  type ContentAccount,
  type CreateWhatsAppTemplateBody,
  type InteractiveButtonInput,
} from '@doska/shared'
import { useRouter } from '@doska/i18n'
import { Loader2, Plus, Send, Trash2, X } from 'lucide-react'

import { WhatsAppMediaThumb } from '@/components/whatsapp/WhatsAppMediaThumb'

interface Props {
  account: ContentAccount
}

export function WhatsAppAccountDetail({ account }: Props) {
  const router = useRouter()
  const deleteAccount = useDeleteContentAccount()
  const data = (account.data as Record<string, any>) || {}

  const handleDelete = async () => {
    if (!confirm(`Отключить WhatsApp ${account.username}?`)) return
    await deleteAccount.mutateAsync({
      platform: account.platform,
      accountId: account.id,
    })
    router.push('/')
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1">
            <Badge className="bg-green-100 text-green-700 text-[10px] uppercase">
              WhatsApp Business
            </Badge>
            <CardTitle className="text-2xl pt-2">
              {account.display_name || account.username}
            </CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  account.is_active ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              {data.display_phone_number || account.username}
              {data.quality_rating && (
                <span className="text-xs uppercase rounded bg-secondary px-1.5 py-0.5">
                  Quality: {data.quality_rating}
                </span>
              )}
              {data.code_verification_status && (
                <span className="text-xs uppercase rounded bg-secondary px-1.5 py-0.5">
                  {data.code_verification_status}
                </span>
              )}
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Отключить
          </Button>
        </CardHeader>
        {(data.waba_name || data.business_verification_status) && (
          <CardContent className="grid grid-cols-2 gap-4 pt-0">
            {data.waba_name && (
              <div>
                <p className="text-xs uppercase text-muted-foreground">WABA</p>
                <p className="text-sm">{data.waba_name}</p>
              </div>
            )}
            {data.business_verification_status && (
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Business verification
                </p>
                <p className="text-sm">{data.business_verification_status}</p>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      <Tabs defaultValue="inbox" className="w-full">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="templates">Шаблоны</TabsTrigger>
          <TabsTrigger value="analytics">Аналитика</TabsTrigger>
        </TabsList>
        <TabsContent value="inbox" className="mt-4">
          <InboxTab accountId={account.id} />
        </TabsContent>
        <TabsContent value="templates" className="mt-4">
          <TemplatesTab accountId={account.id} />
        </TabsContent>
        <TabsContent value="analytics" className="mt-4">
          <AnalyticsTab accountId={account.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ───── Inbox ───────────────────────────────────────────────────────────────

function InboxTab({ accountId }: { accountId: number }) {
  const { data: conversations, isLoading } = useWhatsAppConversations(accountId)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const { data: messages } = useWhatsAppMessages(accountId, selectedId)
  const send = useSendWhatsAppText()
  const sendTemplate = useSendWhatsAppTemplate()
  const sendInteractive = useSendWhatsAppInteractive()
  const { data: templates } = useWhatsAppTemplates(accountId)
  const [draft, setDraft] = useState('')
  const [templateName, setTemplateName] = useState('')
  const [interactiveOpen, setInteractiveOpen] = useState(false)
  const [interactiveBody, setInteractiveBody] = useState('')
  const [interactiveButtons, setInteractiveButtons] = useState<
    InteractiveButtonInput[]
  >([{ id: 'opt_1', title: '' }])

  const selectedConvo = useMemo(
    () => (conversations || []).find((c) => c.id === selectedId) || null,
    [conversations, selectedId],
  )

  const handleSendText = async () => {
    if (!selectedId || !draft.trim()) return
    await send.mutateAsync({
      accountId,
      conversationId: selectedId,
      text: draft.trim(),
    })
    setDraft('')
  }

  const handleSendTemplate = async () => {
    if (!selectedId || !templateName) return
    const tpl = (templates?.data || []).find((t) => t.name === templateName)
    await sendTemplate.mutateAsync({
      accountId,
      conversationId: selectedId,
      body: {
        template_name: templateName,
        language_code: tpl?.language || 'en_US',
      },
    })
    setTemplateName('')
  }

  const handleSendInteractive = async () => {
    if (
      !selectedId ||
      !interactiveBody.trim() ||
      interactiveButtons.some((b) => !b.title.trim())
    ) {
      return
    }
    await sendInteractive.mutateAsync({
      accountId,
      conversationId: selectedId,
      body: {
        body_text: interactiveBody.trim(),
        buttons: interactiveButtons,
      },
    })
    setInteractiveOpen(false)
    setInteractiveBody('')
    setInteractiveButtons([{ id: 'opt_1', title: '' }])
  }

  return (
    <div className="grid gap-4 md:grid-cols-[280px,1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Диалоги</CardTitle>
          <CardDescription className="text-xs">
            Входящие приходят через webhook
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[60vh] overflow-y-auto space-y-1">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {!conversations?.length && !isLoading && (
            <p className="text-sm text-muted-foreground">Пока нет диалогов.</p>
          )}
          {(conversations || []).map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`w-full text-left p-2 rounded ${
                selectedId === c.id ? 'bg-muted' : ''
              } hover:bg-muted/50`}
            >
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium truncate">
                  {c.contact_name || `+${c.contact_wa_id}`}
                </span>
                {c.unread_count > 0 && (
                  <Badge className="bg-primary text-primary-foreground text-[10px]">
                    {c.unread_count}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {c.last_message_preview || '…'}
              </p>
              {!c.free_form_window_open && (
                <p className="text-[10px] text-amber-600 mt-0.5">
                  окно 24ч закрыто — нужен шаблон
                </p>
              )}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="text-base">
            {selectedConvo
              ? selectedConvo.contact_name || `+${selectedConvo.contact_wa_id}`
              : 'Выберите диалог'}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-3 max-h-[60vh]">
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {(messages || []).map((m) => (
              <div
                key={m.id}
                className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                  m.direction === 'outbound'
                    ? 'ml-auto bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                {m.media_id ? (
                  <div className="space-y-1">
                    <WhatsAppMediaThumb
                      accountId={accountId}
                      mediaId={m.media_id}
                      msgType={m.msg_type}
                    />
                    {m.body && <p>{m.body}</p>}
                  </div>
                ) : m.body ? (
                  <span className="whitespace-pre-wrap">{m.body}</span>
                ) : (
                  <span className="italic text-xs opacity-60">
                    [{m.msg_type}]
                  </span>
                )}
                <div className="text-[10px] opacity-60 mt-0.5 flex gap-2">
                  <span>{m.sent_at.slice(11, 16)}</span>
                  {m.status && <span>· {m.status}</span>}
                  {m.error && <span className="text-red-300">· {m.error}</span>}
                </div>
              </div>
            ))}
          </div>
          {selectedConvo &&
            (selectedConvo.free_form_window_open ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Сообщение…"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                  />
                  <Button
                    onClick={handleSendText}
                    disabled={send.isPending || !draft.trim()}
                  >
                    {send.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setInteractiveOpen((o) => !o)}
                    title="Отправить кнопки"
                  >
                    + Кнопки
                  </Button>
                </div>
                {interactiveOpen && (
                  <div className="rounded border p-3 space-y-2 text-sm bg-muted/30">
                    <Label className="text-xs">Текст сообщения</Label>
                    <Input
                      value={interactiveBody}
                      onChange={(e) => setInteractiveBody(e.target.value)}
                      placeholder="Что вы хотите спросить?"
                    />
                    <Label className="text-xs">Кнопки (1-3)</Label>
                    {interactiveButtons.map((b, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={b.title}
                          onChange={(e) =>
                            setInteractiveButtons((arr) =>
                              arr.map((it, i) =>
                                i === idx
                                  ? { ...it, title: e.target.value }
                                  : it,
                              ),
                            )
                          }
                          placeholder={`Текст кнопки ${idx + 1}`}
                          maxLength={20}
                        />
                        {interactiveButtons.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setInteractiveButtons((arr) =>
                                arr.filter((_, i) => i !== idx),
                              )
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <div className="flex gap-2">
                      {interactiveButtons.length < 3 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setInteractiveButtons((arr) => [
                              ...arr,
                              {
                                id: `opt_${arr.length + 1}`,
                                title: '',
                              },
                            ])
                          }
                        >
                          <Plus className="h-3 w-3 mr-1" /> ещё
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={handleSendInteractive}
                        disabled={sendInteractive.isPending}
                      >
                        {sendInteractive.isPending && (
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        )}
                        Отправить кнопки
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 rounded border bg-amber-50 p-3 text-sm">
                <p className="text-amber-800 text-xs">
                  Окно 24ч закрыто — отправьте одобренный шаблон.
                </p>
                <div className="flex gap-2">
                  <Select value={templateName} onValueChange={setTemplateName}>
                    <SelectTrigger>
                      <SelectValue placeholder="— выбрать шаблон —" />
                    </SelectTrigger>
                    <SelectContent>
                      {(templates?.data || [])
                        .filter((t) => t.status === 'APPROVED')
                        .map((t) => (
                          <SelectItem key={t.id} value={t.name}>
                            {t.name} ({t.language})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleSendTemplate}
                    disabled={sendTemplate.isPending || !templateName}
                  >
                    {sendTemplate.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Отправить'
                    )}
                  </Button>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  )
}

// ───── Templates ───────────────────────────────────────────────────────────

function TemplatesTab({ accountId }: { accountId: number }) {
  const { data: templates, isLoading } = useWhatsAppTemplates(accountId)
  const create = useCreateWhatsAppTemplate()
  const del = useDeleteWhatsAppTemplate()
  const [form, setForm] = useState<CreateWhatsAppTemplateBody>({
    name: '',
    language: 'en_US',
    category: 'UTILITY',
    body_text: '',
    header_text: '',
    footer_text: '',
  })

  const handleCreate = async () => {
    if (!form.name.trim() || !form.body_text.trim()) return
    await create.mutateAsync({
      accountId,
      body: {
        ...form,
        header_text: form.header_text?.trim() || undefined,
        footer_text: form.footer_text?.trim() || undefined,
      },
    })
    setForm({
      name: '',
      language: 'en_US',
      category: 'UTILITY',
      body_text: '',
      header_text: '',
      footer_text: '',
    })
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Шаблоны</CardTitle>
          <CardDescription>
            Список из WABA. APPROVED можно отправлять; PENDING ждёт модерации
            Meta (24-72ч).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[60vh] overflow-y-auto">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {!templates?.data?.length && !isLoading && (
            <p className="text-sm text-muted-foreground">
              Пока нет шаблонов — создайте первый справа.
            </p>
          )}
          {(templates?.data || []).map((t) => (
            <div
              key={t.id}
              className="rounded border p-3 text-sm flex justify-between items-start gap-3"
            >
              <div className="min-w-0">
                <p className="font-medium truncate">{t.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t.language} · {t.category}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Badge
                  className={
                    t.status === 'APPROVED'
                      ? 'bg-green-100 text-green-700'
                      : t.status === 'REJECTED'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                  }
                >
                  {t.status}
                </Badge>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => {
                    if (confirm(`Удалить шаблон ${t.name}?`)) {
                      del.mutate({ accountId, templateName: t.name })
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Создать шаблон</CardTitle>
          <CardDescription>
            Текстовый шаблон. Сложные (с переменными, медиа, кнопками) — пока в
            Business Manager.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Имя (lowercase, без пробелов)</Label>
            <Input
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  name: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
                }))
              }
              placeholder="order_confirmation"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">Язык</Label>
              <Input
                value={form.language}
                onChange={(e) =>
                  setForm((f) => ({ ...f, language: e.target.value }))
                }
                placeholder="en_US"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Категория</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    category: v as CreateWhatsAppTemplateBody['category'],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTILITY">UTILITY</SelectItem>
                  <SelectItem value="MARKETING">MARKETING</SelectItem>
                  <SelectItem value="AUTHENTICATION">AUTHENTICATION</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Заголовок (опционально)</Label>
            <Input
              value={form.header_text || ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, header_text: e.target.value }))
              }
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Тело</Label>
            <textarea
              value={form.body_text}
              onChange={(e) =>
                setForm((f) => ({ ...f, body_text: e.target.value }))
              }
              rows={4}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Текст шаблона. Переменные: {{1}}, {{2}}…"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Подпись (опционально)</Label>
            <Input
              value={form.footer_text || ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, footer_text: e.target.value }))
              }
            />
          </div>
          <Button
            onClick={handleCreate}
            disabled={create.isPending || !form.name || !form.body_text}
            className="w-full"
          >
            {create.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Отправить на модерацию
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ───── Analytics ───────────────────────────────────────────────────────────

function AnalyticsTab({ accountId }: { accountId: number }) {
  const [days, setDays] = useState<number>(30)
  const { data, isLoading } = useWhatsAppAnalytics(accountId, days)

  const buckets =
    data?.conversation_analytics?.data?.[0]?.data_points ?? []
  const totals = buckets.reduce(
    (acc: any, b: any) => {
      acc.conversations += b.conversation || 0
      acc.cost += b.cost || 0
      return acc
    },
    { conversations: 0, cost: 0 },
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-base">Аналитика разговоров</CardTitle>
          <CardDescription>За выбранный период</CardDescription>
        </div>
        <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 дней</SelectItem>
            <SelectItem value="30">30 дней</SelectItem>
            <SelectItem value="90">90 дней</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!isLoading && !buckets.length && (
          <p className="text-sm text-muted-foreground">
            Данных нет. WABA начинает собирать статистику после первой
            активности.
          </p>
        )}
        {!!buckets.length && (
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded border p-3">
              <p className="text-xs uppercase text-muted-foreground">
                Разговоров
              </p>
              <p className="text-2xl font-semibold mt-1">
                {totals.conversations}
              </p>
            </div>
            <div className="rounded border p-3">
              <p className="text-xs uppercase text-muted-foreground">
                Стоимость
              </p>
              <p className="text-2xl font-semibold mt-1">
                ${totals.cost.toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
