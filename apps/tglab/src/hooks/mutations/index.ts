'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { login as loginRequest, logout as logoutRequest } from '@/apis/auth'
import { createProject, deleteProject, updateProject } from '@/apis/projects'
import { tglabKeys } from '@/hooks/queries/keys'
import { useAuthStore } from '@/store/useAuthStore'
import type { ProjectInput } from '@/types'

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
