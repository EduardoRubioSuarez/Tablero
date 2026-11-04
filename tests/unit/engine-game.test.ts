import { describe, expect, it } from 'vitest'
import { baseActions, type Action } from '../../src/content'
import { validateBoard } from '../../src/engine/board'
import { continueTurn, createGame, getRanking, progressOf, rollDice } from '../../src/engine/game'
import { makeRng } from '../../src/engine/rng'
import type { Game, Player } from '../../src/engine/types'

const lapStart = baseActions.find((a) => a.effect?.type === 'toLapStart') as Action
const back5 = baseActions.find((a) => a.effect?.type === 'back' && a.effect.steps === 5) as Action
const back10 = baseActions.find((a) => a.effect?.type === 'back' && a.effect.steps === 10) as Action
const plain = baseActions.filter((a) => a.effect === undefined)

function names(n: number): string[] {
  return Array.from({ length: n }, (_, i) => `Jugador ${i + 1}`)
}

/** Semilla de estado del azar que hace que el dado dé exactamente `roll`. */
function stateForRoll(roll: number): number {
  for (let seed = 0; seed < 10_000; seed++) {
    if (makeRng(seed).int(6) + 1 === roll) return seed
  }
  throw new Error('no se encontró estado')
}

/** Partida en un escenario controlado: tablero a mano, jugador 1 en turno y un dado fijo. */
function scenario(options: {
  placed?: Record<number, Action>
  lap?: number
  position?: number
  laps?: number
  roll: number
  playerCount?: number
}): Game {
  const base = createGame({
    playerNames: names(options.playerCount ?? 3),
    laps: options.laps ?? 3,
    seed: 1,
    actions: baseActions,
  })
  const fillers = [...plain]
  const board: Action[] = []
  const placed: Record<number, Action> = { 50: lapStart, ...options.placed }
  for (let p = 1; p <= 60; p++) board.push(placed[p] ?? (fillers.shift() as Action))
  const players = base.players.map((pl, i) =>
    i === 0 ? { ...pl, lap: options.lap ?? 1, position: options.position ?? 0 } : pl,
  )
  return { ...base, board, players, turn: 0, rngState: stateForRoll(options.roll) }
}

const player = (game: Game, index = 0): Player => game.players[index]

describe('createGame', () => {
  const opts = { playerNames: names(4), laps: 2, seed: 99, actions: baseActions }

  it('crea la partida con tablero válido y todos en la salida', () => {
    const game = createGame(opts)
    expect(validateBoard(game.board)).toEqual([])
    expect(game.players).toHaveLength(4)
    expect(game.players.every((p) => p.lap === 1 && p.position === 0)).toBe(true)
    expect(game.phase).toBe('roll')
    expect(game.currentCard).toBeNull()
    expect(game.winnerId).toBeNull()
    expect(game.laps).toBe(2)
  })

  it('asigna ids en el orden de asientos y recorta espacios del nombre', () => {
    const game = createGame({ ...opts, playerNames: ['  Ana ', 'Luis'] })
    expect(game.players.map((p) => p.id)).toEqual(['p1', 'p2'])
    expect(game.players[0].name).toBe('Ana')
  })

  it('el jugador inicial sale del azar y es reproducible con la misma semilla', () => {
    const starts = new Set<number>()
    for (let seed = 0; seed < 200; seed++) {
      const game = createGame({ ...opts, playerNames: names(5), seed })
      starts.add(game.turn)
      expect(createGame({ ...opts, playerNames: names(5), seed }).turn).toBe(game.turn)
    }
    expect(starts.size).toBe(5)
  })

  it('valida los límites: 2 a 30 jugadores y 1 a 99 vueltas', () => {
    expect(() => createGame({ ...opts, playerNames: names(1) })).toThrow(RangeError)
    expect(() => createGame({ ...opts, playerNames: names(31) })).toThrow(RangeError)
    expect(createGame({ ...opts, playerNames: names(30) }).players).toHaveLength(30)
    expect(createGame({ ...opts, playerNames: names(2) }).players).toHaveLength(2)
    expect(() => createGame({ ...opts, laps: 0 })).toThrow(RangeError)
    expect(() => createGame({ ...opts, laps: 100 })).toThrow(RangeError)
    expect(() => createGame({ ...opts, laps: 1.5 })).toThrow(RangeError)
    expect(createGame({ ...opts, laps: 1 }).laps).toBe(1)
  })

  it('valida la semilla: entero sin signo de 32 bits', () => {
    expect(() => createGame({ ...opts, seed: -5 })).toThrow(RangeError)
    expect(() => createGame({ ...opts, seed: 1.5 })).toThrow(RangeError)
    expect(() => createGame({ ...opts, seed: 2 ** 32 })).toThrow(RangeError)
    expect(createGame({ ...opts, seed: 0 }).seed).toBe(0)
    expect(createGame({ ...opts, seed: 2 ** 32 - 1 }).seed).toBe(2 ** 32 - 1)
  })

  it('rechaza nombres vacíos', () => {
    expect(() => createGame({ ...opts, playerNames: ['Ana', '   '] })).toThrow(/nombre/)
  })
})

describe('rollDice y continueTurn: avance y turnos (hito 2.5)', () => {
  it('avanza lo que marca el dado y muestra la tarjeta de esa casilla', () => {
    const game = scenario({ position: 10, roll: 4 })
    const next = rollDice(game)
    expect(next.lastRoll).toBe(4)
    expect(player(next).position).toBe(14)
    expect(next.phase).toBe('card')
    expect(next.currentCard?.position).toBe(14)
    expect(next.currentCard?.action).toBe(game.board[13])
    expect(next.currentCard?.viaEffect).toBe(false)
  })

  it('el dado siempre da de 1 a 6 y salen todos los valores', () => {
    const game = scenario({ roll: 1 })
    const seen = new Set<number>()
    for (let seed = 0; seed < 300; seed++) {
      const rolled = rollDice({ ...game, rngState: seed })
      expect(rolled.lastRoll).toBeGreaterThanOrEqual(1)
      expect(rolled.lastRoll).toBeLessThanOrEqual(6)
      seen.add(rolled.lastRoll as number)
    }
    expect(seen.size).toBe(6)
  })

  it('un jugador tira un solo dado por turno: sin tiros extra con el 6', () => {
    const game = scenario({ position: 0, roll: 6 })
    const afterRoll = rollDice(game)
    const afterContinue = continueTurn(afterRoll)
    expect(afterContinue.turn).toBe(1)
    expect(afterContinue.phase).toBe('roll')
  })

  it('al continuar pasa al siguiente jugador y vuelve al primero después del último', () => {
    let game = scenario({ roll: 1, playerCount: 3 })
    const sequence: number[] = []
    for (let i = 0; i < 4; i++) {
      game = { ...game, rngState: stateForRoll(1) }
      sequence.push(game.turn)
      game = continueTurn(rollDice(game))
    }
    expect(sequence).toEqual([0, 1, 2, 0])
  })

  it('caer justo en la 60 muestra su tarjeta y no completa la vuelta', () => {
    const next = rollDice(scenario({ position: 58, roll: 2, laps: 3 }))
    expect(player(next)).toMatchObject({ lap: 1, position: 60 })
    expect(next.currentCard?.position).toBe(60)
    expect(next.phase).toBe('card')
  })

  it('rebasar la 60 pasa a la vuelta siguiente y el sobrante cuenta desde la salida', () => {
    const next = rollDice(scenario({ position: 58, roll: 5, laps: 3 }))
    expect(player(next)).toMatchObject({ lap: 2, position: 3 })
    expect(next.currentCard?.position).toBe(3)
  })

  it('desde la 60, un 1 lleva a la posición 1 de la vuelta siguiente', () => {
    const next = rollDice(scenario({ position: 60, roll: 1, laps: 2 }))
    expect(player(next)).toMatchObject({ lap: 2, position: 1 })
  })

  it('no modifica la partida original (inmutabilidad)', () => {
    const game = scenario({ position: 10, roll: 3 })
    const snapshot = JSON.stringify(game)
    const next = rollDice(game)
    continueTurn(next)
    expect(JSON.stringify(game)).toBe(snapshot)
  })

  it('es determinista: el mismo estado da el mismo resultado', () => {
    const game = scenario({ position: 10, roll: 3 })
    expect(rollDice(game)).toEqual(rollDice(game))
  })

  it('rechaza acciones en la fase equivocada', () => {
    const game = scenario({ roll: 2 })
    expect(() => continueTurn(game)).toThrow(/fase/)
    const rolled = rollDice(game)
    expect(() => rollDice(rolled)).toThrow(/fase/)
  })
})

describe('efectos de movimiento (hito 2.6)', () => {
  it('retroceder 5: primero la tarjeta del retroceso, luego la de la casilla de llegada', () => {
    const game = scenario({ placed: { 20: back5 }, position: 17, roll: 3 })
    const onBack = rollDice(game)
    expect(onBack.currentCard?.action).toBe(back5)
    expect(player(onBack).position).toBe(20)

    const arrived = continueTurn(onBack)
    expect(player(arrived).position).toBe(15)
    expect(arrived.currentCard?.position).toBe(15)
    expect(arrived.currentCard?.action).toBe(game.board[14])
    expect(arrived.currentCard?.viaEffect).toBe(true)
    expect(arrived.phase).toBe('card')
    expect(arrived.turn).toBe(0)

    const next = continueTurn(arrived)
    expect(next.turn).toBe(1)
    expect(next.phase).toBe('roll')
    expect(player(next).position).toBe(15)
  })

  it('retroceder 10 desde la posición 11 llega a la 1', () => {
    const game = scenario({ placed: { 11: back10 }, position: 8, roll: 3 })
    const arrived = continueTurn(rollDice(game))
    expect(player(arrived).position).toBe(1)
  })

  it('el retroceso no cambia la vuelta', () => {
    const game = scenario({ placed: { 20: back5 }, lap: 2, position: 14, roll: 6 })
    const arrived = continueTurn(rollDice(game))
    expect(player(arrived)).toMatchObject({ lap: 2, position: 15 })
  })

  it('VUELVE A LA SALIDA regresa a la posición 0 de la vuelta actual y pasa el turno', () => {
    const game = scenario({ placed: { 50: lapStart }, lap: 2, position: 44, roll: 6, laps: 3 })
    const onCard = rollDice(game)
    expect(onCard.currentCard?.action).toBe(lapStart)
    const next = continueTurn(onCard)
    expect(player(next)).toMatchObject({ lap: 2, position: 0 })
    expect(next.turn).toBe(1)
    expect(next.phase).toBe('roll')
    expect(next.currentCard).toBeNull()
  })

  it('desde la salida se puede volver a avanzar con normalidad', () => {
    const game = scenario({ lap: 2, position: 0, roll: 4 })
    expect(player(rollDice(game))).toMatchObject({ lap: 2, position: 4 })
  })

  it('un retroceso no afecta a los demás jugadores', () => {
    const game = scenario({ placed: { 20: back5 }, position: 17, roll: 3 })
    const others = game.players.slice(1)
    const arrived = continueTurn(rollDice(game))
    expect(arrived.players.slice(1)).toEqual(others)
  })
})

describe('victoria y ranking (hito 2.7)', () => {
  it('en la última vuelta, llegar justo a la 60 gana, pero primero se muestra su tarjeta', () => {
    const game = scenario({ lap: 3, position: 57, roll: 3, laps: 3 })
    const next = rollDice(game)
    expect(next.winnerId).toBe('p1')
    expect(next.phase).toBe('card')
    expect(player(next)).toMatchObject({ lap: 3, position: 60 })
    expect(next.currentCard).toMatchObject({ position: 60, viaEffect: false })
    expect(next.currentCard?.action).toBe(game.board[59])
  })

  it('en la última vuelta, pasarse de la 60 también gana y muestra la tarjeta de la casilla 60', () => {
    const game = scenario({ lap: 3, position: 58, roll: 6, laps: 3 })
    const next = rollDice(game)
    expect(next.winnerId).toBe('p1')
    expect(next.phase).toBe('card')
    expect(next.currentCard?.position).toBe(60)
    expect(player(next).position).toBe(60)
  })

  it('la partida termina hasta que el ganador toca Continuar', () => {
    const won = rollDice(scenario({ lap: 3, position: 57, roll: 3, laps: 3 }))
    const done = continueTurn(won)
    expect(done.phase).toBe('finished')
    expect(done.currentCard).toBeNull()
    expect(done.winnerId).toBe('p1')
    expect(done.turn).toBe(won.turn)
  })

  it('si la casilla 60 es VUELVE A LA SALIDA, el ganador no vuelve: su efecto no se aplica', () => {
    const game = scenario({
      placed: { 60: lapStart, 50: plain[0] },
      lap: 2,
      position: 58,
      roll: 2,
      laps: 2,
    })
    const won = rollDice(game)
    expect(won.currentCard?.action).toBe(lapStart)
    const done = continueTurn(won)
    expect(done.phase).toBe('finished')
    expect(player(done)).toMatchObject({ lap: 2, position: 60 })
    expect(done.winnerId).toBe('p1')
  })

  it('si la casilla 60 es un retroceso, el ganador tampoco retrocede', () => {
    const game = scenario({ placed: { 60: back5 }, lap: 2, position: 59, roll: 1, laps: 2 })
    const done = continueTurn(rollDice(game))
    expect(done.phase).toBe('finished')
    expect(player(done).position).toBe(60)
  })

  it('no gana si todavía no está en la última vuelta', () => {
    const next = rollDice(scenario({ lap: 2, position: 58, roll: 6, laps: 3 }))
    expect(next.phase).toBe('card')
    expect(next.winnerId).toBeNull()
    expect(player(next)).toMatchObject({ lap: 3, position: 4 })
  })

  it('con 1 vuelta, gana quien llega a la 60 desde la primera vuelta', () => {
    const next = rollDice(scenario({ lap: 1, position: 59, roll: 1, laps: 1 }))
    expect(next.winnerId).toBe('p1')
  })

  it('con 1 vuelta, quien rebasa la 60 gana sin pasar a una vuelta 2', () => {
    const next = rollDice(scenario({ lap: 1, position: 55, roll: 6, laps: 1 }))
    expect(next.winnerId).toBe('p1')
    expect(player(next).lap).toBe(1)
  })

  it('una partida terminada no admite más acciones', () => {
    const done = continueTurn(rollDice(scenario({ lap: 1, position: 59, roll: 1, laps: 1 })))
    expect(() => rollDice(done)).toThrow(/fase/)
    expect(() => continueTurn(done)).toThrow(/fase/)
  })

  it('el ranking pone al ganador primero y ordena el resto por avance', () => {
    let game = scenario({ lap: 2, position: 58, roll: 3, laps: 2 })
    game = {
      ...game,
      players: [
        { ...game.players[0] },
        { ...game.players[1], lap: 2, position: 40 },
        { ...game.players[2], lap: 1, position: 59 },
      ],
    }
    const done = rollDice(game)
    const ranking = getRanking(done)
    expect(ranking.map((r) => r.player.id)).toEqual(['p1', 'p2', 'p3'])
    expect(ranking.map((r) => r.rank)).toEqual([1, 2, 3])
  })

  it('los empates comparten lugar y conservan el orden de asientos', () => {
    const game = scenario({ roll: 1, playerCount: 4 })
    const tied: Game = {
      ...game,
      players: [
        { ...game.players[0], position: 10 },
        { ...game.players[1], position: 30 },
        { ...game.players[2], position: 10 },
        { ...game.players[3], position: 30 },
      ],
    }
    const ranking = getRanking(tied)
    expect(ranking.map((r) => r.player.id)).toEqual(['p2', 'p4', 'p1', 'p3'])
    expect(ranking.map((r) => r.rank)).toEqual([1, 1, 3, 3])
  })

  it('progressOf cuenta vueltas completas y posición', () => {
    expect(progressOf({ id: 'x', name: 'x', lap: 1, position: 0 })).toBe(0)
    expect(progressOf({ id: 'x', name: 'x', lap: 3, position: 10 })).toBe(130)
  })
})

describe('partidas completas simuladas', () => {
  it('terminan con exactamente un ganador y respetan los invariantes en cada paso', () => {
    const violations: string[] = []

    for (let seed = 0; seed < 150; seed++) {
      const playerCount = 2 + (seed % 29)
      const laps = 1 + (seed % 3)
      let game = createGame({ playerNames: names(playerCount), laps, seed, actions: baseActions })
      let steps = 0

      while (game.phase !== 'finished' && steps < 200_000) {
        game = game.phase === 'roll' ? rollDice(game) : continueTurn(game)
        steps++
        for (const p of game.players) {
          if (p.lap < 1 || p.lap > laps || p.position < 0 || p.position > 60) {
            violations.push(
              `semilla ${seed}: ${p.id} fuera de rango (vuelta ${p.lap}, posición ${p.position})`,
            )
          }
        }
      }

      if (game.phase !== 'finished') violations.push(`semilla ${seed}: no terminó`)
      const winner = game.players.find((p) => p.id === game.winnerId)
      if (!winner || winner.lap !== laps || winner.position !== 60) {
        violations.push(`semilla ${seed}: ganador inválido`)
      }
      if (game.players.filter((p) => p.lap === laps && p.position === 60).length !== 1) {
        violations.push(`semilla ${seed}: no hay exactamente un jugador en la meta`)
      }
      if (getRanking(game)[0].player.id !== game.winnerId) {
        violations.push(`semilla ${seed}: el ranking no empieza por el ganador`)
      }
    }

    expect(violations.slice(0, 5)).toEqual([])
  }, 60_000)
})
