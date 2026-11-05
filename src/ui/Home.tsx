import { useGame } from '../store/gameStore'
import { InstallGuide } from '../pwa/InstallGuide'
import { PwaNotice } from '../pwa/PwaNotice'
import { Button } from './Button'
import { Confeti } from './Confeti'
import { Dice3D } from './Dice3D'

export function Home() {
  const saved = useGame((s) => s.saved)
  const corrupt = useGame((s) => s.savedWasCorrupt)
  const goSetup = useGame((s) => s.goSetup)
  const resumeSaved = useGame((s) => s.resumeSaved)
  const discardSaved = useGame((s) => s.discardSaved)
  const openRules = useGame((s) => s.openRules)
  const openNotice = useGame((s) => s.openNotice)
  const openShare = useGame((s) => s.openShare)

  return (
    <main className="anim-pantalla mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-4">
      <Confeti seed={3} />
      <PwaNotice />
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="mb-6">
          <Dice3D value={null} rolling={false} />
        </div>
        <h1 className="font-display text-6xl leading-none tracking-wide text-sol-400 [text-shadow:0_3px_0_#b78a00,0_10px_18px_rgb(0_0_0/0.45)]">
          TABLERO
        </h1>
        <p className="text-lila">Juego de fiesta interactivo</p>
      </div>

      {corrupt && (
        <p
          role="status"
          className="rounded-xl bg-white/10 ring-1 ring-white/10 p-3 text-sm text-sol-300"
        >
          La partida guardada estaba dañada y se descartó.
        </p>
      )}

      {saved && (
        <section
          aria-label="Partida guardada"
          className="flex flex-col gap-3 rounded-2xl bg-white/10 ring-1 ring-white/10 p-5"
        >
          <h2 className="font-display text-lg">Tienes una partida sin terminar</h2>
          <p className="text-sm text-lila">
            {saved.players.length} jugadores · {saved.laps}{' '}
            {saved.laps === 1 ? 'vuelta' : 'vueltas'}
          </p>
          <Button onClick={resumeSaved}>Continuar partida</Button>
          <Button variant="ghost" onClick={discardSaved}>
            Descartar partida guardada
          </Button>
        </section>
      )}

      <Button variant={saved ? 'secondary' : 'primary'} onClick={goSetup}>
        Nueva partida
      </Button>
      <Button variant="secondary" onClick={openRules}>
        Reglas
      </Button>
      <Button variant="secondary" onClick={openShare}>
        Comparte el juego
      </Button>
      <Button variant="ghost" onClick={openNotice} className="min-h-10 text-sm">
        Aviso y privacidad
      </Button>

      <InstallGuide />
    </main>
  )
}
