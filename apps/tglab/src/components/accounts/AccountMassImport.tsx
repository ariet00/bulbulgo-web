'use client'

import {
  Button,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from '@doska/ui'
import { CheckCircle2, XCircle } from 'lucide-react'
import { useRef, useState } from 'react'

import { useImportAccountArchive, useImportAccountStrings } from '@/hooks/mutations'
import type { AccountBulkImportResult } from '@/types'

/** The batch lanes of the import dialog: many session strings under one app
 *  pair, or a ZIP of bought `.session`/`.json` packs. Results are shown inline —
 *  a batch never silently drops accounts, the operator sees each failure. */
export function AccountMassImport({
  projectId,
  proxyId,
}: {
  projectId: number | null
  proxyId: number | null
}) {
  const importStrings = useImportAccountStrings()
  const importArchive = useImportAccountArchive()

  const [text, setText] = useState('')
  const [apiId, setApiId] = useState('')
  const [apiHash, setApiHash] = useState('')
  const [result, setResult] = useState<AccountBulkImportResult | null>(null)
  const archiveRef = useRef<HTMLInputElement>(null)

  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  const hasCredentials = Boolean(apiId) && apiHash.trim().length >= 8

  const submitStrings = () =>
    importStrings.mutate(
      {
        sessions: lines,
        apiId: Number(apiId),
        apiHash: apiHash.trim(),
        projectId,
        proxyId,
      },
      { onSuccess: setResult },
    )

  const submitArchive = () => {
    const archive = archiveRef.current?.files?.[0]
    if (!archive) return
    importArchive.mutate(
      {
        archive,
        apiId: apiId ? Number(apiId) : null,
        apiHash: apiHash.trim() || null,
        projectId,
        proxyId,
      },
      { onSuccess: setResult },
    )
  }

  const credentials = (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-2">
        <Label htmlFor="bulk-api-id">api_id</Label>
        <Input
          id="bulk-api-id"
          inputMode="numeric"
          value={apiId}
          onChange={(e) => setApiId(e.target.value.replace(/\D/g, ''))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bulk-api-hash">api_hash</Label>
        <Input id="bulk-api-hash" value={apiHash} onChange={(e) => setApiHash(e.target.value)} />
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <Tabs defaultValue="strings" onValueChange={() => setResult(null)}>
        <TabsList className="mb-3">
          <TabsTrigger value="strings">Строки</TabsTrigger>
          <TabsTrigger value="archive">Архив ZIP</TabsTrigger>
        </TabsList>

        <TabsContent value="strings" className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="bulk-sessions">
              StringSession — по одной в строке{lines.length > 0 ? ` · ${lines.length}` : ''}
            </Label>
            <Textarea
              id="bulk-sessions"
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={'1BVtsOH...\n1BVtsOH...'}
            />
          </div>
          {credentials}
          <p className="text-xs text-muted-foreground">
            Один общий api_id/api_hash на всю пачку — так продают аккаунты под одним
            приложением. У каждого своего .json — берите вкладку «Архив ZIP».
          </p>
          <div className="flex justify-end">
            <Button
              onClick={submitStrings}
              disabled={lines.length === 0 || !hasCredentials || importStrings.isPending}
            >
              Импортировать{lines.length > 0 ? ` (${lines.length})` : ''}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="archive" className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="bulk-archive">ZIP с парами .session / .json</Label>
            <Input id="bulk-archive" type="file" accept=".zip" ref={archiveRef} />
            <p className="text-xs text-muted-foreground">
              Каждый аккаунт — <code>имя.session</code> (+ <code>имя.json</code> с
              api_id, api_hash, телефоном, 2FA). tdata и RAR пока не поддерживаются.
            </p>
          </div>
          <div className="rounded-md bg-muted p-3">
            <p className="mb-3 text-xs text-muted-foreground">
              Запасные api_id / api_hash — подставятся там, где в .json их нет.
            </p>
            {credentials}
          </div>
          <div className="flex justify-end">
            <Button onClick={submitArchive} disabled={importArchive.isPending}>
              Импортировать архив
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {result && <MassImportResult result={result} />}
    </div>
  )
}

function MassImportResult({ result }: { result: AccountBulkImportResult }) {
  const failed = result.results.filter((r) => r.status === 'failed')
  return (
    <div className="space-y-2 rounded-md border p-3">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          импортировано {result.imported}
        </span>
        {result.failed > 0 && (
          <span className="flex items-center gap-1.5 text-destructive">
            <XCircle className="h-4 w-4" />
            не удалось {result.failed}
          </span>
        )}
      </div>
      {failed.length > 0 && (
        <div className="max-h-40 space-y-1 overflow-y-auto text-xs">
          {failed.map((row) => (
            <div key={row.index} className="flex justify-between gap-2">
              <span className="shrink-0 text-muted-foreground">{row.label}</span>
              <span className="break-words text-right text-destructive">{row.error}</span>
            </div>
          ))}
        </div>
      )}
      {result.imported > 0 && (
        <p className="text-xs text-muted-foreground">
          Импортированные лежат как <b>not_connected</b> — запустите проверку.
        </p>
      )}
    </div>
  )
}
