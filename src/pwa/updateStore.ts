import { useSyncExternalStore } from 'react'

/**
 * Hito 5.4. Estado del service worker: avisa cuando hay una versión nueva y cuando la app ya
 * puede usarse sin conexión. Es un almacén pequeño y separado del de la partida.
 */
export type PwaState = { needRefresh: boolean; offlineReady: boolean }

let state: PwaState = { needRefresh: false, offlineReady: false }
let applyUpdate: (() => Promise<void>) | null = null
const listeners = new Set<() => void>()

function set(next: Partial<PwaState>) {
  state = { ...state, ...next }
  listeners.forEach((fn) => fn())
}

export function setNeedRefresh(value: boolean) {
  set({ needRefresh: value })
}
export function setOfflineReady(value: boolean) {
  set({ offlineReady: value })
}
export function setUpdater(fn: () => Promise<void>) {
  applyUpdate = fn
}

/** Instala la versión nueva y recarga la página. La partida se guarda tras cada acción. */
export async function updateNow(): Promise<void> {
  await applyUpdate?.()
}

export function dismissPwaNotice() {
  set({ needRefresh: false, offlineReady: false })
}

export function usePwaState(): PwaState {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn)
      return () => void listeners.delete(fn)
    },
    () => state,
  )
}
