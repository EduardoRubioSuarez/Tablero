import { CELLS_PER_LAP } from '../engine'
import { useGame } from '../store/gameStore'
import { Button } from './Button'
import { CardView } from './CardView'

/** Hito 3.4. Pantalla de turno: jugador actual, dado y avance de la ficha. */
export function Table() {
  const game = useGame((s) => s.game)
  const saveFailed = useGame((s) => s.saveFailed)
  const roll = useGame((s) => s.roll)
  const next = useGame((s) => s.next)
  const openRules = useGame((s) => s.openRules)
  const openPlayers = useGame((s) => s.openPlayers)

  if (!game) return null
  const player = game.players[game.turn]

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">
          Vuelta {player.lap} de {game.laps}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={openPlayers}>
            Jugadores
          </Button>
          <Button variant="secondary" onClick={openRules}>
            Reglamento
          </Button>
        </div>
      </header>

      {saveFailed && (
        <p role="status" className="rounded-xl bg-zinc-900 p-3 text-sm text-amber-300">
          No se pudo guardar la partida en este navegador. Puedes seguir jugando, pero no se podrá
          retomar.
        </p>
      )}

      <section aria-live="polite" className="rounded-2xl bg-zinc-900 p-5">
        <p className="text-sm text-zinc-400">Turno de</p>
        <h1 className="text-4xl font-bold break-words">{player.name}</h1>
        <p className="mt-2 text-zinc-300">
          {player.position === 0
            ? 'En la salida'
            : `Casilla ${player.position} de ${CELLS_PER_LAP}`}
        </p>
        {game.lastRoll !== null && (
          <p className="mt-1 text-sm text-zinc-400">
            Dado: <span className="text-xl font-bold text-amber-300">{game.lastRoll}</span>
          </p>
        )}
      </section>

      {game.phase === 'roll' ? (
        <div className="mt-auto flex flex-col gap-3">
          <Button onClick={roll} className="min-h-20 text-2xl">
            Tirar dado
          </Button>
        </div>
      ) : (
        <CardView game={game} onContinue={next} />
      )}
    </main>
  )
}
