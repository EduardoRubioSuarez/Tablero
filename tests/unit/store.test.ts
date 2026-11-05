import { describe, expect, it } from 'vitest'
import { baseActions } from '../../src/content'
import { createGameStore, seedFromUrl, type GameState } from '../../src/store/gameStore'
import { cleanNames, validateSetup } from '../../src/store/setup'
import { SAVE_KEY, memoryStorage, type KeyValueStore } from '../../src/store/storage'

function makeStore(storage: KeyValueStore = memoryStorage(), firstSeed = 100) {
  let seed = firstSeed
  const store = createGameStore({ storage, actions: baseActions, newSeed: () => seed++ })
  return { store, storage, state: (): GameState => store.getState() }
}

function readyToStart(state: () => GameState, names = ['Ana', 'Beto', 'Carla'], laps = 1) {
  state().confirmAge()
  state().goSetup()
  state().setDraft({ names, laps })
  state().startGame()
}

function playToEnd(state: () => GameState): void {
  let guard = 0
  while (state().screen === 'game' && guard++ < 100_000) {
    const game = state().game
    if (game?.phase === 'roll') state().roll()
    else state().next()
  }
}

describe('pantallas (hito 3.1)', () => {
  it('arranca en la advertencia +18 aunque exista una partida guardada', () => {
    const first = makeStore()
    readyToStart(first.state)
    const second = makeStore(first.storage)
    expect(second.state().screen).toBe('warning')
    expect(second.state().saved).not.toBeNull()
  })

  it('confirmar la edad lleva al inicio; negarla lleva a la pantalla de acceso denegado', () => {
    const a = makeStore()
    a.state().confirmAge()
    expect(a.state().screen).toBe('home')
    const b = makeStore()
    b.state().denyAge()
    expect(b.state().screen).toBe('denied')
  })

  it('inicio, configurar partida y volver', () => {
    const { state } = makeStore()
    state().confirmAge()
    state().goSetup()
    expect(state().screen).toBe('setup')
    state().goHome()
    expect(state().screen).toBe('home')
  })
})

describe('configurar y empezar (hito 3.3)', () => {
  it('no empieza con configuración inválida y explica por qué', () => {
    const { state } = makeStore()
    state().confirmAge()
    state().goSetup()
    state().setDraft({ names: ['Ana', ''], laps: 1 })
    state().startGame()
    expect(state().screen).toBe('setup')
    expect(state().error).toMatch(/al menos 2/)
    expect(state().game).toBeNull()
  })

  it('empieza con nombres limpios y en el orden de asientos', () => {
    const { state } = makeStore()
    readyToStart(state, ['  Ana ', '', 'Beto', 'Carla'], 2)
    expect(state().screen).toBe('game')
    expect(state().game?.players.map((p) => p.name)).toEqual(['Ana', 'Beto', 'Carla'])
    expect(state().game?.laps).toBe(2)
    expect(state().error).toBeNull()
  })

  it('validateSetup respeta los límites de jugadores y vueltas', () => {
    const names = (n: number) => Array.from({ length: n }, (_, i) => `J${i}`)
    expect(validateSetup({ names: names(2), laps: 1 })).toEqual([])
    expect(validateSetup({ names: names(30), laps: 99 })).toEqual([])
    expect(validateSetup({ names: names(1), laps: 1 })).not.toEqual([])
    expect(validateSetup({ names: names(31), laps: 1 })).not.toEqual([])
    expect(validateSetup({ names: names(3), laps: 0 })).not.toEqual([])
    expect(validateSetup({ names: names(3), laps: 100 })).not.toEqual([])
    expect(validateSetup({ names: ['A', '   ', 'B'], laps: 1 })).toEqual([])
    expect(validateSetup({ names: ['A', '   '], laps: 1 })).not.toEqual([])
  })

  it('rechaza nombres repetidos sin distinguir mayúsculas', () => {
    expect(validateSetup({ names: ['Ana', 'ana'], laps: 1 }).join()).toMatch(/nombres distintos/)
    expect(validateSetup({ names: ['Ana', 'Beto'], laps: 1 })).toEqual([])
  })

  it('cambiar el borrador borra el error anterior', () => {
    const { state } = makeStore()
    state().confirmAge()
    state().goSetup()
    state().setDraft({ names: ['Ana', ''], laps: 1 })
    state().startGame()
    expect(state().error).not.toBeNull()
    state().setDraft({ names: ['Ana', 'Beto'], laps: 1 })
    expect(state().error).toBeNull()
  })

  it('continuar una partida limpia avisos de sesiones anteriores', () => {
    const first = makeStore()
    readyToStart(first.state)
    const second = makeStore(first.storage)
    second.state().confirmAge()
    second.state().resumeSaved()
    expect(second.state().saveFailed).toBe(false)
    expect(second.state().error).toBeNull()
    expect(second.state().playersOpen).toBe(false)
  })

  it('cleanNames recorta y quita filas vacías', () => {
    expect(cleanNames([' A ', '', '  ', 'B'])).toEqual(['A', 'B'])
  })
})

describe('turnos (hitos 3.4 y 3.5)', () => {
  it('tirar el dado muestra la tarjeta y Continuar pasa el turno', () => {
    const { state } = makeStore()
    readyToStart(state)
    const start = state().game!.turn
    state().roll()
    expect(state().game?.phase).toBe('card')
    expect(state().game?.currentCard).not.toBeNull()
    state().next()
    const game = state().game!
    if (game.phase === 'roll') expect(game.turn).toBe((start + 1) % 3)
  })

  it('ignora acciones fuera de fase', () => {
    const { state } = makeStore()
    readyToStart(state)
    const before = state().game
    state().next()
    expect(state().game).toBe(before)
    state().roll()
    const rolled = state().game
    state().roll()
    expect(state().game).toBe(rolled)
  })
})

describe('reglamento y ayuda (hito 3.6)', () => {
  it('abrir y cerrar la ayuda no cambia la partida', () => {
    const { state } = makeStore()
    readyToStart(state)
    state().roll()
    const before = state().game
    state().openHelp()
    expect(state().helpOpen).toBe(true)
    state().closeHelp()
    expect(state().helpOpen).toBe(false)
    expect(state().game).toBe(before)
    expect(state().screen).toBe('game')
  })

  it('abrir y cerrar el reglamento no cambia la partida', () => {
    const { state } = makeStore()
    readyToStart(state)
    state().roll()
    const before = state().game
    state().openRules()
    expect(state().rulesOpen).toBe(true)
    state().closeRules()
    expect(state().rulesOpen).toBe(false)
    expect(state().game).toBe(before)
    expect(state().screen).toBe('game')
  })
})

describe('guardado automático y continuar (hito 3.7)', () => {
  it('guarda al empezar y tras cada acción', () => {
    const { state, storage } = makeStore()
    readyToStart(state)
    const saved0 = storage.getItem(SAVE_KEY)
    expect(saved0).not.toBeNull()
    state().roll()
    expect(storage.getItem(SAVE_KEY)).not.toBe(saved0)
  })

  it('una app nueva con el mismo almacenamiento puede continuar la partida', () => {
    const first = makeStore()
    readyToStart(first.state)
    first.state().roll()
    first.state().next()
    first.state().roll()
    const expected = first.state().game

    const second = makeStore(first.storage)
    second.state().confirmAge()
    second.state().resumeSaved()
    expect(second.state().screen).toBe('game')
    expect(second.state().game).toEqual(expected)
    expect(second.state().saved).toBeNull()
  })

  it('un guardado dañado se descarta y se avisa', () => {
    const storage = memoryStorage()
    storage.setItem(SAVE_KEY, '{"version":1,"roto":true}')
    const { state } = makeStore(storage)
    expect(state().saved).toBeNull()
    expect(state().savedWasCorrupt).toBe(true)
    expect(storage.getItem(SAVE_KEY)).toBeNull()
  })

  it('empezar una partida nueva reemplaza el guardado anterior', () => {
    const first = makeStore()
    readyToStart(first.state, ['Ana', 'Beto'])
    const before = first.storage.getItem(SAVE_KEY)
    const second = makeStore(first.storage, 555)
    readyToStart(second.state, ['Uno', 'Dos'])
    expect(second.state().saved).toBeNull()
    expect(first.storage.getItem(SAVE_KEY)).not.toBe(before)
  })

  it('descartar el guardado lo borra', () => {
    const first = makeStore()
    readyToStart(first.state)
    const second = makeStore(first.storage)
    second.state().discardSaved()
    expect(second.state().saved).toBeNull()
    expect(first.storage.getItem(SAVE_KEY)).toBeNull()
  })

  it('si el navegador no deja guardar, la partida sigue y se avisa', () => {
    const broken: KeyValueStore = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError')
      },
      removeItem: () => undefined,
    }
    const { state } = makeStore(broken)
    readyToStart(state)
    expect(state().screen).toBe('game')
    expect(state().saveFailed).toBe(true)
  })
})

describe('jugadores en partida (hito 3.9)', () => {
  it('agrega y saca jugadores, y guarda el cambio', () => {
    const { state, storage } = makeStore()
    readyToStart(state, ['Ana', 'Beto'])
    const before = storage.getItem(SAVE_KEY)
    state().addPlayer('  Carla ')
    expect(state().game?.players.map((p) => p.name)).toEqual(['Ana', 'Beto', 'Carla'])
    expect(storage.getItem(SAVE_KEY)).not.toBe(before)
    state().removePlayer('p1')
    expect(state().game?.players.map((p) => p.name)).toEqual(['Beto', 'Carla'])
    expect(state().error).toBeNull()
  })

  it('muestra el error cuando el cambio no es válido y no altera la partida', () => {
    const { state } = makeStore()
    readyToStart(state, ['Ana', 'Beto'])
    const before = state().game
    state().removePlayer('p1')
    expect(state().error).toMatch(/menos de 2/)
    expect(state().game).toBe(before)
    state().addPlayer('   ')
    expect(state().error).toMatch(/nombre/)
  })

  it('no permite cambios con una tarjeta pendiente', () => {
    const { state } = makeStore()
    readyToStart(state)
    state().roll()
    const before = state().game
    state().addPlayer('Zeta')
    expect(state().error).toMatch(/antes de tirar/)
    expect(state().game).toBe(before)
  })

  it('el panel de jugadores se abre y se cierra sin tocar la partida', () => {
    const { state } = makeStore()
    readyToStart(state)
    const before = state().game
    state().openPlayers()
    expect(state().playersOpen).toBe(true)
    state().closePlayers()
    expect(state().playersOpen).toBe(false)
    expect(state().game).toBe(before)
  })
})

describe('fin de partida (hito 3.8)', () => {
  it('al terminar muestra resultados, borra el guardado y conserva al ganador', () => {
    const { state, storage } = makeStore()
    readyToStart(state, ['Ana', 'Beto'], 1)
    playToEnd(state)
    expect(state().screen).toBe('results')
    expect(state().game?.phase).toBe('finished')
    expect(state().game?.winnerId).not.toBeNull()
    expect(storage.getItem(SAVE_KEY)).toBeNull()
  })

  it('antes de pulsar Continuar en la tarjeta del ganador, la partida no ha terminado', () => {
    const { state } = makeStore()
    readyToStart(state, ['Ana', 'Beto'], 1)
    while (state().game?.winnerId === null) {
      if (state().game?.phase === 'roll') state().roll()
      else state().next()
    }
    expect(state().screen).toBe('game')
    expect(state().game?.phase).toBe('card')
    expect(state().game?.currentCard?.position).toBe(60)
    state().next()
    expect(state().screen).toBe('results')
  })

  it('jugar otra vez conserva jugadores y vueltas con un tablero nuevo', () => {
    const { state } = makeStore()
    readyToStart(state, ['Ana', 'Beto', 'Carla'], 2)
    const firstBoard = state().game!.board.map((a) => a.id)
    playToEnd(state)
    state().playAgain()
    expect(state().screen).toBe('game')
    expect(state().game?.players.map((p) => p.name)).toEqual(['Ana', 'Beto', 'Carla'])
    expect(state().game?.laps).toBe(2)
    expect(state().game?.board.map((a) => a.id)).not.toEqual(firstBoard)
    expect(state().game?.winnerId).toBeNull()
  })
})

describe('seedFromUrl', () => {
  it('lee ?seed= solo si es un entero válido', () => {
    expect(seedFromUrl('?seed=123')).toBe(123)
    expect(seedFromUrl('?seed=0')).toBe(0)
    expect(seedFromUrl('')).toBeNull()
    expect(seedFromUrl('?seed=abc')).toBeNull()
    expect(seedFromUrl('?seed=-4')).toBeNull()
    expect(seedFromUrl('?seed=1.5')).toBeNull()
    expect(seedFromUrl('?seed=99999999999')).toBeNull()
  })
})
