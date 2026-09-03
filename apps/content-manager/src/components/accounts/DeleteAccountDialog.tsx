'use client'

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@doska/ui'
import {
  PLATFORM_LABELS,
  useDeleteContentAccount,
  type ContentAccount,
} from '@doska/shared'
import { Loader2 } from 'lucide-react'

export function DeleteAccountDialog({
  account,
  open,
  onOpenChange,
}: {
  account: ContentAccount
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const remove = useDeleteContentAccount()

  const handleDelete = async () => {
    await remove.mutateAsync({ platform: account.platform, accountId: account.id })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Отключить @{account.username}?</DialogTitle>
          <DialogDescription>
            Аккаунт исчезнет из BulBul Social, а сохранённый доступ будет
            удалён. Посты в {PLATFORM_LABELS[account.platform]} останутся на
            месте. Подключить его снова можно в любой момент.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={remove.isPending}>
            Отмена
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={remove.isPending}>
            {remove.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Отключить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
