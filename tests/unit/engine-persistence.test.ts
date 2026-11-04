import { describe, expect, it } from 'vitest'
import { baseActions } from '../../src/content'
import {
  continueTurn,
  createGame,
  deserializeGame,
  rollDice,
  serializeGame,
  type Game,
} from '../../src/engine'

function newGame(seed = 7): Game {
  return createGame({
    playerNames: ['Ana', 'Beto', 'Carla', 'Dani'],
    laps: 2,
    seed,
    actions: baseActions,
  })
}

/** Juega `n` acciones (tirar o continuar) sin terminar la partida. */
function play(game: Game, n: number): Game {
  let current = game
  for (let i = 0; i < n && current.phase !== 'finished'; i++) {
    current = current.phase === 'roll' ? rollDice(current) : continueTurn(current)
  }
  return current
}

function load(game: Game): Game {
  const result = deserializeGame(serializeGame(game))
  if (!result.ok) throw new Error(result.error)
  return result.game
}

describe('guardado y carga (hito 2.8)', () => {
  it('ida y vuelta de una partida recién creada', () => {
    const game = newGame()
    expect(load(game)).toEqual(game)
  })

  it('ida y vuelta en cualquier punto de una partida', () => {
    for (let steps = 0; steps < 120; steps++) {
      const game = play(newGame(steps), steps)
      expect(load(game), `tras ${steps} acciones`).toEqual(game)
    }
  })

  it('una partida cargada continúa exactamente igual que la original', () => {
    const game = play(newGame(3), 25)
    const loaded = load(game)
    expect(play(loaded, 60)).toEqual(play(game, 60))
  })

  it('guarda y carga la partida cuando el ganador ve su tarjeta final', () => {
    let game = newGame(11)
    while (game.winnerId === null) {
      game = game.phase === 'roll' ? rollDice(game) : continueTurn(game)
    }
    expect(game.phase).toBe('card')
    expect(load(game)).toEqual(game)
  })

  it('guarda y carga también una partida terminada', () => {
    let game = newGame(11)
    while (game.phase !== 'finished') {
      game = game.phase === 'roll' ? rollDice(game) : continueTurn(game)
    }
    expect(load(game)).toEqual(game)
  })

  it('rechaza texto que no es JSON', () => {
    const result = deserializeGame('esto no es json')
    expect(result.ok).toBe(false)
  })

  it('rechaza valores que no son una partida', () => {
    expect(deserializeGame('null').ok).toBe(false)
    expect(deserializeGame('[]').ok).toBe(false)
    expect(deserializeGame('"hola"').ok).toBe(false)
    expect(deserializeGame('{}').ok).toBe(false)
  })

  it('rechaza una versión de formato desconocida', () => {
    const data = { ...JSON.parse(serializeGame(newGame())), version: 99 }
    const result = deserializeGame(JSON.stringify(data))
    expect(result).toEqual({ ok: false, error: expect.stringContaining('99') })
  })

  describe('rechaza partidas dañadas o manipuladas', () => {
    const base = () => JSON.parse(serializeGame(play(newGame(5), 1)))
    const rejects = (mutate: (data: any) => void, message: RegExp) => {
      const data = base()
      mutate(data)
      const result = deserializeGame(JSON.stringify(data))
      expect(result.ok).toBe(false)
      if (!result.ok) expect(result.error).toMatch(message)
    }

    it('posición fuera de rango', () => rejects((d) => (d.players[0].position = 61), /dañada/))
    it('menos de 2 jugadores', () => rejects((d) => (d.players = [d.players[0]]), /dañada/))
    it('turno que no existe', () => rejects((d) => (d.turn = 9), /turno/))
    it('jugadores con el mismo id', () =>
      rejects((d) => (d.players[1].id = d.players[0].id), /mismo id/))
    it('vuelta mayor que las acordadas', () => rejects((d) => (d.players[0].lap = 9), /vueltas/))
    it('tablero con 59 casillas', () => rejects((d) => d.board.pop(), /dañada/))
    it('tablero que rompe una regla', () => {
      rejects((d) => d.board.reverse(), /Tablero inválido/)
    })
    it('fase "card" sin tarjeta', () => rejects((d) => (d.currentCard = null), /tarjeta/))
    it('tarjeta que no coincide con el tablero', () => {
      rejects((d) => (d.currentCard.position = d.currentCard.position === 1 ? 2 : 1), /no coincide/)
    })
    it('ganador con la partida en curso', () => rejects((d) => (d.winnerId = 'p1'), /ganador/))
    it('tarjeta de otra posición distinta a la del jugador en turno', () => {
      rejects(
        (d) => (d.players[d.turn].position = d.currentCard.position === 1 ? 2 : 1),
        /posición del jugador/,
      )
    })
    it('tarjeta con texto distinto al del tablero', () => {
      rejects((d) => (d.currentCard.action.text = 'OTRA COSA'), /no coincide/)
    })
    it('nombre de solo espacios', () => rejects((d) => (d.players[0].name = '   '), /nombre/))
    it('semilla negativa', () => rejects((d) => (d.seed = -1), /dañada/))
    it('jugador en la meta sin ser el ganador', () => {
      rejects((d) => ((d.players[0].lap = d.laps), (d.players[0].position = 60)), /meta|tarjeta/)
    })
    it('tirada de dado imposible', () => rejects((d) => (d.lastRoll = 7), /dañada/))
  })
})
