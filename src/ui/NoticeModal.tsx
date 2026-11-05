import aviso from '../content/aviso.md?raw'
import { useGame } from '../store/gameStore'
import { InfoModal } from './InfoModal'

/** Hito 6.2. Aviso legal y de privacidad, desde el menú de inicio. */
export function NoticeModal() {
  const open = useGame((s) => s.noticeOpen)
  const close = useGame((s) => s.closeNotice)
  return <InfoModal open={open} onClose={close} title="Aviso y privacidad" source={aviso} />
}
