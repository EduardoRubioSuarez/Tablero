import { useEffect } from 'react'
import { CELLS_PER_LAP, getRanking } from '../engine'
import { useGame } from '../store/gameStore'
import { Button } from './Button'
import { Confeti } from './Confeti'
import { signal } from './feedback'
import { playerColor } from './map/geometry'

/** Hito 3.8. Aviso de fin de partida y tabla de posiciones. */
export function Results() {
  const game = useGame((s) => s.game)
  const playAgain = useGame((s) => s.playAgain)
  const goSetup = useGame((s) => s.goSetup)
  const goHome = useGame((s) => s.goHome)
  const sound = useGame((s) => s.sound)
  const vibration = useGame((s) => s.vibration)

  // Fanfarria al llegar a la pantalla final.
  useEffect(() => {
    signal('win', { sound, vibration })
    // Solo al entrar; cambiar los ajustes aquí no debe repetirla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!game) return null
  const ranking = getRanking(game)
  const winner = game.players.find((p) => p.id === game.winnerId)

  return (
    <main className="anim-pantalla mx-auto flex min-h-dvh max-w-md flex-col gap-5 p-4">
      <Confeti seed={game.seed} />
      <header className="flex flex-col gap-2">
        <p
          role="status"
          className="font-display w-fit rounded-full border-2 border-ink bg-sol-400 px-4 py-1 text-sm text-ink"
        >
          La partida terminó
        </p>
        <h1 className="font-display text-4xl leading-tight break-words text-sol-400 [text-shadow:0_3px_0_#b78a00,0_10px_18px_rgb(0_0_0/0.45)]">
          Ganó {winner?.name}
        </h1>
      </header>

      <section aria-labelledby="ranking-title" className="flex flex-col gap-2">
        <h2 id="ranking-title" className="font-display text-lg">
          Tabla de posiciones
        </h2>
        <ol className="flex flex-col gap-2">
          {ranking.map(({ player, rank }) => (
            <li
              key={player.id}
              className={`flex items-center gap-3 rounded-xl p-3 ${
                rank === 1
                  ? 'bg-sol-400/20 ring-2 ring-sol-400'
                  : 'bg-white/10 ring-1 ring-white/10'
              }`}
            >
              <span className="font-display w-8 text-center text-xl text-sol-300">{rank}</span>
              <span
                aria-hidden="true"
                className="size-4 shrink-0 rounded-full border-2 border-noche"
                style={{ background: playerColor(player.id) }}
              />
              <span className="min-w-0 flex-1 truncate font-semibold">{player.name}</span>
              <span className="text-sm text-lila">
                {player.id === game.winnerId
                  ? 'Meta'
                  : `Vuelta ${player.lap} · ${player.position === 0 ? 'salida' : `casilla ${player.position}`}`}
              </span>
            </li>
          ))}
        </ol>
        <p className="text-xs text-lila/80">
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
