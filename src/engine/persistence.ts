import { z } from 'zod'
import { ActionSchema } from '../content/schema'
import { validateBoard } from './board'
import {
  CELLS_PER_LAP,
  GAME_FORMAT_VERSION,
  MAX_LAPS,
  MAX_PLAYERS,
  MAX_SEED,
  MIN_LAPS,
  MIN_PLAYERS,
  type Game,
} from './types'

const PlayerSchema = z.object({
  id: z.string().min(1),
  name: z.string().refine((name) => name.trim().length > 0, 'El nombre no puede estar vacío'),
  lap: z.number().int().min(1),
  position: z.number().int().min(0).max(CELLS_PER_LAP),
})

const CardSchema = z.object({
  position: z.number().int().min(1).max(CELLS_PER_LAP),
  action: ActionSchema,
  viaEffect: z.boolean(),
})

const GameSchema = z
  .object({
    version: z.literal(GAME_FORMAT_VERSION),
    board: z.array(ActionSchema).length(CELLS_PER_LAP),
    players: z.array(PlayerSchema).min(MIN_PLAYERS).max(MAX_PLAYERS),
    laps: z.number().int().min(MIN_LAPS).max(MAX_LAPS),
    turn: z.number().int().min(0),
    phase: z.enum(['roll', 'card', 'finished']),
    currentCard: CardSchema.nullable(),
    lastRoll: z.number().int().min(1).max(6).nullable(),
    winnerId: z.string().nullable(),
    seed: z.number().int().min(0).max(MAX_SEED),
    rngState: z.number().int().min(0).max(MAX_SEED),
  })
  .superRefine((game, ctx) => {
    const fail = (message: string) => ctx.addIssue({ code: 'custom', message })

    for (const problem of validateBoard(game.board)) fail(`Tablero inválido: ${problem}`)

    if (game.turn >= game.players.length) fail('El turno apunta a un jugador que no existe')
    if (new Set(game.players.map((p) => p.id)).size !== game.players.length) {
      fail('Hay jugadores con el mismo id')
    }
    if (game.players.some((p) => p.lap > game.laps)) fail('Un jugador supera el número de vueltas')

    const current = game.players[game.turn]
    const atGoal = (p: { lap: number; position: number }) =>
      p.lap === game.laps && p.position === CELLS_PER_LAP

    if (game.phase === 'card') {
      const card = game.currentCard
      if (card === null) fail('Falta la tarjeta actual')
      else {
        const boardAction = game.board[card.position - 1]
        if (JSON.stringify(boardAction) !== JSON.stringify(card.action)) {
          fail('La tarjeta actual no coincide con la casilla del tablero')
        }
        if (current && card.position !== current.position) {
          fail('La tarjeta actual no corresponde a la posición del jugador en turno')
        }
      }
    } else if (game.currentCard !== null) {
      fail('Solo puede haber tarjeta actual en la fase "card"')
    }

    if (game.phase === 'finished' && game.winnerId === null) fail('Falta el ganador')
    if (game.phase === 'roll' && game.winnerId !== null) {
      fail('Solo puede haber ganador cuando la partida está terminando o terminó')
    }
    if (game.winnerId !== null) {
      const winner = game.players.find((p) => p.id === game.winnerId)
      if (!winner) fail('El ganador no es un jugador de la partida')
      else if (!atGoal(winner)) fail('El ganador debe estar en la meta de la última vuelta')
      if (game.phase === 'card' && game.currentCard?.position !== CELLS_PER_LAP) {
        fail('Con ganador, la tarjeta pendiente debe ser la de la casilla 60')
      }
    }
    // Quien está en la meta de la última vuelta ya ganó: debe ser el ganador y solo uno.
    const inGoal = game.players.filter(atGoal)
    if (inGoal.length > 1 || (inGoal.length === 1 && inGoal[0].id !== game.winnerId)) {
      fail('Hay jugadores en la meta sin ser el ganador')
    }
  })

export type LoadResult = { ok: true; game: Game } | { ok: false; error: string }

/** Convierte la partida a texto para guardarla. */
export function serializeGame(game: Game): string {
  return JSON.stringify(game)
}

/**
 * Hito 2.8. Lee una partida guardada. Nunca lanza: devuelve el error para que la interfaz
 * pueda ofrecer empezar una partida nueva. Las versiones del formato que no se conocen se
 * rechazan; aquí es donde se añadirían migraciones si el formato cambia.
 */
export function deserializeGame(text: string): LoadResult {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, error: 'El archivo guardado no es JSON válido' }
  }

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { ok: false, error: 'El formato de la partida guardada no es válido' }
  }
  const version = (raw as { version?: unknown }).version
  if (version !== GAME_FORMAT_VERSION) {
    return { ok: false, error: `Versión de partida no compatible: ${String(version)}` }
  }

  const parsed = GameSchema.safeParse(raw)
  if (!parsed.success) {
    const first = parsed.error.issues[0]
    return { ok: false, error: `Partida guardada dañada: ${first?.message ?? 'datos inválidos'}` }
  }
  return { ok: true, game: parsed.data as Game }
}
