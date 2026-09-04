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
  Switch,
  Textarea,
} from '@doska/ui'
import {
  cn,
  THREADS_AI_MODELS,
  THREADS_GEN_MODE_LABELS,
  THREADS_GEN_MODES,
  useInvalidateThreadsGenerationPreview,
  useUpdateContentAccount,
  type ContentAccount,
} from '@doska/shared'
import { Loader2, Save } from 'lucide-react'

import {
  GENERATION_TEMPLATE_PLACEHOLDERS,
  PERSONA_FIELDS,
  PERSONA_TEMPLATE_PLACEHOLDERS,
} from './personaFields'
import { PromptPreview } from './PromptPreview'

type Form = Record<string, string | number | boolean>

const NUMERIC_KEYS = ['persona_age', 'gen_num_posts', 'collector_limit', 'collector_min_likes'] as const

function initialForm(data: Record<string, any>): Form {
  const form: Form = {}
  for (const f of PERSONA_FIELDS) form[f.key] = data[f.key] ?? ''
  form.gen_num_posts = data.gen_num_posts ?? 1
  form.gen_mode = data.gen_mode || THREADS_GEN_MODES[0]
  form.ai_model = data.ai_model || THREADS_AI_MODELS[0]
  form.ai_persona_template = data.ai_persona_template || ''
  form.ai_generation_prompt = data.ai_generation_prompt || ''
  form.collector_limit = data.collector_limit ?? 20
  form.collector_min_likes = data.collector_min_likes ?? 0
  form.collector_with_media_only = !!data.collector_with_media_only
  form.collector_no_media_only = !!data.collector_no_media_only
  return form
}

function toPayload(form: Form): Record<string, any> {
  const out: Record<string, any> = { ...form }
  for (const key of NUMERIC_KEYS) {
    const raw = String(form[key] ?? '').trim()
    out[key] = raw === '' ? null : Number.parseInt(raw, 10)
  }
  if (out.gen_num_posts === null || Number.isNaN(out.gen_num_posts) || out.gen_num_posts < 1) out.gen_num_posts = 1
  if (out.collector_limit === null || Number.isNaN(out.collector_limit)) out.collector_limit = 20
  if (out.collector_min_likes === null || Number.isNaN(out.collector_min_likes)) out.collector_min_likes = 0
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

  const missing = useMemo(
    () => PERSONA_FIELDS.filter((f) => f.required && !String(form[f.key] ?? '').trim()),
    [form],
  )

  const set = (key: string, value: string | number | boolean) => setForm((f) => ({ ...f, [key]: value }))

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
          <div>
            <h3 className="font-medium">Персона</h3>
            <p className="text-sm text-muted-foreground">
              От чьего имени пишет модель. Поля со звёздочкой обязательны: без них генерация не запустится.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {PERSONA_FIELDS.map((f) => {
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
                  placeholder="Ты — {role}. {context}. Пиши на {languages}, тон: {tone}."
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
            <p className="text-sm text-muted-foreground">Что попадает в ленту трендов для режимов с трендами.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="col-limit">Лимит постов</Label>
              <Input
                id="col-limit"
                type="number"
                min={1}
                value={String(form.collector_limit ?? 20)}
                onChange={(e) => set('collector_limit', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="col-likes">Минимум лайков</Label>
              <Input
                id="col-likes"
                type="number"
                min={0}
                value={String(form.collector_min_likes ?? 0)}
                onChange={(e) => set('collector_min_likes', e.target.value)}
              />
            </div>
            <label className="flex items-center justify-between rounded-lg border p-3 text-sm">
              Только с медиа
              <Switch
                checked={!!form.collector_with_media_only}
                onCheckedChange={(v) => set('collector_with_media_only', v)}
              />
            </label>
            <label className="flex items-center justify-between rounded-lg border p-3 text-sm">
              Только текстовые
              <Switch
                checked={!!form.collector_no_media_only}
                onCheckedChange={(v) => set('collector_no_media_only', v)}
              />
            </label>
          </div>
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
