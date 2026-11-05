import { registerSW } from 'virtual:pwa-register'
import { setNeedRefresh, setOfflineReady, setUpdater } from './updateStore'

/** Registra el service worker (hitos 5.2 y 5.4). Solo en la versión publicada. */
export function registerPwa(): void {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
  const update = registerSW({
    onNeedRefresh: () => setNeedRefresh(true),
    onOfflineReady: () => setOfflineReady(true),
  })
  setUpdater(() => update(true))
}
