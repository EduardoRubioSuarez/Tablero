import reglamento from '../content/reglamento.md?raw'
import { useGame } from '../store/gameStore'
import { InfoModal } from './InfoModal'

/** Reglamento completo. Se abre desde el menú de inicio. */
export function RulesModal() {
  const open = useGame((s) => s.rulesOpen)
  const close = useGame((s) => s.closeRules)
  return <InfoModal open={open} onClose={close} title="Reglamento" source={reglamento} />
}
