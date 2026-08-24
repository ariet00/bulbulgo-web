'use client'

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useEffect, useState } from 'react'

import { ProjectSelect } from '@/components/common/ProjectSelect'
import { useCreateProxiesBulk, useCreateProxy, useUpdateProxy } from '@/hooks/mutations'
import { useMeta } from '@/hooks/queries'
import type { Proxy } from '@/types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Set → edit that proxy; empty → add (single or bulk). */
  proxy?: Proxy | null
}

export function ProxyDialog({ open, onOpenChange, proxy }: Props) {
  const { data: meta } = useMeta()
  const create = useCreateProxy()
  const createBulk = useCreateProxiesBulk()
  const update = useUpdateProxy()
  const isEdit = Boolean(proxy)

  const [type, setType] = useState('socks5')
  const [host, setHost] = useState('')
  const [port, setPort] = useState('')
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [projectId, setProjectId] = useState<number | null>(null)
  const [raw, setRaw] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (!open) return
    setType(proxy?.type ?? 'socks5')
    setHost(proxy?.host ?? '')
    setPort(proxy ? String(proxy.port) : '')
    setLogin(proxy?.login ?? '')
    setPassword('')
    setName(proxy?.name ?? '')
    setProjectId(proxy?.project_id ?? null)
    setRaw('')
    setErrors([])
  }, [open, proxy])

  const close = () => onOpenChange(false)

  const submitSingle = () => {
    const payload = {
      type,
      host: host.trim(),
      port: Number(port),
      login: login || null,
      // An empty field on edit means «не менять» is impossible to express, so
      // it clears the password — same as the original service does.
      password: password || null,
      name: name || null,
      project_id: projectId,
    }
    if (proxy) update.mutate({ id: proxy.id, ...payload }, { onSuccess: close })
    else create.mutate(payload, { onSuccess: close })
  }

  const submitBulk = () => {
    createBulk.mutate(
      { type, raw, project_id: projectId },
      {
        onSuccess: (result) => {
          setErrors(result.errors)
          if (!result.errors.length) close()
        },
      },
    )
  }

  const typeSelect = (
    <Select value={type} onValueChange={setType}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(meta?.proxy_types ?? []).map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  const singleFooter = (
    <DialogFooter className="mt-4">
      <Button variant="ghost" onClick={close}>
        Отмена
      </Button>
      <Button
        onClick={submitSingle}
        disabled={!host.trim() || !port || create.isPending || update.isPending}
      >
        {isEdit ? 'Сохранить' : 'Добавить'}
      </Button>
    </DialogFooter>
  )

  const singleForm = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Тип</Label>
        {typeSelect}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 space-y-2">
          <Label htmlFor="host">Хост</Label>
          <Input id="host" value={host} onChange={(e) => setHost(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="port">Порт</Label>
          <Input
            id="port"
            inputMode="numeric"
            value={port}
            onChange={(e) => setPort(e.target.value.replace(/\D/g, ''))}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="login">Логин</Label>
          <Input id="login" value={login} onChange={(e) => setLogin(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">
            Пароль{proxy?.has_password ? ' (задан)' : ''}
          </Label>
          <Input
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="name">Название</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Проект</Label>
          <ProjectSelect value={projectId} onChange={setProjectId} />
        </div>
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Прокси' : 'Добавить прокси'}</DialogTitle>
        </DialogHeader>

        {isEdit ? (
          <>
            {singleForm}
            {singleFooter}
          </>
        ) : (
          <Tabs defaultValue="single">
            <TabsList className="mb-4">
              <TabsTrigger value="single">По одному</TabsTrigger>
              <TabsTrigger value="bulk">Списком</TabsTrigger>
            </TabsList>
            <TabsContent value="single">
              {singleForm}
              {singleFooter}
            </TabsContent>
            <TabsContent value="bulk">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Тип</Label>
                  {typeSelect}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="raw">Список</Label>
                  <Textarea
                    id="raw"
                    rows={8}
                    placeholder={'ip:port:login:pass:название\nip:port'}
                    value={raw}
                    onChange={(e) => setRaw(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    По одному на строку. Строки с ошибками будут показаны — остальные
                    добавятся.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Проект</Label>
                  <ProjectSelect value={projectId} onChange={setProjectId} />
                </div>
                {errors.length > 0 && (
                  <div className="max-h-32 space-y-1 overflow-y-auto rounded-md bg-destructive/10 p-3 text-xs text-destructive">
                    {errors.map((error) => (
                      <div key={error}>{error}</div>
                    ))}
                  </div>
                )}
                <DialogFooter>
                  <Button variant="ghost" onClick={close}>
                    Закрыть
                  </Button>
                  <Button
                    onClick={submitBulk}
                    disabled={!raw.trim() || createBulk.isPending}
                  >
                    Добавить списком
                  </Button>
                </DialogFooter>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
