import type { Action } from '../content/schema'
import { buildBoard } from './board'
import { makeRng } from './rng'
import {
  CELLS_PER_LAP,
  GAME_FORMAT_VERSION,
  MAX_LAPS,
  MAX_PLAYERS,
  MAX_SEED,
  MIN_LAPS,
  MIN_PLAYERS,
  type Card,
  type Game,
  type Player,
} from './types'

export type NewGameOptions = {
  /** Nombres en el orden en que están sentados los jugadores. */
  playerNames: readonly string[]
  laps: number
  seed: number
  actions: readonly Action[]
}

/** Crea una partida nueva: arma el tablero, los jugadores y elige al azar quién empieza. */
export function createGame(options: NewGameOptions): Game {
  const names = options.playerNames.map((name) => name.trim())
  if (names.length < MIN_PLAYERS || names.length > MAX_PLAYERS) {
    throw new RangeError(`Debe haber entre ${MIN_PLAYERS} y ${MAX_PLAYERS} jugadores`)
  }
  if (names.some((name) => name.length === 0)) {
    throw new Error('Todos los jugadores deben tener nombre')
  }
  if (!Number.isInteger(options.seed) || options.seed < 0 || options.seed > MAX_SEED) {
    throw new RangeError(`La semilla debe ser un entero entre 0 y ${MAX_SEED}`)
  }
  if (!Number.isInteger(options.laps) || options.laps < MIN_LAPS || options.laps > MAX_LAPS) {
    throw new RangeError(`Las vueltas deben ser un entero entre ${MIN_LAPS} y ${MAX_LAPS}`)
  }

  const rng = makeRng(options.seed)
  const board = buildBoard(options.actions, rng)
  const players: Player[] = names.map((name, index) => ({
    id: `p${index + 1}`,
    name,
    lap: 1,
    position: 0,
  }))
  const turn = rng.int(players.length)

  return {
    version: GAME_FORMAT_VERSION,
    board,
    players,
    laps: options.laps,
    turn,
    phase: 'roll',
    currentCard: null,
    lastRoll: null,
    winnerId: null,
    seed: options.seed,
    rngState: rng.state,
  }
}

/** Jugador al que le toca. */
export function getCurrentPlayer(game: Game): Player {
  return game.players[game.turn]
}

function replacePlayer(game: Game, updated: Player): Player[] {
  return game.players.map((p) => (p.id === updated.id ? updated : p))
}

function assertPhase(game: Game, expected: Game['phase'], action: string): void {
  if (game.phase !== expected) {
    throw new Error(`No se puede ${action} en la fase "${game.phase}" (se esperaba "${expected}")`)
  }
}

function advanceTurn(game: Game, players: Player[]): Game {
  return {
    ...game,
    players,
    turn: (game.turn + 1) % players.length,
    phase: 'roll',
    currentCard: null,
  }
}

/**
 * Hito 2.5. El jugador en turno tira el dado (1 a 6) y avanza.
 *
 * - Si rebasa la casilla 60 y no está en la última vuelta, pasa a la vuelta siguiente y el
 *   sobrante se cuenta desde la salida. Caer justo en la 60 no completa la vuelta.
 * - En la última vuelta, llegar a la 60 o pasarla gana (hito 2.7): la ficha queda en la 60,
 *   se registra `winnerId` y se muestra la tarjeta de la casilla 60. La partida no termina
 *   hasta que el jugador continúe (ver `continueTurn`); el efecto de esa tarjeta no se aplica.
 * - En cualquier otro caso queda en `phase: 'card'` con la tarjeta de la casilla.
 */
export function rollDice(game: Game): Game {
  assertPhase(game, 'roll', 'tirar el dado')
  const rng = makeRng(game.rngState)
  const roll = rng.int(6) + 1
  const player = getCurrentPlayer(game)
  const target = player.position + roll

  if (player.lap === game.laps && target >= CELLS_PER_LAP) {
    const winner: Player = { ...player, position: CELLS_PER_LAP }
    return {
      ...game,
      players: replacePlayer(game, winner),
      phase: 'card',
      currentCard: {
        position: CELLS_PER_LAP,
        action: game.board[CELLS_PER_LAP - 1],
        viaEffect: false,
      },
      lastRoll: roll,
      winnerId: winner.id,
      rngState: rng.state,
    }
  }

  let lap = player.lap
  let position = target
  if (target > CELLS_PER_LAP) {
    lap += 1
    position = target - CELLS_PER_LAP
  }

  const moved: Player = { ...player, lap, position }
  const card: Card = { position, action: game.board[position - 1], viaEffect: false }
  return {
    ...game,
    players: replacePlayer(game, moved),
    phase: 'card',
    currentCard: card,
    lastRoll: roll,
    rngState: rng.state,
  }
}

/**
 * Hitos 2.5 y 2.6. El jugador toca "Continuar" en la tarjeta que ve:
 *
 * - Sin efecto: pasa el turno al siguiente jugador.
 * - Retroceso: la ficha retrocede y se muestra la tarjeta de la casilla de llegada.
 *   El turno sigue siendo del mismo jugador hasta que continúe esa segunda tarjeta.
 * - "Vuelve a la salida": la ficha regresa a la posición 0 de la vuelta actual y pasa el turno.
 * - Si ya hay ganador (`winnerId`), la tarjeta no aplica efectos: la partida termina.
 */
export function continueTurn(game: Game): Game {
  assertPhase(game, 'card', 'continuar')
  const card = game.currentCard
  if (card === null) throw new Error('Falta la tarjeta actual')
  const player = getCurrentPlayer(game)
  const effect = card.action.effect

  if (game.winnerId !== null) {
    return { ...game, phase: 'finished', currentCard: null }
  }

  if (effect?.type === 'back') {
    const position = card.position - effect.steps
    if (position < 1) {
      throw new Error(`El retroceso desde la posición ${card.position} sale de la vuelta`)
    }
    const moved: Player = { ...player, position }
    return {
      ...game,
      players: replacePlayer(game, moved),
      currentCard: { position, action: game.board[position - 1], viaEffect: true },
    }
  }

  if (effect?.type === 'toLapStart') {
    const moved: Player = { ...player, position: 0 }
    return advanceTurn(game, replacePlayer(game, moved))
  }

  return advanceTurn(game, game.players)
}

/** Avance total de un jugador, útil para ordenar: vueltas completas por 60 más la posición. */
export function progressOf(player: Player): number {
  return (player.lap - 1) * CELLS_PER_LAP + player.position
}

export type RankingEntry = { player: Player; rank: number }

/**
 * Hito 2.7. Ordena a los jugadores de primero a último.
 * Si hay ganador va primero; el resto se ordena por avance. Los empates comparten lugar
 * y se conservan en el orden de asientos.
 */
export function getRanking(game: Game): RankingEntry[] {
  const sorted = game.players
    .map((player, index) => ({ player, index }))
    .sort((a, b) => {
      if (a.player.id === game.winnerId) return -1
      if (b.player.id === game.winnerId) return 1
      return progressOf(b.player) - progressOf(a.player) || a.index - b.index
    })

  const entries: RankingEntry[] = []
  sorted.forEach(({ player }, i) => {
    const previous = entries[i - 1]
    const tied =
      previous !== undefined &&
      previous.player.id !== game.winnerId &&
      progressOf(previous.player) === progressOf(player)
    entries.push({ player, rank: tied ? previous.rank : i + 1 })
  })
  return entries
}
