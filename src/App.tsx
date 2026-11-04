import { useGame } from './store/gameStore'
import { AgeDenied, AgeWarning } from './ui/AgeWarning'
import { Home } from './ui/Home'
import { PlayersModal } from './ui/PlayersModal'
import { Results } from './ui/Results'
import { RulesModal } from './ui/RulesModal'
import { Setup } from './ui/Setup'
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
  // El reglamento solo se ofrece dentro de la partida.
  const showRules = screen === 'game'
  const modalOpen = useGame((s) => s.rulesOpen || s.playersOpen)
  return (
    <>
      {/* Con un panel abierto, lo de atrás queda inerte: sin foco ni lectura por teclado o lector de pantalla. */}
      <div inert={modalOpen}>
        <Screen />
      </div>
      {showRules && <RulesModal />}
      {showRules && <PlayersModal />}
    </>
  )
}

export default App
