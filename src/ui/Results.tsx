import { CELLS_PER_LAP, getRanking } from '../engine'
import { useGame } from '../store/gameStore'
import { Button } from './Button'

/** Hito 3.8. Aviso de fin de partida y tabla de posiciones. */
export function Results() {
  const game = useGame((s) => s.game)
  const playAgain = useGame((s) => s.playAgain)
  const goSetup = useGame((s) => s.goSetup)
  const goHome = useGame((s) => s.goHome)

  if (!game) return null
  const ranking = getRanking(game)
  const winner = game.players.find((p) => p.id === game.winnerId)

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 p-4">
      <header className="flex flex-col gap-1">
        <p role="status" className="text-sm font-semibold tracking-wide text-amber-300 uppercase">
          La partida terminó
        </p>
        <h1 className="text-4xl font-bold break-words">Ganó {winner?.name}</h1>
      </header>

      <section aria-labelledby="ranking-title" className="flex flex-col gap-2">
        <h2 id="ranking-title" className="font-semibold">
          Tabla de posiciones
        </h2>
        <ol className="flex flex-col gap-2">
          {ranking.map(({ player, rank }) => (
            <li key={player.id} className="flex items-center gap-3 rounded-xl bg-zinc-900 p-3">
              <span className="w-8 text-center text-xl font-bold text-amber-300">{rank}</span>
              <span className="min-w-0 flex-1 truncate font-semibold">{player.name}</span>
              <span className="text-sm text-zinc-400">
                {player.id === game.winnerId
                  ? 'Meta'
                  : `Vuelta ${player.lap} · ${player.position === 0 ? 'salida' : `casilla ${player.position}`}`}
              </span>
            </li>
          ))}
        </ol>
        <p className="text-xs text-zinc-500">
          Tablero de {CELLS_PER_LAP} casillas por vuelta · {game.laps}{' '}
          {game.laps === 1 ? 'vuelta' : 'vueltas'}
        </p>
      </section>

      <div className="mt-auto flex flex-col gap-3">
        <Button onClick={playAgain}>Jugar otra vez</Button>
        <Button variant="secondary" onClick={goSetup}>
          Cambiar jugadores o vueltas
        </Button>
        <Button variant="ghost" onClick={goHome}>
          Inicio
        </Button>
      </div>
    </main>
  )
}
