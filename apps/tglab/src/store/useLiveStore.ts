import { create } from 'zustand'

import type { LiveEvent, TaskLog } from '@/types'

/** How many lines one task's panel keeps in memory. */
const LOG_BUFFER = 500

interface LiveState {
  connected: boolean
  /** Log lines that arrived over the socket, newest last, per task. */
  logs: Record<number, TaskLog[]>
  setConnected: (value: boolean) => void
  appendLog: (taskId: number, line: TaskLog) => void
  /** Seed a panel with the tail fetched over REST. */
  primeLogs: (taskId: number, lines: TaskLog[]) => void
  clear: () => void
}

export const useLiveStore = create<LiveState>((set) => ({
  connected: false,
  logs: {},
  setConnected: (connected) => set({ connected }),
  appendLog: (taskId, line) =>
    set((state) => {
      const current = state.logs[taskId] ?? []
      return {
        logs: { ...state.logs, [taskId]: [...current, line].slice(-LOG_BUFFER) },
      }
    }),
  primeLogs: (taskId, lines) =>
    set((state) => ({ logs: { ...state.logs, [taskId]: lines.slice(-LOG_BUFFER) } })),
  clear: () => set({ logs: {} }),
}))

/** Socket payload → the line shape the panel renders. */
export function eventToLog(event: LiveEvent): TaskLog {
  return {
    // Socket lines have no DB id yet; a negative one keeps React keys unique
    // and never collides with a row fetched over REST.
    id: -Date.now() - Math.floor(Math.random() * 1000),
    level: event.data.level ?? 'info',
    message: event.data.message ?? '',
    account_id: event.data.account_id ?? null,
    created_at: event.ts,
  }
}
