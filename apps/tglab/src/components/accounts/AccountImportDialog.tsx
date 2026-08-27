'use client'

import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@doska/ui'
import { useEffect, useRef, useState } from 'react'

import { AccountMassImport } from '@/components/accounts/AccountMassImport'
import { ProjectSelect } from '@/components/common/ProjectSelect'
import { ProxySelect } from '@/components/common/ProxySelect'
import { useCreateAccount, useImportAccountFile } from '@/hooks/mutations'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Two ways in, both ending as one account row:
 * — a Telethon session string (what other tools export);
 * — the `.session` + `.json` pair a bought account ships as.
 */
export function AccountImportDialog({ open, onOpenChange }: Props) {
  const create = useCreateAccount()
  const importFile = useImportAccountFile()

  const [sessionString, setSessionString] = useState('')
  const [apiId, setApiId] = useState('')
  const [apiHash, setApiHash] = useState('')
  const [twofa, setTwofa] = useState('')
  const [phone, setPhone] = useState('')
  const [projectId, setProjectId] = useState<number | null>(null)
  const [proxyId, setProxyId] = useState<number | null>(null)
  const sessionFileRef = useRef<HTMLInputElement>(null)
  const metaFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) return
    setSessionString('')
    setApiId('')
    setApiHash('')
    setTwofa('')
    setPhone('')
    setProjectId(null)
    setProxyId(null)
  }, [open])

  const close = () => onOpenChange(false)

  const hasCredentials = Boolean(apiId) && apiHash.trim().length >= 8

  const submitString = () =>
    create.mutate(
      {
        session_string: sessionString.trim(),
        api_id: Number(apiId),
        api_hash: apiHash.trim(),
        twofa_password: twofa || null,
        phone: phone || null,
        project_id: projectId,
        proxy_id: proxyId,
      },
      { onSuccess: close },
    )

  const submitFiles = () => {
    const sessionFile = sessionFileRef.current?.files?.[0]
    if (!sessionFile) return
    importFile.mutate(
      {
        sessionFile,
        metaFile: metaFileRef.current?.files?.[0] ?? null,
        // Ignored when the .json carries its own pair.
        apiId: apiId ? Number(apiId) : null,
        apiHash: apiHash.trim() || null,
        projectId,
        proxyId,
      },
      { onSuccess: close },
    )
  }

  const credentials = (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="api-id">api_id</Label>
          <Input
            id="api-id"
            inputMode="numeric"
            value={apiId}
            onChange={(e) => setApiId(e.target.value.replace(/\D/g, ''))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="api-hash">api_hash</Label>
          <Input
            id="api-hash"
            value={apiHash}
            onChange={(e) => setApiHash(e.target.value)}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Сессия открывается только теми api_id/api_hash, под которыми её создали —
        с чужими Telegram её убьёт. Обычно они лежат в .json от аккаунта.
      </p>
    </div>
  )

  const placement = (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <Label>Проект</Label>
        <ProjectSelect value={projectId} onChange={setProjectId} />
      </div>
      <div className="space-y-2">
        <Label>Прокси</Label>
        <ProxySelect value={proxyId} onChange={setProxyId} />
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Добавить аккаунт</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="string">
          <TabsList className="mb-4">
            <TabsTrigger value="string">Строка сессии</TabsTrigger>
            <TabsTrigger value="files">Файлы</TabsTrigger>
            <TabsTrigger value="bulk">Массово</TabsTrigger>
          </TabsList>

          <TabsContent value="string" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="session">StringSession</Label>
              <Textarea
                id="session"
                rows={4}
                value={sessionString}
                onChange={(e) => setSessionString(e.target.value)}
              />
            </div>
            {credentials}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twofa">Пароль 2FA</Label>
                <Input id="twofa" value={twofa} onChange={(e) => setTwofa(e.target.value)} />
              </div>
            </div>
            {placement}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={close}>
                Отмена
              </Button>
              <Button
                onClick={submitString}
                disabled={
                  sessionString.trim().length < 10 || !hasCredentials || create.isPending
                }
              >
                Добавить
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="session-file">Файл .session</Label>
              <Input id="session-file" type="file" accept=".session" ref={sessionFileRef} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta-file">Файл .json</Label>
              <Input id="meta-file" type="file" accept=".json" ref={metaFileRef} />
              <p className="text-xs text-muted-foreground">
                Из него берутся api_id, api_hash, телефон, пароль 2FA и подпись
                устройства. tdata пока не поддерживается.
              </p>
            </div>
            <div className="rounded-md bg-muted p-3">
              <p className="mb-3 text-xs text-muted-foreground">
                Если .json нет — впишите api_id и api_hash сюда.
              </p>
              {credentials}
            </div>
            {placement}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={close}>
                Отмена
              </Button>
              <Button onClick={submitFiles} disabled={importFile.isPending}>
                Импортировать
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-4">
            {placement}
            <AccountMassImport projectId={projectId} proxyId={proxyId} />
            <div className="flex justify-end">
              <Button variant="ghost" onClick={close}>
                Готово
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
