import { memo, type CSSProperties, type Ref } from 'react'
import type { Board, Player } from '../../engine'
import { ActionIcon } from '../icons'
import { FINISH_ROW, START_ROW, displayOrder, rowOf, playerColor, type Spot } from './geometry'

/** Cuántas fichas se dibujan en una casilla; las demás se cuentan con un "×n". */
const MAX_PAWNS_IN_CELL = 2
const MAX_PAWNS_IN_START = 6

type PawnInfo = { id: string; color: string; turn: boolean }

function Pawn({ pawn, left }: { pawn: PawnInfo; left: string }) {
  return (
    <span
      className={`peon ${pawn.turn ? 'peon-turno' : ''}`}
      style={{ left, '--c': pawn.color } as CSSProperties}
    >
      <span className="peon-i anim-salto" />
    </span>
  )
}

function Pawns({ pawns, max }: { pawns: PawnInfo[]; max: number }) {
  if (pawns.length === 0) return null
  const shown = pawns.slice(0, max)
  const extra = pawns.length - shown.length
  return (
    <div className="fichas">
      {shown.map((pawn, i) => (
        <Pawn key={pawn.id} pawn={pawn} left={`${((i + 1) / (shown.length + 1)) * 100}%`} />
      ))}
      {extra > 0 && <span className="peon-mas">+{extra}</span>}
    </div>
  )
}

const Cell = memo(function Cell({
  position,
  board,
  pawns,
  focused,
}: {
  position: number
  board: Board
  pawns: PawnInfo[]
  focused: boolean
}) {
  const action = board[position - 1]
  return (
    <div
      data-row={rowOf(position)}
      data-position={position}
      className={`casilla ${action.kind === 'movement' ? 'casilla-mov' : ''} ${focused ? 'casilla-foco' : ''}`}
    >
      <span className="casilla-n">{position}</span>
      <ActionIcon actionId={action.id} kind={action.kind} className="casilla-ic" />
      <Pawns pawns={pawns} max={MAX_PAWNS_IN_CELL} />
    </div>
  )
})

/**
 * Hitos 4.3 y 4.4. Tablero grueso de laca, inclinado hacia el jugador. Muestra la salida, las
 * 60 casillas en camino serpenteante con su ilustración, la meta y las fichas de todos.
 */
export function Board3D({
  board,
  players,
  spots,
  turnId,
  focusPosition,
  tilt,
  boardRef,
}: {
  board: Board
  players: readonly Player[]
  spots: ReadonlyMap<string, Spot>
  turnId: string
  focusPosition: number
  tilt: number
  boardRef?: Ref<HTMLDivElement>
}) {
  const byPosition = new Map<number, PawnInfo[]>()
  for (const player of players) {
    const spot = spots.get(player.id)
    if (!spot) continue
    const list = byPosition.get(spot.position) ?? []
    list.push({ id: player.id, color: playerColor(player.id), turn: player.id === turnId })
    byPosition.set(spot.position, list)
  }

  return (
    <div className="mapa-caja">
      <div
        ref={boardRef}
        className="tablero3d canto-laca"
        style={{ transform: `rotateX(${tilt}deg)`, '--tilt': `${tilt}deg` } as CSSProperties}
      >
        <div className="pad pad-salida" data-row={START_ROW}>
          SALIDA
          <Pawns pawns={byPosition.get(0) ?? []} max={MAX_PAWNS_IN_START} />
        </div>
        {displayOrder().map((position) => (
          <Cell
            key={position}
            position={position}
            board={board}
            pawns={byPosition.get(position) ?? []}
            focused={position === focusPosition}
          />
        ))}
        <div className="pad pad-meta" data-row={FINISH_ROW}>
          <span>META</span>
        </div>
      </div>
    </div>
  )
}
