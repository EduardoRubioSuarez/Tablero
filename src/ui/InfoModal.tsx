import { useRef } from 'react'
import { Button } from './Button'
import { Markdown } from './Markdown'
import { useModal } from './useModal'

/** Panel a pantalla completa con un texto en Markdown. Lo usan el reglamento y la ayuda. */
export function InfoModal({
  open,
  onClose,
  title,
  source,
}: {
  open: boolean
  onClose: () => void
  title: string
  source: string
}) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useModal(open, onClose, closeRef)

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="anim-pantalla fondo-mesa fixed inset-0 z-50 flex flex-col"
    >
      <div className="mx-auto flex w-full max-w-md items-center justify-between p-4">
        <span className="font-display text-xl text-sol-400">{title}</span>
        <Button ref={closeRef} variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
      </div>
      <div
        tabIndex={0}
        aria-label={`Texto de ${title.toLowerCase()}`}
        className="mx-auto w-full max-w-md flex-1 overflow-y-auto px-4 pb-8"
      >
        <Markdown source={source} />
      </div>
    </div>
  )
}
