import { useMemo, useRef, useState } from 'react'
import { useGame } from '../store/gameStore'
import { Button } from './Button'
import { qrModules, qrPath } from './qr'
import { useModal } from './useModal'

/** Dirección del juego: la misma desde la que se abrió la app, sin parámetros. */
function gameUrl(): string {
  return `${window.location.origin}/`
}

/** Hito 6.4. Pantalla "Comparte el juego": código QR, enlace y botón para compartir. */
export function ShareModal() {
  const open = useGame((s) => s.shareOpen)
  const close = useGame((s) => s.closeShare)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [copied, setCopied] = useState(false)
  useModal(open, close, closeRef)

  const url = open ? gameUrl() : ''
  const qr = useMemo(() => (url ? qrPath(qrModules(url)) : null), [url])
  if (!open || !qr) return null

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }
  const canShare = typeof navigator.share === 'function'

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Comparte el juego"
      className="anim-pantalla fondo-mesa fixed inset-0 z-50 flex flex-col"
    >
      <div className="mx-auto flex w-full max-w-md items-center justify-between p-4">
        <span className="font-display text-xl text-sol-400">Comparte el juego</span>
        <Button ref={closeRef} variant="secondary" onClick={close}>
          Cerrar
        </Button>
      </div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center gap-4 overflow-y-auto px-4 pb-8">
        <p className="text-center text-lila">
          Escanea el código con la cámara del celular para abrir Tablero.
        </p>
        <div className="canto-carta w-full max-w-64 rounded-3xl bg-white p-3">
          <svg
            viewBox={`0 0 ${qr.size} ${qr.size}`}
            role="img"
            aria-label="Código QR para abrir Tablero"
            shapeRendering="crispEdges"
            className="block w-full"
          >
            <path d={qr.path} fill="#0f1f5c" />
          </svg>
        </div>
        <p className="text-center text-sm break-all text-lila">{url}</p>
        <div className="flex w-full flex-col gap-2">
          {canShare && (
            <Button onClick={() => void navigator.share({ title: 'Tablero', url })}>
              Compartir enlace
            </Button>
          )}
          <Button variant={canShare ? 'secondary' : 'primary'} onClick={() => void copy()}>
            {copied ? 'Enlace copiado' : 'Copiar enlace'}
          </Button>
        </div>
      </div>
    </div>
  )
}
