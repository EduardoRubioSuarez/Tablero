import { useEffect } from 'react'
import { useGame } from './store/gameStore'
import { AgeDenied, AgeWarning } from './ui/AgeWarning'
import { HelpModal } from './ui/HelpModal'
import { NoticeModal } from './ui/NoticeModal'
import { ShareModal } from './ui/ShareModal'
import { Home } from './ui/Home'
import { MapView } from './ui/map/MapView'
import { PlayersModal } from './ui/PlayersModal'
import { Results } from './ui/Results'
import { RulesModal } from './ui/RulesModal'
import { Setup } from './ui/Setup'
import { unlockAudio } from './ui/feedback'
import { Table } from './ui/Table'

/** Hito 3.1. Muestra la pantalla que corresponde al estado de la partida. */
function Screen() {
  const screen = useGame((s) => s.screen)
  switch (screen) {
    case 'warning':
      return <AgeWarning />
    case 'denied':
      return <AgeDenied />
    case 'home':
      return <Home />
    case 'setup':
      return <Setup />
    case 'game':
      return <Table />
    case 'results':
      return <Results />
  }
}

function App() {
  const screen = useGame((s) => s.screen)
  // El primer toque despierta el audio para que los sonidos puedan sonar.
  useEffect(() => {
    window.addEventListener('pointerdown', unlockAudio, { once: true })
    return () => window.removeEventListener('pointerdown', unlockAudio)
  }, [])
  // El reglamento se lee desde el inicio; durante la partida solo hay ayuda, jugadores y mapa.
  const inGame = screen === 'game'
  const modalOpen = useGame(
    (s) => s.rulesOpen || s.helpOpen || s.noticeOpen || s.shareOpen || s.playersOpen || s.mapOpen,
  )
  return (
    <>
      {/* Con un panel abierto, lo de atrás queda inerte: sin foco ni lectura por teclado o lector de pantalla. */}
      <div inert={modalOpen}>
        <Screen />
      </div>
      {screen === 'home' && <RulesModal />}
      {screen === 'home' && <NoticeModal />}
      {screen === 'home' && <ShareModal />}
      {inGame && <HelpModal />}
      {inGame && <PlayersModal />}
      {inGame && <MapView />}
    </>
  )
}

export default App
