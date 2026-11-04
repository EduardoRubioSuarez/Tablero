import { useEffect, useRef, type RefObject } from 'react'

/**
 * Comportamiento común de los paneles a pantalla completa: al abrir enfoca un elemento,
 * Escape cierra, y al cerrar devuelve el foco a lo que lo tenía antes (por ejemplo, el botón
 * que abrió el panel).
 *
 * `onClose` puede cambiar en cada render sin volver a robar el foco: el efecto solo depende de `open`.
 */
export function useModal(
  open: boolean,
  onClose: () => void,
  initialFocus: RefObject<HTMLElement | null>,
) {
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    initialFocus.current?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      previous?.focus?.()
    }
  }, [open, initialFocus])
}
