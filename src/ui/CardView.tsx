import type { Game } from '../engine'
import { CELLS_PER_LAP } from '../engine'
import { Button } from './Button'

/** Frase que explica el efecto de la tarjeta, si lo tiene. */
function effectHint(game: Game): string | null {
  const effect = game.currentCard?.action.effect
  if (!effect) return null
  if (game.winnerId !== null) return 'Como ya ganaste, este efecto no se aplica.'
  if (effect.type === 'back') return `Al continuar, retrocedes ${effect.steps} casillas.`
  return 'Al continuar, vuelves a la salida de esta vuelta.'
}

/**
 * Hito 3.5. Tarjeta de la casilla: texto grande y un único botón "Continuar".
 * Cubre también el retroceso (dos tarjetas seguidas) y la tarjeta final del ganador.
 */
export function CardView({ game, onContinue }: { game: Game; onContinue: () => void }) {
  const card = game.currentCard
  if (!card) return null
  const player = game.players[game.turn]
  const winner = game.winnerId !== null ? player : null
  const hint = effectHint(game)

  return (
    <section
      aria-label={`Tarjeta de la casilla ${card.position}`}
      className="flex flex-1 flex-col gap-4 rounded-3xl bg-zinc-900 p-5"
    >
      {winner && (
        <p role="status" className="rounded-xl bg-amber-400 p-3 text-center font-bold text-black">
          ¡{winner.name} llegó a la meta!
        </p>
      )}

      <p className="text-sm text-zinc-400">
        {card.viaEffect ? 'Retrocediste a la casilla' : 'Casilla'} {card.position} de{' '}
        {CELLS_PER_LAP}
        {' · '}
        <span className="text-zinc-200">{player.name}</span>
      </p>

      <p className="flex flex-1 items-center text-3xl leading-tight font-bold text-balance">
        {card.action.text}
      </p>

      {hint && <p className="rounded-xl bg-zinc-800 p-3 text-sm text-amber-300">{hint}</p>}

      <Button onClick={onContinue}>Continuar</Button>
    </section>
  )
}
