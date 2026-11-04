import { useGame } from '../store/gameStore'
import { Button } from './Button'

export function Home() {
  const saved = useGame((s) => s.saved)
  const corrupt = useGame((s) => s.savedWasCorrupt)
  const goSetup = useGame((s) => s.goSetup)
  const resumeSaved = useGame((s) => s.resumeSaved)
  const discardSaved = useGame((s) => s.discardSaved)

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-4">
      <h1 className="text-4xl font-bold">Tablero</h1>

      {corrupt && (
        <p role="status" className="rounded-xl bg-zinc-900 p-3 text-sm text-amber-300">
          La partida guardada estaba dañada y se descartó.
        </p>
      )}

      {saved && (
        <section
          aria-label="Partida guardada"
          className="flex flex-col gap-3 rounded-2xl bg-zinc-900 p-5"
        >
          <h2 className="text-lg font-semibold">Tienes una partida sin terminar</h2>
          <p className="text-sm text-zinc-400">
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
    </main>
  )
}
