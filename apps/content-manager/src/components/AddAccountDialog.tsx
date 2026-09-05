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
  useCreateInstagramAccount,
  useCreateTelegramAccount,
  useCreateTikTokAccount,
  useCreateWhatsAppAccount,
  useStartInstagramOAuth,
  useStartPagesOAuth,
  useStartThreadsOAuth,
  PLATFORMS,
  PLATFORM_LABELS,
  type Platform,
} from '@doska/shared'
import { Loader2 } from 'lucide-react'

import { WhatsAppEmbeddedSignupButton } from '@/components/whatsapp/WhatsAppEmbeddedSignupButton'

interface FormState {
  username: string
  accessToken: string
  phone: string
  apiToken: string
  botToken: string
  displayName: string
}

const EMPTY_FORM: FormState = {
  username: '',
  accessToken: '',
  phone: '',
  apiToken: '',
  botToken: '',
  displayName: '',
}

export function AddAccountDialog() {
  const [open, setOpen] = useState(false)
  const [platform, setPlatform] = useState<Platform>('instagram')
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const createInstagram = useCreateInstagramAccount()
  const createTikTok = useCreateTikTokAccount()
  const createWhatsApp = useCreateWhatsAppAccount()
  const createTelegram = useCreateTelegramAccount()
  const startThreadsOAuth = useStartThreadsOAuth()
  const startInstagramOAuth = useStartInstagramOAuth()
  const startPagesOAuth = useStartPagesOAuth()

  const isPending =
    createInstagram.isPending ||
    createTikTok.isPending ||
    createWhatsApp.isPending ||
    createTelegram.isPending

  useEffect(() => {
    if (!open) {
      setForm(EMPTY_FORM)
      setPlatform('instagram')
    }
  }, [open])

  const handleConnectThreads = async () => {
    const { authorize_url } = await startThreadsOAuth.mutateAsync()
    // Full-page redirect — Meta does not allow consent in an iframe.
    window.location.href = authorize_url
  }

  const handleConnectInstagram = async () => {
    const { authorize_url } = await startInstagramOAuth.mutateAsync()
    window.location.href = authorize_url
  }

  const handleConnectPages = async () => {
    const { authorize_url } = await startPagesOAuth.mutateAsync()
    window.location.href = authorize_url
  }

  const handleSubmit = async () => {
    try {
      if (
        platform === 'threads' ||
        platform === 'instagram' ||
        platform === 'whatsapp' ||
        platform === 'pages'
      ) {
        // OAuth / Embedded Signup — handled by dedicated buttons.
        return
      }

      if (platform === 'tiktok') {
        await createTikTok.mutateAsync({
          username: form.username,
          display_name: form.displayName || undefined,
          access_token: form.accessToken,
        })
      } else if (platform === 'telegram') {
        await createTelegram.mutateAsync({
          bot_token: form.botToken,
          display_name: form.displayName || undefined,
        })
      }
      setOpen(false)
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Подключить аккаунт</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Подключить аккаунт</DialogTitle>
          <DialogDescription>
            Выберите соцсеть. Для Threads, Instagram, WhatsApp и Facebook вход
            проходит на стороне Meta, пароль нам не нужен.
          </DialogDescription>
        </DialogHeader>

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
                  <SelectItem key={p} value={p}>
                    {PLATFORM_LABELS[p]}
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
            <div className="space-y-3 rounded-lg border bg-muted/40 p-4 text-sm">
              <p className="font-medium">Подключение через Threads</p>
              <p className="text-muted-foreground">
                Вы перейдёте на threads.net и разрешите BulBul Social
                публиковать посты, читать ответы и собирать статистику от
                вашего имени. Пароль мы не запрашиваем.
              </p>
              <Button
                type="button"
                className="w-full"
                onClick={handleConnectThreads}
                disabled={startThreadsOAuth.isPending}
              >
                {startThreadsOAuth.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Подключить Threads
              </Button>
            </div>
          )}

          {platform === 'instagram' && (
            <div className="space-y-3 rounded-lg border bg-muted/40 p-4 text-sm">
              <p className="font-medium">Подключение через Instagram</p>
              <p className="text-muted-foreground">
                Используем Instagram Business Login. Аккаунт должен быть
                бизнес- или авторским (Business/Creator). Мы запросим
                разрешения на публикацию, чтение комментариев, Direct и
                статистику.
              </p>
              <Button
                type="button"
                className="w-full"
                onClick={handleConnectInstagram}
                disabled={startInstagramOAuth.isPending}
              >
                {startInstagramOAuth.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Подключить Instagram
              </Button>
            </div>
          )}

          {platform === 'tiktok' && (
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
            <div className="space-y-3 rounded-lg border bg-muted/40 p-4 text-sm">
              <p className="font-medium">Подключение WhatsApp Business</p>
              <p className="text-muted-foreground">
                Откроется встроенная регистрация Meta (Embedded Signup):
                выберите бизнес-аккаунт и номер. Требует пройденной Meta
                Business Verification.
              </p>
              <WhatsAppEmbeddedSignupButton
                onConnected={() => setOpen(false)}
              />
            </div>
          )}

          {platform === 'pages' && (
            <div className="space-y-3 rounded-lg border bg-muted/40 p-4 text-sm">
              <p className="font-medium">Подключение Facebook Page</p>
              <p className="text-muted-foreground">
                Войдите в Facebook и выберите Страницы, которыми хотите
                управлять. Подключим все выбранные сразу. Нужны права
                администратора Page.
              </p>
              <Button
                type="button"
                className="w-full bg-[#1877F2] hover:bg-[#1366d6] text-white"
                onClick={handleConnectPages}
                disabled={startPagesOAuth.isPending}
              >
                {startPagesOAuth.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Подключить через Facebook
              </Button>
            </div>
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

          {platform !== 'threads' &&
            platform !== 'instagram' &&
            platform !== 'whatsapp' &&
            platform !== 'pages' && (
              <DialogFooter>
                <Button onClick={handleSubmit} disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Подключить
                </Button>
              </DialogFooter>
            )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
