import { useEffect } from 'react'
import { Button } from '../ui/Button'
import { dismissPwaNotice, updateNow, usePwaState } from './updateStore'

/**
 * Hitos 5.2 y 5.4. Avisos del service worker: hay una versión nueva (el jugador decide cuándo
 * actualizar) o la app ya funciona sin conexión. Flota arriba, sin empujar el contenido; el de
 * "sin conexión" es una píldora pequeña que se quita sola.
 */
export function PwaNotice() {
  const { needRefresh, offlineReady } = usePwaState()

  // El aviso de "sin conexión" se quita solo; el de actualización espera la decisión del jugador.
  useEffect(() => {
    if (!offlineReady || needRefresh) return
    const timer = setTimeout(dismissPwaNotice, 5000)
    return () => clearTimeout(timer)
  }, [offlineReady, needRefresh])

  if (!needRefresh && !offlineReady) return null

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 top-0 z-30 mx-auto flex max-w-md justify-center p-3"
    >
      <div
        className={`pointer-events-auto flex flex-col gap-2 bg-noche ring-2 ring-sol-400 shadow-[0_12px_30px_rgb(0_0_0/0.5)] ${needRefresh ? 'w-full rounded-2xl p-4' : 'rounded-full px-4 py-2'}`}
      >
        {needRefresh ? (
          <>
            <p className="font-display">Hay una versión nueva</p>
            <p className="text-sm text-lila">
              Tu partida se guarda sola. Después de actualizar, abre la app y pulsa Continuar
              partida.
            </p>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => void updateNow()}>
                Actualizar
              </Button>
              <Button variant="ghost" className="flex-1" onClick={dismissPwaNotice}>
                Después
              </Button>
            </div>
          </>
        ) : (
          <p className="text-sm font-semibold">Lista para jugar sin conexión</p>
        )}
      </div>
    </div>
  )
}
