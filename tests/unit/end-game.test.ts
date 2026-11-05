import { describe, expect, it } from 'vitest'
import { baseActions } from '../../src/content'
import { createGameStore, type GameState } from '../../src/store/gameStore'
import { SAVE_KEY, memoryStorage } from '../../src/store/storage'

function makeStore() {
  const storage = memoryStorage()
  const store = createGameStore({ storage, actions: baseActions, newSeed: () => 100 })
  return { storage, state: (): GameState => store.getState() }
}

function start(state: () => GameState, names = ['Ana', 'Beto', 'Carla']) {
  state().confirmAge()
  state().goSetup()
  state().setDraft({ names, laps: 1 })
  state().startGame()
}

describe('terminar la partida antes de tiempo', () => {
  it('lleva a los resultados, marca el fin anticipado y borra el guardado', () => {
    const { state, storage } = makeStore()
    start(state)
    state().roll()
    expect(storage.getItem(SAVE_KEY)).not.toBeNull()
    state().openPlayers()
    state().endGame()
    expect(state().screen).toBe('results')
    expect(state().endedEarly).toBe(true)
    expect(state().playersOpen).toBe(false)
    expect(state().game?.winnerId).toBeNull()
    expect(storage.getItem(SAVE_KEY)).toBeNull()
    expect(state().saved).toBeNull()
  })

  it('jugar otra vez empieza una partida nueva con los mismos jugadores', () => {
    const { state } = makeStore()
    start(state, ['Ana', 'Beto'])
    state().endGame()
    state().playAgain()
    expect(state().screen).toBe('game')
    expect(state().endedEarly).toBe(false)
    expect(state().game?.players.map((p) => p.name)).toEqual(['Ana', 'Beto'])
  })

  it('volver al inicio limpia la marca de fin anticipado', () => {
    const { state } = makeStore()
    start(state)
    state().endGame()
    state().goHome()
    expect(state().endedEarly).toBe(false)
  })

  it('no hace nada si no hay partida', () => {
    const { state } = makeStore()
    state().confirmAge()
    state().endGame()
    expect(state().screen).toBe('home')
    expect(state().endedEarly).toBe(false)
  })
})

describe('aviso y privacidad (hito 6.2)', () => {
  it('se abre y se cierra sin tocar la partida', () => {
    const { state } = makeStore()
    state().confirmAge()
    state().openNotice()
    expect(state().noticeOpen).toBe(true)
    state().closeNotice()
    expect(state().noticeOpen).toBe(false)
    expect(state().screen).toBe('home')
  })
})
