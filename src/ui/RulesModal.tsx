import { useRef } from 'react'
import reglamento from '../content/reglamento.md?raw'
import { useGame } from '../store/gameStore'
import { Button } from './Button'
import { Markdown } from './Markdown'
import { useModal } from './useModal'

/** Hito 3.6. Reglamento disponible durante la partida sin perder el estado. */
export function RulesModal() {
  const open = useGame((s) => s.rulesOpen)
  const closeRules = useGame((s) => s.closeRules)
  const closeRef = useRef<HTMLButtonElement>(null)
  useModal(open, closeRules, closeRef)

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Reglamento"
      className="fixed inset-0 z-50 flex flex-col bg-zinc-950"
    >
      <div className="mx-auto flex w-full max-w-md items-center justify-between p-4">
        <span className="text-sm text-zinc-400">Reglamento</span>
        <Button ref={closeRef} variant="secondary" onClick={closeRules}>
          Cerrar
        </Button>
      </div>
      <div className="mx-auto w-full max-w-md flex-1 overflow-y-auto px-4 pb-8">
        <Markdown source={reglamento} />
      </div>
    </div>
  )
}
