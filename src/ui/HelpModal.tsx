import ayuda from '../content/ayuda.md?raw'
import { useGame } from '../store/gameStore'
import { InfoModal } from './InfoModal'

/** Hito 3.6 (ajustado). Ayuda durante la partida: qué hacer en ciertas situaciones, sin perder el estado. */
export function HelpModal() {
  const open = useGame((s) => s.helpOpen)
  const close = useGame((s) => s.closeHelp)
  return <InfoModal open={open} onClose={close} title="Ayuda" source={ayuda} />
}
