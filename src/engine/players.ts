import { MAX_PLAYERS, MIN_PLAYERS, type Game, type Player } from './types'

/**
 * Hito 3.9. Sacar y agregar jugadores durante la partida.
 *
 * Solo se permite cuando le toca tirar el dado (`phase: 'roll'`), para no dejar una tarjeta
 * pendiente de alguien que ya no está.
 */

function assertCanChange(game: Game): void {
  if (game.phase !== 'roll') {
    throw new Error('Solo se puede cambiar la lista de jugadores antes de tirar el dado')
  }
}

/** Vuelta en la que está la mayoría de los jugadores; si hay empate, la menor. */
export function majorityLap(players: readonly Player[]): number {
  const counts = new Map<number, number>()
  for (const p of players) counts.set(p.lap, (counts.get(p.lap) ?? 0) + 1)
  let bestLap = 1
  let bestCount = 0
  for (const [lap, count] of [...counts].sort((a, b) => a[0] - b[0])) {
    if (count > bestCount) {
      bestLap = lap
      bestCount = count
    }
  }
  return bestLap
}

function nextPlayerId(players: readonly Player[]): string {
  const highest = players.reduce((max, p) => Math.max(max, Number(p.id.slice(1)) || 0), 0)
  return `p${highest + 1}`
}

/**
 * Agrega un jugador al final de la lista de turnos. Empieza en la salida (posición 0) de la
 * vuelta donde está la mayoría de los jugadores; con empate, en la menor. El turno no cambia.
 */
export function addPlayer(game: Game, name: string): Game {
  assertCanChange(game)
  const trimmed = name.trim()
  if (trimmed.length === 0) throw new Error('El jugador debe tener nombre')
  if (game.players.length >= MAX_PLAYERS) {
    throw new RangeError(`No puede haber más de ${MAX_PLAYERS} jugadores`)
  }
  const newcomer: Player = {
    id: nextPlayerId(game.players),
    name: trimmed,
    lap: majorityLap(game.players),
    position: 0,
  }
  return { ...game, players: [...game.players, newcomer] }
}

/**
 * Saca a un jugador. No puede quedar la partida con menos de 2. Si se saca al jugador al que
 * le toca, el turno pasa al que sigue en el orden.
 */
export function removePlayer(game: Game, playerId: string): Game {
  assertCanChange(game)
  const index = game.players.findIndex((p) => p.id === playerId)
  if (index === -1) throw new Error('Ese jugador no está en la partida')
  if (game.players.length <= MIN_PLAYERS) {
    throw new RangeError(`No puede haber menos de ${MIN_PLAYERS} jugadores`)
  }

  const players = game.players.filter((p) => p.id !== playerId)
  let turn = game.turn
  if (index < turn) turn -= 1
  if (turn >= players.length) turn = 0
  // La tirada que se mostraba era del jugador en turno; si se va, el siguiente no la hereda.
  const lastRoll = index === game.turn ? null : game.lastRoll
  return { ...game, players, turn, lastRoll }
}
