/**
 * Hito 4.9. Mantiene la pantalla encendida mientras se juega con la API Screen Wake Lock.
 * Si el navegador no la tiene, se avisa para que el jugador ajuste el apagado automático.
 */

export type WakeSentinel = {
  release(): Promise<void>
  addEventListener(type: 'release', listener: () => void): void
}

export type WakeNavigator = {
  wakeLock?: { request(type: 'screen'): Promise<WakeSentinel> }
}

export type WakeDocument = {
  visibilityState: string
  addEventListener(type: 'visibilitychange', listener: () => void): void
  removeEventListener(type: 'visibilitychange', listener: () => void): void
}

export type WakeStatus = 'idle' | 'active' | 'unsupported' | 'denied'

export type WakeController = {
  readonly supported: boolean
  start(): Promise<void>
  stop(): Promise<void>
}

/**
 * Crea el control del bloqueo. `start` lo pide y lo vuelve a pedir cada vez que la página vuelve
 * a estar visible (el navegador lo suelta al cambiar de pestaña); `stop` lo libera.
 */
export function createWakeLock(
  nav: WakeNavigator,
  doc: WakeDocument,
  onStatus: (status: WakeStatus) => void,
): WakeController {
  const supported = typeof nav.wakeLock?.request === 'function'
  let sentinel: WakeSentinel | null = null
  let wanted = false

  async function acquire(): Promise<void> {
    if (!supported || !wanted || sentinel) return
    try {
      const lock = await nav.wakeLock!.request('screen')
      if (!wanted) {
        await lock.release()
        return
      }
      sentinel = lock
      lock.addEventListener('release', () => {
        if (sentinel === lock) sentinel = null
      })
      onStatus('active')
    } catch {
      // El navegador puede negarlo (por ejemplo, con poca batería). Se reintenta al volver a la página.
      onStatus('denied')
    }
  }

  function onVisible() {
    if (doc.visibilityState === 'visible') void acquire()
  }

  return {
    supported,
    async start() {
      if (wanted) return
      wanted = true
      if (!supported) {
        onStatus('unsupported')
        return
      }
      doc.addEventListener('visibilitychange', onVisible)
      await acquire()
    },
    async stop() {
      if (!wanted) return
      wanted = false
      doc.removeEventListener('visibilitychange', onVisible)
      const current = sentinel
      sentinel = null
      try {
        await current?.release()
      } catch {
        // Ya estaba liberado.
      }
      onStatus('idle')
    },
  }
}
