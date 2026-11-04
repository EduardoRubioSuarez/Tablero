import { describe, expect, it } from 'vitest'
import { baseActions } from '../../src/content'
import {
  addPlayer,
  continueTurn,
  createGame,
  deserializeGame,
  majorityLap,
  removePlayer,
  rollDice,
  serializeGame,
  type Game,
  type Player,
} from '../../src/engine'

function newGame(count = 4, laps = 3): Game {
  return createGame({
    playerNames: Array.from({ length: count }, (_, i) => `J${i + 1}`),
    laps,
    seed: 21,
    actions: baseActions,
  })
}

function withLaps(game: Game, laps: number[]): Game {
  return { ...game, players: game.players.map((p, i) => ({ ...p, lap: laps[i] ?? p.lap })) }
}

const p = (lap: number): Player => ({ id: 'x', name: 'x', lap, position: 0 })

describe('majorityLap (hito 3.9)', () => {
  it('devuelve la vuelta más común', () => {
    expect(majorityLap([p(1), p(2), p(2), p(3)])).toBe(2)
  })

  it('con empate elige la menor', () => {
    expect(majorityLap([p(2), p(2), p(1), p(1)])).toBe(1)
    expect(majorityLap([p(3), p(2)])).toBe(2)
  })

  it('con todos en la misma vuelta devuelve esa vuelta', () => {
    expect(majorityLap([p(4), p(4), p(4)])).toBe(4)
  })
})

describe('addPlayer (hito 3.9)', () => {
  it('agrega al final de la lista, en la salida y sin cambiar el turno', () => {
    const game = newGame()
    const next = addPlayer(game, '  Nuevo ')
    expect(next.players).toHaveLength(5)
    expect(next.players[4]).toMatchObject({ name: 'Nuevo', lap: 1, position: 0 })
    expect(next.turn).toBe(game.turn)
    expect(next.players.slice(0, 4)).toEqual(game.players)
  })

  it('empieza en la vuelta donde está la mayoría de los jugadores', () => {
    const game = withLaps(newGame(5), [1, 2, 2, 2, 3])
    expect(addPlayer(game, 'X').players[5].lap).toBe(2)
  })

  it('con empate de vueltas empieza en la menor', () => {
    const game = withLaps(newGame(4), [1, 1, 2, 2])
    expect(addPlayer(game, 'X').players[4].lap).toBe(1)
  })

  it('el id nuevo no se repite aunque se hayan sacado jugadores', () => {
    let game = newGame(4)
    game = removePlayer(game, 'p2')
    game = addPlayer(game, 'A')
    game = addPlayer(game, 'B')
    const ids = game.players.map((x) => x.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('rechaza nombres vacíos, más de 30 jugadores y fases distintas a tirar el dado', () => {
    expect(() => addPlayer(newGame(), '   ')).toThrow(/nombre/)
    expect(() => addPlayer(newGame(30), 'X')).toThrow(RangeError)
    expect(() => addPlayer(rollDice(newGame()), 'X')).toThrow(/antes de tirar/)
  })

  it('no modifica la partida original', () => {
    const game = newGame()
    const snapshot = JSON.stringify(game)
    addPlayer(game, 'X')
    expect(JSON.stringify(game)).toBe(snapshot)
  })
})

describe('removePlayer (hito 3.9)', () => {
  it('saca a un jugador y conserva a los demás', () => {
    const game = newGame()
    const next = removePlayer(game, 'p3')
    expect(next.players.map((x) => x.id)).toEqual(['p1', 'p2', 'p4'])
    expect(next.players[0]).toEqual(game.players[0])
  })

  it('si se saca a alguien antes del jugador en turno, el turno sigue en la misma persona', () => {
    const game = { ...newGame(), turn: 2 }
    const next = removePlayer(game, 'p1')
    expect(next.players[next.turn].id).toBe('p3')
  })

  it('si se saca a alguien después del jugador en turno, el turno no cambia', () => {
    const game = { ...newGame(), turn: 1 }
    const next = removePlayer(game, 'p4')
    expect(next.players[next.turn].id).toBe('p2')
  })

  it('si se saca al jugador en turno, el turno pasa al siguiente', () => {
    const game = { ...newGame(), turn: 1 }
    const next = removePlayer(game, 'p2')
    expect(next.players[next.turn].id).toBe('p3')
  })

  it('si se saca al último jugador y era su turno, el turno vuelve al primero', () => {
    const game = { ...newGame(), turn: 3 }
    const next = removePlayer(game, 'p4')
    expect(next.players[next.turn].id).toBe('p1')
  })

  it('no deja menos de 2 jugadores', () => {
    const game = newGame(2)
    expect(() => removePlayer(game, 'p1')).toThrow(RangeError)
  })

  it('rechaza ids desconocidos y fases distintas a tirar el dado', () => {
    expect(() => removePlayer(newGame(), 'zzz')).toThrow(/no está/)
    expect(() => removePlayer(rollDice(newGame()), 'p1')).toThrow(/antes de tirar/)
  })

  it('si se saca al jugador en turno, el siguiente no hereda su última tirada', () => {
    const game = { ...newGame(3), lastRoll: 4 }
    expect(removePlayer(game, game.players[game.turn].id).lastRoll).toBeNull()
  })

  it('si se saca a otro jugador, la última tirada se conserva', () => {
    const game = { ...newGame(3), lastRoll: 4 }
    const other = game.players.find((_, i) => i !== game.turn)!
    expect(removePlayer(game, other.id).lastRoll).toBe(4)
  })

  it('la partida sigue jugándose con normalidad después de sacar al jugador en turno', () => {
    let game = newGame(3)
    const current = game.players[game.turn].id
    game = removePlayer(game, current)
    game = continueTurn(rollDice(game))
    expect(game.players.every((x) => x.id !== current)).toBe(true)
  })
})

describe('cambios de jugadores durante partidas completas', () => {
  it('con sacar y agregar al azar la partida siempre termina y se puede guardar y cargar', () => {
    for (let seed = 0; seed < 60; seed++) {
      let game = createGame({
        playerNames: ['A', 'B', 'C', 'D'],
        laps: 2,
        seed,
        actions: baseActions,
      })
      let steps = 0
      while (game.phase !== 'finished' && steps++ < 50_000) {
        if (game.phase === 'roll' && steps % 17 === 0) {
          game =
            steps % 2 === 0 && game.players.length > 2
              ? removePlayer(game, game.players[steps % game.players.length].id)
              : game.players.length < 30
                ? addPlayer(game, `N${steps}`)
                : game
        }
        game = game.phase === 'roll' ? rollDice(game) : continueTurn(game)
        const loaded = deserializeGame(serializeGame(game))
        if (!loaded.ok) throw new Error(`semilla ${seed}: ${loaded.error}`)
      }
      expect(game.phase, `semilla ${seed}`).toBe('finished')
      expect(game.players.some((x) => x.id === game.winnerId)).toBe(true)
    }
  })
})
