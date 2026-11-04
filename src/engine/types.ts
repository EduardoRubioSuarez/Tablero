import type { Action } from '../content/schema'

/** Casillas con tarjeta en cada vuelta. La posición 0 es la salida y no tiene tarjeta. */
export const CELLS_PER_LAP = 60

/** Límites al crear una partida. */
export const MIN_PLAYERS = 2
export const MAX_PLAYERS = 30
export const MIN_LAPS = 1
/** Tope técnico para evitar valores absurdos; el autor no definió un máximo. */
export const MAX_LAPS = 99

/** La semilla es un entero sin signo de 32 bits. */
export const MAX_SEED = 0xffffffff

/** Versión del formato de guardado de la partida. */
export const GAME_FORMAT_VERSION = 1

/**
 * Tablero de una partida: exactamente 60 acciones. La casilla de la posición `p` (1 a 60)
 * está en `board[p - 1]`.
 */
export type Board = readonly Action[]

export type Player = {
  id: string
  name: string
  /** Vuelta en curso, empieza en 1. */
  lap: number
  /** 0 = salida; 1 a 60 = casillas. */
  position: number
}

/** Tarjeta que se muestra al jugador. */
export type Card = {
  /** Casilla (1 a 60) a la que pertenece la tarjeta. */
  position: number
  action: Action
  /** true si el jugador llegó aquí por el efecto de una casilla anterior (por ejemplo, un retroceso). */
  viaEffect: boolean
}

/**
 * Fase de la partida:
 * - `roll`: espera que el jugador en turno tire el dado.
 * - `card`: se muestra `currentCard`; al continuar se aplica su efecto o pasa el turno.
 * - `finished`: hay ganador.
 */
export type Phase = 'roll' | 'card' | 'finished'

export type Game = {
  version: number
  board: Board
  players: Player[]
  /** Número de vueltas que el grupo acordó. */
  laps: number
  /** Índice, dentro de `players`, del jugador en turno. */
  turn: number
  phase: Phase
  currentCard: Card | null
  lastRoll: number | null
  winnerId: string | null
  /** Semilla original de la partida (informativa). */
  seed: number
  /** Estado actual del generador de azar. */
  rngState: number
}
