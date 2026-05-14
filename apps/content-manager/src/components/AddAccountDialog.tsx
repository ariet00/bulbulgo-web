'use client'

import React, { useEffect, useState } from 'react'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@doska/ui'
import {
  useCreateContentAccount,
  useSubmitThreads2FA,
  useThreadsAccountStatus,
  type Platform,
} from '@doska/shared'
import { Loader2 } from 'lucide-react'

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'threads', label: 'Threads' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'telegram', label: 'Telegram' },
]

interface FormState {
  username: string
  password: string
  accessToken: string
  phone: string
  apiToken: string
  botToken: string
  displayName: string
}

const EMPTY_FORM: FormState = {
  username: '',
  password: '',
  accessToken: '',
  phone: '',
  apiToken: '',
  botToken: '',
  displayName: '',
}

function buildCreatePayload(platform: Platform, form: FormState) {
  const base = {
    platform,
    username: form.username || form.phone || form.botToken,
    display_name: form.displayName || undefined,
  }
  switch (platform) {
    case 'threads':
      return {
        ...base,
        credentials: { password: form.password },
      }
    case 'instagram':
    case 'tiktok':
      return {
        ...base,
        credentials: { access_token: form.accessToken },
      }
    case 'whatsapp':
      return {
        ...base,
        username: form.phone,
        credentials: { api_token: form.apiToken },
      }
    case 'telegram':
      return {
        ...base,
        username: form.botToken,
        credentials: { bot_token: form.botToken },
      }
  }
}

export function AddAccountDialog() {
  const [open, setOpen] = useState(false)
  const [platform, setPlatform] = useState<Platform>('instagram')
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [createdId, setCreatedId] = useState<number | null>(null)
  const [twoFaCode, setTwoFaCode] = useState('')

  const createAccount = useCreateContentAccount()
  const submit2FA = useSubmitThreads2FA()
  const { data: statusData } = useThreadsAccountStatus(
    platform === 'threads' ? createdId : null,
  )
  const status = statusData?.status

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM)
      setCreatedId(null)
      setTwoFaCode('')
      setPlatform('instagram')
    }
  }, [open])

  useEffect(() => {
    if (status === 'completed') {
      setTimeout(() => setOpen(false), 1500)
    }
  }, [status])

  const handleSubmit = async () => {
    const payload = buildCreatePayload(platform, form)
    if (!payload.username) return
    try {
      const created = await createAccount.mutateAsync(payload)
      if (platform === 'threads') {
        setCreatedId(created.id)
      } else {
        setOpen(false)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handle2FA = async () => {
    if (!createdId) return
    await submit2FA.mutateAsync({ accountId: createdId, code: twoFaCode })
  }

  const showThreadsProgress = platform === 'threads' && createdId !== null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Добавить аккаунт</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Новый аккаунт</DialogTitle>
          <DialogDescription>
            Выберите платформу и заполните данные для подключения.
          </DialogDescription>
        </DialogHeader>

        {!showThreadsProgress && (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Платформа</Label>
              <Select
                value={platform}
                onValueChange={(v) => setPlatform(v as Platform)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Отображаемое имя (опционально)</Label>
              <Input
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                placeholder="Например: Личный профиль"
              />
            </div>

            {platform === 'threads' && (
              <>
                <div className="space-y-2">
                  <Label>Username Instagram</Label>
                  <Input
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="instagram username"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Пароль</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              </>
            )}

            {(platform === 'instagram' || platform === 'tiktok') && (
              <>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Access token</Label>
                  <Input
                    value={form.accessToken}
                    onChange={(e) => setForm({ ...form, accessToken: e.target.value })}
                  />
                </div>
              </>
            )}

            {platform === 'whatsapp' && (
              <>
                <div className="space-y-2">
                  <Label>Номер телефона</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+996..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>API токен</Label>
                  <Input
                    value={form.apiToken}
                    onChange={(e) => setForm({ ...form, apiToken: e.target.value })}
                  />
                </div>
              </>
            )}

            {platform === 'telegram' && (
              <div className="space-y-2">
                <Label>Bot token</Label>
                <Input
                  value={form.botToken}
                  onChange={(e) => setForm({ ...form, botToken: e.target.value })}
                  placeholder="123456:ABC-DEF..."
                />
              </div>
            )}

            <DialogFooter>
              <Button onClick={handleSubmit} disabled={createAccount.isPending}>
                {createAccount.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Подключить
              </Button>
            </DialogFooter>
          </div>
        )}

        {showThreadsProgress && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between p-3 border rounded">
              <span className="font-semibold">Статус:</span>
              <span className="text-sm px-2 py-1 bg-secondary rounded uppercase">
                {status || 'initializing'}
              </span>
            </div>

            {(status === 'logging_in' ||
              status === 'starting' ||
              status === 'initializing') && (
              <p className="text-sm text-muted-foreground animate-pulse">
                Автоматический браузер выполняет вход. Пожалуйста, подождите...
              </p>
            )}

            {status === 'pending_2fa' && (
              <div className="space-y-2">
                <Label>Код 2FA</Label>
                <Input
                  value={twoFaCode}
                  onChange={(e) => setTwoFaCode(e.target.value)}
                  placeholder="123456"
                />
                <Button onClick={handle2FA} disabled={submit2FA.isPending}>
                  {submit2FA.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Отправить код
                </Button>
              </div>
            )}

            {status === 'completed' && (
              <p className="text-green-600 font-semibold p-2 border border-green-200 bg-green-50 rounded">
                Готово! Аккаунт подключён.
              </p>
            )}

            {typeof status === 'string' && status.startsWith('failed') && (
              <p className="text-red-500 font-semibold p-2 border border-red-200 bg-red-50 rounded">
                Не удалось войти. Проверьте логин/пароль и попробуйте снова.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
