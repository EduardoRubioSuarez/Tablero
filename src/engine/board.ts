import type { Action } from '../content/schema'
import { shuffle, type Rng } from './rng'
import { CELLS_PER_LAP, type Board } from './types'

/** Los retrocesos solo pueden estar desde esta posición, para no salirse de la vuelta. */
export const MIN_BACK_POSITION = 11
/** "VUELVE A LA SALIDA" siempre está dentro de las últimas 20 casillas. */
export const LAP_START_MIN_POSITION = 41
export const LAP_START_MAX_POSITION = 60

const MAX_PLACEMENT_ATTEMPTS = 1000

function isLapStart(action: Action): boolean {
  return action.effect?.type === 'toLapStart'
}

function isMovement(action: Action): boolean {
  return action.effect !== undefined
}

/**
 * Hito 2.2. Elige las 60 acciones de la partida: una casilla "VUELVE A LA SALIDA" (siempre)
 * más 59 acciones al azar, sin repetir. El resultado no está ordenado como tablero.
 */
export function selectActions(actions: readonly Action[], rng: Rng): Action[] {
  const lapStarts = actions.filter(isLapStart)
  if (lapStarts.length === 0) {
    throw new Error('El contenido debe incluir al menos una casilla "VUELVE A LA SALIDA"')
  }
  const chosenLapStart = lapStarts[rng.int(lapStarts.length)]
  const pool = actions.filter((a) => !isLapStart(a))
  if (pool.length < CELLS_PER_LAP - 1) {
    throw new Error(
      `Se necesitan al menos ${CELLS_PER_LAP} acciones; solo hay ${pool.length + 1} utilizables`,
    )
  }
  const others = shuffle(pool, rng).slice(0, CELLS_PER_LAP - 1)
  return [chosenLapStart, ...others]
}

/** Posiciones (1 a 60) donde puede ir una casilla de movimiento, dadas las ya colocadas. */
function validPositions(
  action: Action,
  occupied: ReadonlySet<number>,
  forbiddenDestinations: ReadonlySet<number>,
): number[] {
  const positions: number[] = []
  for (let p = 1; p <= CELLS_PER_LAP; p++) {
    if (occupied.has(p) || forbiddenDestinations.has(p)) continue
    const effect = action.effect
    if (effect?.type === 'toLapStart') {
      if (p < LAP_START_MIN_POSITION || p > LAP_START_MAX_POSITION) continue
    } else if (effect?.type === 'back') {
      if (p < MIN_BACK_POSITION || p - effect.steps < 1) continue
      // El destino del retroceso no puede ser otra casilla de movimiento.
      if (occupied.has(p - effect.steps)) continue
    }
    positions.push(p)
  }
  return positions
}

function tryPlace(selected: readonly Action[], rng: Rng): Action[] | null {
  const movers = selected
    .filter(isMovement)
    .sort((a, b) => Number(isLapStart(b)) - Number(isLapStart(a)))
  const rest = shuffle(
    selected.filter((a) => !isMovement(a)),
    rng,
  )
  const slots: (Action | null)[] = new Array<Action | null>(CELLS_PER_LAP).fill(null)
  const occupied = new Set<number>()
  const forbiddenDestinations = new Set<number>()

  for (const mover of movers) {
    const candidates = validPositions(mover, occupied, forbiddenDestinations)
    if (candidates.length === 0) return null
    const position = candidates[rng.int(candidates.length)]
    slots[position - 1] = mover
    occupied.add(position)
    if (mover.effect?.type === 'back') forbiddenDestinations.add(position - mover.effect.steps)
  }

  let next = 0
  for (let i = 0; i < slots.length; i++) {
    if (slots[i] === null) slots[i] = rest[next++]
  }
  return slots as Action[]
}

/**
 * Hito 2.3. Arma el tablero de 60 casillas respetando las reglas de movimiento.
 * Si una colocación no cumple las reglas, reintenta con un sorteo nuevo.
 */
export function buildBoard(actions: readonly Action[], rng: Rng): Board {
  for (let attempt = 0; attempt < MAX_PLACEMENT_ATTEMPTS; attempt++) {
    const board = tryPlace(selectActions(actions, rng), rng)
    if (board && validateBoard(board).length === 0) return board
  }
  throw new Error(
    `No se pudo armar un tablero válido tras ${MAX_PLACEMENT_ATTEMPTS} intentos; revisa que el contenido tenga una sola "VUELVE A LA SALIDA" colocable y pocos retrocesos`,
  )
}

/**
 * Revisa las reglas del tablero y devuelve la lista de problemas (vacía si es válido).
 * Es independiente del generador, por lo que sirve para probarlo y para validar partidas guardadas.
 */
export function validateBoard(board: Board): string[] {
  const problems: string[] = []

  if (board.length !== CELLS_PER_LAP) {
    problems.push(`El tablero debe tener ${CELLS_PER_LAP} casillas y tiene ${board.length}`)
    return problems
  }

  const ids = new Set<string>()
  board.forEach((action, index) => {
    if (ids.has(action.id)) problems.push(`Acción repetida: ${action.id} (posición ${index + 1})`)
    ids.add(action.id)
  })

  const lapStartPositions: number[] = []
  board.forEach((action, index) => {
    const position = index + 1
    const effect = action.effect
    if (effect?.type === 'toLapStart') lapStartPositions.push(position)
    if (effect?.type === 'back') {
      if (position < MIN_BACK_POSITION) {
        problems.push(
          `El retroceso de la posición ${position} debe estar en la ${MIN_BACK_POSITION} o más`,
        )
      }
      const destination = position - effect.steps
      if (destination < 1) {
        problems.push(
          `El retroceso de la posición ${position} sale de la vuelta (destino ${destination})`,
        )
      } else if (board[destination - 1].effect !== undefined) {
        problems.push(
          `El retroceso de la posición ${position} termina en otra casilla de movimiento (${destination})`,
        )
      }
    }
  })

  if (lapStartPositions.length !== 1) {
    problems.push(
      `Debe haber exactamente una casilla "VUELVE A LA SALIDA"; hay ${lapStartPositions.length}`,
    )
  } else if (
    lapStartPositions[0] < LAP_START_MIN_POSITION ||
    lapStartPositions[0] > LAP_START_MAX_POSITION
  ) {
    problems.push(
      `"VUELVE A LA SALIDA" debe estar entre las posiciones ${LAP_START_MIN_POSITION} y ${LAP_START_MAX_POSITION}; está en la ${lapStartPositions[0]}`,
    )
  }

  return problems
}
