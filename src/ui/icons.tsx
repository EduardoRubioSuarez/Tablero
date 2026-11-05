import type { ActionKind } from '../content'
import { ICONS } from './iconDrawings'
import { iconKeyFor } from './iconMap'

/** Dibuja un ícono de casilla. Es decorativo: el texto de la acción lleva el significado. */
export function ActionIcon({
  actionId,
  kind,
  className,
}: {
  actionId: string
  kind: ActionKind
  className?: string
}) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      {ICONS[iconKeyFor(actionId, kind)]}
    </svg>
  )
}
