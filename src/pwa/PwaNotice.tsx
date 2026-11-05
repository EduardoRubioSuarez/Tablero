import { useEffect } from 'react'
import { Button } from '../ui/Button'
import { dismissPwaNotice, updateNow, usePwaState } from './updateStore'

/**
 * Hitos 5.2 y 5.4. Avisos del service worker: hay una versión nueva (el jugador decide cuándo
 * actualizar) o la app ya funciona sin conexión. Va dentro de la pantalla, sin tapar botones.
 */
export function PwaNotice() {
  const { needRefresh, offlineReady } = usePwaState()

  // El aviso de "sin conexión" se quita solo; el de actualización espera la decisión del jugador.
  useEffect(() => {
    if (!offlineReady || needRefresh) return
    const timer = setTimeout(dismissPwaNotice, 8000)
    return () => clearTimeout(timer)
  }, [offlineReady, needRefresh])

  if (!needRefresh && !offlineReady) return null

  return (
    <div role="status">
      <div className="flex flex-col gap-2 rounded-2xl bg-noche p-4 ring-2 ring-sol-400">
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
          <div className="flex items-center gap-3">
            <p className="flex-1 text-sm">Lista para jugar sin conexión.</p>
            <Button
              variant="secondary"
              className="min-h-10 px-4 text-sm"
              onClick={dismissPwaNotice}
            >
              Entendido
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
