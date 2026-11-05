import { CELLS_PER_LAP, type Player } from '../../engine'
import { playerColor, type Spot } from './geometry'

const TICKS = [1, 15, 30, 45, 60]

/**
 * Hito 4.5. Tira de las 60 casillas con un punto de color por jugador. Así se ve a todos aunque
 * el mapa esté acercado a otra zona. `range` marca, con un marco, las casillas que enseña la cámara.
 */
export function ProgressStrip({
  players,
  spots,
  turnId,
  range,
  className = '',
}: {
  players: readonly Player[]
  spots: ReadonlyMap<string, Spot>
  turnId: string
  range?: { from: number; to: number } | null
  className?: string
}) {
  const pct = (position: number) => `${(position / CELLS_PER_LAP) * 100}%`
  const ordered = [...players].sort((a, b) => Number(a.id === turnId) - Number(b.id === turnId))

  return (
    <div aria-hidden="true" className={`tiny:h-6 relative mx-1 h-9 ${className}`}>
      <div className="absolute inset-x-0 top-3.5 h-1.5 rounded-full bg-white/20" />
      {range && (
        <div
          className="absolute top-2 h-5 rounded-md border-2 border-sol-400 bg-sol-400/15 transition-[left,width] duration-500"
          style={{
            left: pct(Math.max(0, range.from - 1)),
            width: `${((range.to - range.from + 1) / CELLS_PER_LAP) * 100}%`,
          }}
        />
      )}
      {ordered.map((player) => {
        const spot = spots.get(player.id)
        if (!spot) return null
        const isTurn = player.id === turnId
        return (
          <span
            key={player.id}
            className={`absolute rounded-full border-2 transition-[left] duration-100 ${
              isTurn
                ? 'top-2.5 z-10 size-4 -translate-x-1/2 border-white ring-2 ring-sol-400'
                : 'top-3 size-3 -translate-x-1/2 border-noche'
            }`}
            style={{ left: pct(spot.position), background: playerColor(player.id) }}
          />
        )
      })}
      {TICKS.map((n) => (
        <span
          key={n}
          className="tiny:hidden absolute top-[22px] -translate-x-1/2 text-[9px] text-lila/80 tabular-nums"
          style={{ left: pct(n) }}
        >
          {n}
        </span>
      ))}
    </div>
  )
}
