'use client'

import { useMemo, useState } from 'react'

import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@doska/ui'
import {
  cn,
  THREADS_AI_MODELS,
  THREADS_COLLECTOR_DEFAULT_LIMIT,
  THREADS_COLLECTOR_DEFAULT_WINDOW_HOURS,
  THREADS_COLLECTOR_MEDIA_TYPE_LABELS,
  THREADS_COLLECTOR_MEDIA_TYPES,
  THREADS_COLLECTOR_SEARCH_TYPE_LABELS,
  THREADS_COLLECTOR_SEARCH_TYPES,
  THREADS_GEN_MODE_LABELS,
  THREADS_GEN_MODES,
  THREADS_PERSONA_KIND_LABELS,
  THREADS_PERSONA_KINDS,
  THREADS_SEARCH_DAILY_QUERY_LIMIT,
  THREADS_SEARCH_MAX_LIMIT,
  threadsCollectorKeywords,
  useInvalidateThreadsGenerationPreview,
  useUpdateContentAccount,
  type ContentAccount,
  type ThreadsPersonaKind,
} from '@doska/shared'
import { Loader2, Save } from 'lucide-react'

import { Segmented } from '../Segmented'
import {
  GENERATION_TEMPLATE_PLACEHOLDERS,
  PERSONA_FIELD_KEYS,
  PERSONA_FIELDS_BY_KIND,
  PERSONA_KIND_HINTS,
  PERSONA_TEMPLATE_PLACEHOLDERS,
} from './personaFields'
import { KeywordsInput } from './KeywordsInput'
import { PromptPreview } from './PromptPreview'

type FormValue = string | number | boolean | string[]
type Form = Record<string, FormValue>

const NUMERIC_KEYS = ['persona_age', 'gen_num_posts', 'collector_limit', 'collector_window_hours'] as const

const isPersonaKind = (v: unknown): v is ThreadsPersonaKind =>
  (THREADS_PERSONA_KINDS as readonly string[]).includes(String(v))

function initialForm(data: Record<string, any>): Form {
  const form: Form = {}
  // Accounts set up before the switch existed have no persona_kind: they are people.
  form.persona_kind = isPersonaKind(data.persona_kind) ? data.persona_kind : THREADS_PERSONA_KINDS[0]
  for (const key of PERSONA_FIELD_KEYS) form[key] = data[key] ?? ''
  form.gen_num_posts = data.gen_num_posts ?? 1
  form.gen_mode = data.gen_mode || THREADS_GEN_MODES[0]
  form.ai_model = data.ai_model || THREADS_AI_MODELS[0]
  form.ai_persona_template = data.ai_persona_template || ''
  form.ai_generation_prompt = data.ai_generation_prompt || ''
  form.collector_keywords = threadsCollectorKeywords({ data })
  form.collector_search_type = data.collector_search_type || THREADS_COLLECTOR_SEARCH_TYPES[0]
  form.collector_media_type = data.collector_media_type || THREADS_COLLECTOR_MEDIA_TYPES[0]
  form.collector_limit = data.collector_limit ?? THREADS_COLLECTOR_DEFAULT_LIMIT
  form.collector_window_hours = data.collector_window_hours ?? THREADS_COLLECTOR_DEFAULT_WINDOW_HOURS
  return form
}

function toPayload(form: Form): Record<string, any> {
  const out: Record<string, any> = { ...form }
  for (const key of NUMERIC_KEYS) {
    const raw = String(form[key] ?? '').trim()
    out[key] = raw === '' ? null : Number.parseInt(raw, 10)
  }
  if (out.gen_num_posts === null || Number.isNaN(out.gen_num_posts) || out.gen_num_posts < 1) out.gen_num_posts = 1
  if (out.collector_limit === null || Number.isNaN(out.collector_limit) || out.collector_limit < 1) {
    out.collector_limit = THREADS_COLLECTOR_DEFAULT_LIMIT
  }
  if (out.collector_window_hours === null || Number.isNaN(out.collector_window_hours) || out.collector_window_hours < 0) {
    out.collector_window_hours = 0
  }
  if (Number.isNaN(out.persona_age)) out.persona_age = null
  for (const key of Object.keys(out)) {
    if (typeof out[key] === 'string') out[key] = (out[key] as string).trim()
  }
  return out
}

export function PersonaSettingsTab({ account }: { account: ContentAccount }) {
  const invalidatePreview = useInvalidateThreadsGenerationPreview()
  const update = useUpdateContentAccount()
  const [form, setForm] = useState<Form>(() => initialForm(account.data || {}))
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(initialForm(account.data || {})))
  const dirty = JSON.stringify(form) !== savedSnapshot

  const kind: ThreadsPersonaKind = isPersonaKind(form.persona_kind) ? form.persona_kind : THREADS_PERSONA_KINDS[0]
  const fields = PERSONA_FIELDS_BY_KIND[kind]
  const missing = useMemo(
    () => fields.filter((f) => f.required && !String(form[f.key] ?? '').trim()),
    [fields, form],
  )

  const set = (key: string, value: FormValue) => setForm((f) => ({ ...f, [key]: value }))
  const keywords = Array.isArray(form.collector_keywords) ? form.collector_keywords : []
  const searchTypes = form.collector_search_type === 'BOTH' ? 2 : 1

  const save = async () => {
    const payload = toPayload(form)
    await update.mutateAsync({ platform: 'threads', accountId: account.id, data: { data: payload } })
    setSavedSnapshot(JSON.stringify(form))
    void invalidatePreview()
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="space-y-6">
        {/* Persona */}
        <section className="space-y-4 rounded-xl border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium">Персона</h3>
              <p className="text-sm text-muted-foreground">{PERSONA_KIND_HINTS[kind]}</p>
            </div>
            <Segmented
              options={THREADS_PERSONA_KINDS}
              labels={THREADS_PERSONA_KIND_LABELS}
              value={kind}
              onChange={(v) => set('persona_kind', v)}
              label="От чьего имени пишет модель"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => {
              const id = `persona-${f.key}`
              const value = String(form[f.key] ?? '')
              const empty = f.required && !value.trim()
              return (
                <div key={f.key} className={cn('space-y-1.5', f.multiline && 'sm:col-span-2')}>
                  <Label htmlFor={id} className={cn(empty && 'text-destructive')}>
                    {f.label}
                    {f.required && ' *'}
                  </Label>
                  {f.multiline ? (
                    <Textarea
                      id={id}
                      value={value}
                      rows={3}
                      placeholder={f.placeholder}
                      onChange={(e) => set(f.key, e.target.value)}
                      aria-invalid={empty || undefined}
                    />
                  ) : (
                    <Input
                      id={id}
                      value={value}
                      type={f.numeric ? 'number' : 'text'}
                      inputMode={f.numeric ? 'numeric' : undefined}
                      placeholder={f.placeholder}
                      onChange={(e) => set(f.key, e.target.value)}
                      aria-invalid={empty || undefined}
                    />
                  )}
                  {f.hint && <p className="text-xs text-muted-foreground">{f.hint}</p>}
                </div>
              )
            })}
          </div>
        </section>

        {/* Generation */}
        <section className="space-y-4 rounded-xl border bg-card p-5">
          <div>
            <h3 className="font-medium">Генерация</h3>
            <p className="text-sm text-muted-foreground">Сколько, из чего и какой моделью.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="gen-num">Постов за запуск</Label>
              <Input
                id="gen-num"
                type="number"
                min={1}
                max={50}
                value={String(form.gen_num_posts ?? 1)}
                onChange={(e) => set('gen_num_posts', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gen-mode">Источник тем</Label>
              <Select value={String(form.gen_mode)} onValueChange={(v) => set('gen_mode', v)}>
                <SelectTrigger id="gen-mode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {THREADS_GEN_MODES.map((m) => (
                    <SelectItem key={m} value={m}>
                      {THREADS_GEN_MODE_LABELS[m]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gen-model">Модель</Label>
              <Select value={String(form.ai_model)} onValueChange={(v) => set('ai_model', v)}>
                <SelectTrigger id="gen-model">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {THREADS_AI_MODELS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <details className="group rounded-lg border bg-muted/30 p-4">
            <summary className="cursor-pointer text-sm font-medium">Свои шаблоны промптов</summary>
            <div className="mt-4 space-y-4">
              <p className="text-xs text-muted-foreground">
                Пустой шаблон означает встроенный текст, он виден справа в превью. В своём шаблоне можно
                использовать плейсхолдеры в фигурных скобках, пустые поля подставятся пустой строкой.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="tpl-persona">Шаблон персоны (системный промпт)</Label>
                <Textarea
                  id="tpl-persona"
                  rows={5}
                  value={String(form.ai_persona_template ?? '')}
                  onChange={(e) => set('ai_persona_template', e.target.value)}
                  placeholder={
                    kind === 'brand'
                      ? 'Ты ведёшь страницу {brand}. {context}. Пиши на {languages}, тон: {tone}.'
                      : 'Ты — {role}. {context}. Пиши на {languages}, тон: {tone}.'
                  }
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  {PERSONA_TEMPLATE_PLACEHOLDERS.map((p) => `{${p}}`).join(' ')}
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tpl-gen">Шаблон задания (пользовательский промпт)</Label>
                <Textarea
                  id="tpl-gen"
                  rows={5}
                  value={String(form.ai_generation_prompt ?? '')}
                  onChange={(e) => set('ai_generation_prompt', e.target.value)}
                  placeholder="Напиши {num_posts} постов на {languages}. Темы дня: {context_summary}"
                  className="font-mono text-xs"
                />
                <p className="text-xs text-muted-foreground">
                  {GENERATION_TEMPLATE_PLACEHOLDERS.map((p) => `{${p}}`).join(' ')}
                </p>
              </div>
            </div>
          </details>
        </section>

        {/* Collector */}
        <section className="space-y-4 rounded-xl border bg-card p-5">
          <div>
            <h3 className="font-medium">Сбор трендов</h3>
            <p className="text-sm text-muted-foreground">
              Коллектор ищет публичные посты Threads по этим словам через официальный API, а генератор берёт из
              них темы. Слово с решёткой ищется как тег.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="col-keywords">Ключевые слова и теги</Label>
            <KeywordsInput id="col-keywords" value={keywords} onChange={(next) => set('collector_keywords', next)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="col-type">Что собирать</Label>
              <Select value={String(form.collector_search_type)} onValueChange={(v) => set('collector_search_type', v)}>
                <SelectTrigger id="col-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {THREADS_COLLECTOR_SEARCH_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {THREADS_COLLECTOR_SEARCH_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="col-media">Тип постов</Label>
              <Select value={String(form.collector_media_type)} onValueChange={(v) => set('collector_media_type', v)}>
                <SelectTrigger id="col-media">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {THREADS_COLLECTOR_MEDIA_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {THREADS_COLLECTOR_MEDIA_TYPE_LABELS[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="col-limit">Постов на одно слово</Label>
              <Input
                id="col-limit"
                type="number"
                min={1}
                max={THREADS_SEARCH_MAX_LIMIT}
                value={String(form.collector_limit ?? THREADS_COLLECTOR_DEFAULT_LIMIT)}
                onChange={(e) => set('collector_limit', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="col-window">Окно для свежих, часов</Label>
              <Input
                id="col-window"
                type="number"
                min={0}
                value={String(form.collector_window_hours ?? THREADS_COLLECTOR_DEFAULT_WINDOW_HOURS)}
                onChange={(e) => set('collector_window_hours', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">0 — без ограничения по дате. На популярные не влияет.</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Один запуск: {keywords.length * searchTypes} запрос(ов) из {THREADS_SEARCH_DAILY_QUERY_LIMIT} доступных
            аккаунту в сутки.
          </p>
        </section>

        <div className="sticky bottom-4 flex items-center justify-between gap-4 rounded-xl border bg-card/95 p-3 backdrop-blur">
          <p className="text-sm text-muted-foreground">
            {missing.length > 0
              ? `Не заполнено: ${missing.map((f) => f.label.toLowerCase()).join(', ')}`
              : dirty
                ? 'Есть несохранённые изменения'
                : 'Всё сохранено'}
          </p>
          <Button onClick={save} disabled={!dirty || update.isPending}>
            {update.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Сохранить настройки
          </Button>
        </div>
      </div>

      <div className="xl:sticky xl:top-20 xl:self-start">
        <PromptPreview accountId={account.id} />
      </div>
    </div>
  )
}
