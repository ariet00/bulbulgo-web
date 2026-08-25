'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  bulkDeleteAccounts,
  bulkUpdateAccounts,
  checkAccount,
  checkAccountSpamBlock,
  createAccount,
  deleteAccount,
  importAccountArchive,
  importAccountFile,
  importAccountStrings,
  terminateAccountSessions,
  updateAccount,
  updateAccountProfile,
} from '@/apis/accounts'
import {
  addAudienceItems,
  collectAudience,
  createAudience,
  deleteAudience,
  stopCollection,
  updateAudience,
  uploadAudienceItems,
} from '@/apis/audiences'
import { login as loginRequest, logout as logoutRequest } from '@/apis/auth'
import { createTask, deleteTask, startTask, stopTask, updateTask } from '@/apis/tasks'
import { createProject, deleteProject, updateProject } from '@/apis/projects'
import {
  checkProxy,
  createProxiesBulk,
  createProxy,
  deleteProxy,
  updateProxy,
} from '@/apis/proxies'
import { tglabKeys } from '@/hooks/queries/keys'
import { useAuthStore } from '@/store/useAuthStore'
import type {
  AccountBulkInput,
  AudienceCollectInput,
  AudienceInput,
  AccountInput,
  AccountProfileInput,
  AccountUpdateInput,
  ProjectInput,
  ProxyBulkInput,
  ProxyInput,
  TaskInput,
} from '@/types'

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession)
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (session) => {
      setSession(session)
      queryClient.setQueryData(tglabKeys.me, session.user)
    },
  })
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear)
  const queryClient = useQueryClient()
  return useMutation({
    // A dead session on the backend must not keep the operator locked in the
    // shell, so the local session is dropped either way.
    mutationFn: async () => {
      try {
        await logoutRequest()
      } catch {
        /* ignore */
      }
    },
    onSettled: () => {
      clear()
      queryClient.clear()
    },
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProjectInput) => createProject(payload),
    onSuccess: () => {
      toast.success('Проект создан')
      queryClient.invalidateQueries({ queryKey: tglabKeys.projects })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<ProjectInput> & { id: number }) =>
      updateProject(id, payload),
    onSuccess: () => {
      toast.success('Проект обновлён')
      queryClient.invalidateQueries({ queryKey: tglabKeys.projects })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteProject(id),
    onSuccess: () => {
      toast.success('Проект удалён')
      queryClient.invalidateQueries({ queryKey: tglabKeys.projects })
    },
  })
}

// ── proxies ───────────────────────────────────────────────────────────────────

export function useCreateProxy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProxyInput) => createProxy(payload),
    onSuccess: () => {
      toast.success('Прокси добавлен')
      queryClient.invalidateQueries({ queryKey: tglabKeys.proxies })
    },
  })
}

export function useCreateProxiesBulk() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProxyBulkInput) => createProxiesBulk(payload),
    onSuccess: (result) => {
      // Partial success is the normal outcome — say what actually landed.
      toast.success(`Добавлено: ${result.created.length}`)
      if (result.errors.length) {
        toast.error(`Строк с ошибками: ${result.errors.length}`)
      }
      queryClient.invalidateQueries({ queryKey: tglabKeys.proxies })
    },
  })
}

export function useUpdateProxy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<ProxyInput> & { id: number }) =>
      updateProxy(id, payload),
    onSuccess: () => {
      toast.success('Прокси обновлён')
      queryClient.invalidateQueries({ queryKey: tglabKeys.proxies })
    },
  })
}

export function useDeleteProxy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteProxy(id),
    onSuccess: () => {
      toast.success('Прокси удалён')
      queryClient.invalidateQueries({ queryKey: tglabKeys.proxies })
      // accounts show the proxy they point at
      queryClient.invalidateQueries({ queryKey: tglabKeys.accounts })
    },
  })
}

export function useCheckProxy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => checkProxy(id),
    onSuccess: (proxy) => {
      if (proxy.status === 'ok') toast.success(`Работает · ${proxy.latency_ms} мс`)
      else toast.error(proxy.last_error || 'Прокси не отвечает')
      queryClient.invalidateQueries({ queryKey: tglabKeys.proxies })
    },
  })
}

// ── accounts ──────────────────────────────────────────────────────────────────

export function useCreateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: AccountInput) => createAccount(payload),
    onSuccess: () => {
      toast.success('Аккаунт добавлен — запустите проверку')
      queryClient.invalidateQueries({ queryKey: tglabKeys.accounts })
    },
  })
}

export function useImportAccountFile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof importAccountFile>[0]) =>
      importAccountFile(payload),
    onSuccess: () => {
      toast.success('Аккаунт импортирован — запустите проверку')
      queryClient.invalidateQueries({ queryKey: tglabKeys.accounts })
    },
  })
}

/** Toast + list refresh shared by both mass-import lanes. */
function onBulkImported(queryClient: ReturnType<typeof useQueryClient>) {
  return (result: { imported: number; failed: number }) => {
    if (result.imported > 0) {
      toast.success(`Импортировано: ${result.imported}${result.failed ? `, не удалось: ${result.failed}` : ''}`)
    } else {
      toast.error('Ни один аккаунт не импортирован')
    }
    queryClient.invalidateQueries({ queryKey: tglabKeys.accounts })
  }
}

export function useImportAccountStrings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof importAccountStrings>[0]) =>
      importAccountStrings(payload),
    onSuccess: onBulkImported(queryClient),
  })
}

export function useImportAccountArchive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof importAccountArchive>[0]) =>
      importAccountArchive(payload),
    onSuccess: onBulkImported(queryClient),
  })
}

export function useUpdateAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: AccountUpdateInput & { id: number }) =>
      updateAccount(id, payload),
    onSuccess: () => {
      toast.success('Аккаунт обновлён')
      queryClient.invalidateQueries({ queryKey: tglabKeys.accounts })
      // proxy attachment may have changed → refresh their load counts
      queryClient.invalidateQueries({ queryKey: tglabKeys.proxies })
    },
  })
}

export function useBulkUpdateAccounts() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: AccountBulkInput) => bulkUpdateAccounts(payload),
    onSuccess: (accounts) => {
      toast.success(`Обновлено: ${accounts.length}`)
      queryClient.invalidateQueries({ queryKey: tglabKeys.accounts })
    },
  })
}

export function useDeleteAccounts() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: number[]) =>
      ids.length === 1 ? deleteAccount(ids[0]) : bulkDeleteAccounts(ids),
    onSuccess: () => {
      toast.success('Аккаунты удалены')
      queryClient.invalidateQueries({ queryKey: tglabKeys.accounts })
    },
  })
}

export function useCheckAccount() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => checkAccount(id),
    onSuccess: (result) => {
      if (result.ok) toast.success('Аккаунт на связи')
      else toast.error(result.error || 'Проверка не прошла')
      queryClient.invalidateQueries({ queryKey: tglabKeys.accounts })
    },
  })
}

export function useUpdateAccountProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: AccountProfileInput & { id: number }) =>
      updateAccountProfile(id, payload),
    onSuccess: () => {
      toast.success('Профиль обновлён')
      queryClient.invalidateQueries({ queryKey: tglabKeys.accounts })
    },
  })
}

export function useTerminateAccountSessions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => terminateAccountSessions(id),
    onSuccess: (_data, id) => {
      toast.success('Остальные сессии завершены')
      queryClient.invalidateQueries({ queryKey: tglabKeys.accountSessions(id) })
    },
  })
}

export function useCheckAccountSpamBlock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => checkAccountSpamBlock(id),
    onSuccess: (result) => {
      if (result.restricted) toast.error('На аккаунте ограничения')
      else toast.success('Ограничений нет')
      queryClient.invalidateQueries({ queryKey: tglabKeys.accounts })
    },
  })
}

// ── audiences ─────────────────────────────────────────────────────────────────

export function useCreateAudience() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: AudienceInput) => createAudience(payload),
    onSuccess: () => {
      toast.success('База создана')
      queryClient.invalidateQueries({ queryKey: tglabKeys.audiences })
    },
  })
}

export function useCollectAudience() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: AudienceCollectInput) => collectAudience(payload),
    onSuccess: () => {
      toast.success('Сбор запущен')
      queryClient.invalidateQueries({ queryKey: tglabKeys.audiences })
    },
  })
}

export function useStopCollection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => stopCollection(id),
    onSuccess: () => {
      toast.success('Сбор останавливается')
      queryClient.invalidateQueries({ queryKey: tglabKeys.audiences })
    },
  })
}

export function useUpdateAudience() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<AudienceInput> & { id: number }) =>
      updateAudience(id, payload),
    onSuccess: () => {
      toast.success('База обновлена')
      queryClient.invalidateQueries({ queryKey: tglabKeys.audiences })
    },
  })
}

export function useDeleteAudience() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteAudience(id),
    onSuccess: () => {
      toast.success('База удалена')
      queryClient.invalidateQueries({ queryKey: tglabKeys.audiences })
    },
  })
}

/** Paste or file — both land as entries and report the unreadable lines. */
export function useAddAudienceItems() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, raw, file }: { id: number; raw?: string; file?: File }) =>
      file ? uploadAudienceItems(id, file) : addAudienceItems(id, raw ?? ''),
    onSuccess: (result) => {
      toast.success(`Добавлено: ${result.added}, пропущено: ${result.skipped}`)
      if (result.errors.length) toast.error(`Строк с ошибками: ${result.errors.length}`)
      queryClient.invalidateQueries({ queryKey: tglabKeys.audiences })
    },
  })
}

// ── tasks ─────────────────────────────────────────────────────────────────────

export function useStartTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => startTask(id),
    onSuccess: () => {
      toast.success('Задача запущена — первый тик в течение минуты')
      queryClient.invalidateQueries({ queryKey: tglabKeys.tasks })
    },
  })
}

export function useStopTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => stopTask(id),
    onSuccess: () => {
      toast.success('Задача остановлена')
      queryClient.invalidateQueries({ queryKey: tglabKeys.tasks })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => {
      toast.success('Задача удалена')
      queryClient.invalidateQueries({ queryKey: tglabKeys.tasks })
    },
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: TaskInput) => createTask(payload),
    onSuccess: () => {
      toast.success('Задача создана — запустите её, когда будете готовы')
      queryClient.invalidateQueries({ queryKey: tglabKeys.tasks })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...payload }: Partial<TaskInput> & { id: number }) =>
      updateTask(id, payload),
    onSuccess: () => {
      toast.success('Задача обновлена')
      queryClient.invalidateQueries({ queryKey: tglabKeys.tasks })
    },
  })
}
