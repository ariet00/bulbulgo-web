'use client'

import React, { useEffect, useState } from 'react'

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Switch,
} from '@doska/ui'
import {
  useDeleteContentAccount,
  useUpdateContentAccount,
  type ContentAccount,
} from '@doska/shared'
import { useRouter } from '@doska/i18n'
import { Loader2, Save, Trash2 } from 'lucide-react'

interface Props {
  account: ContentAccount
}

const PLATFORM_LABEL: Record<string, string> = {
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  tiktok: 'TikTok',
  telegram: 'Telegram',
}

export function GenericAccountDetail({ account }: Props) {
  const router = useRouter()
  const updateAccount = useUpdateContentAccount()
  const deleteAccount = useDeleteContentAccount()

  const [username, setUsername] = useState(account.username)
  const [displayName, setDisplayName] = useState(account.display_name || '')
  const [isActive, setIsActive] = useState(account.is_active)
  const [credentials, setCredentials] = useState<Record<string, string>>(
    Object.fromEntries(
      Object.entries(account.credentials || {}).map(([k, v]) => [k, String(v ?? '')]),
    ),
  )

  useEffect(() => {
    setUsername(account.username)
    setDisplayName(account.display_name || '')
    setIsActive(account.is_active)
  }, [account])

  const handleSave = async () => {
    await updateAccount.mutateAsync({
      platform: account.platform,
      accountId: account.id,
      data: {
        username,
        display_name: displayName,
        is_active: isActive,
        credentials,
      },
    })
  }

  const handleDelete = async () => {
    if (!confirm(`Удалить аккаунт @${account.username}?`)) return
    await deleteAccount.mutateAsync({
      platform: account.platform,
      accountId: account.id,
    })
    router.push('/')
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <Badge className="w-fit text-[10px] uppercase">
          {PLATFORM_LABEL[account.platform] || account.platform}
        </Badge>
        <CardTitle className="text-2xl pt-2">
          {account.display_name || `@${account.username}`}
        </CardTitle>
        <CardDescription>Редактирование аккаунта</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Username</Label>
          <Input value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Отображаемое имя</Label>
          <Input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>

        {Object.keys(credentials).length > 0 && (
          <div className="space-y-3 border-t pt-4">
            <p className="text-sm font-semibold">Учётные данные</p>
            {Object.entries(credentials).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label className="capitalize">{key.replace(/_/g, ' ')}</Label>
                <Input
                  value={value}
                  onChange={(e) =>
                    setCredentials({ ...credentials, [key]: e.target.value })
                  }
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t pt-4">
          <Label htmlFor="active">Активен</Label>
          <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t bg-muted/30 py-4">
        <Button
          variant="ghost"
          className="text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
          disabled={deleteAccount.isPending}
        >
          <Trash2 className="h-4 w-4 mr-2" /> Удалить
        </Button>
        <Button onClick={handleSave} disabled={updateAccount.isPending}>
          {updateAccount.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Сохранить
        </Button>
      </CardFooter>
    </Card>
  )
}
