import { useEffect, useState } from 'react'
import { createWakeLock, type WakeStatus } from './wakeLock'

/** Mantiene la pantalla encendida mientras el componente está en pantalla. */
export function useWakeLock(): WakeStatus {
  const [status, setStatus] = useState<WakeStatus>('idle')
  useEffect(() => {
    const controller = createWakeLock(navigator, document, setStatus)
    void controller.start()
    return () => void controller.stop()
  }, [])
  return status
}
