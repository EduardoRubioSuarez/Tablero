import { useStore } from 'zustand'
import { createStore, type StoreApi } from 'zustand/vanilla'
import { baseActions, type Action } from '../content'
import {
  MAX_SEED,
  addPlayer,
  continueTurn,
  createGame,
  generateSeed,
  removePlayer,
  rollDice,
  type Game,
} from '../engine'
import { DEFAULT_SETUP, cleanNames, validateSetup, type SetupDraft } from './setup'
import {
  browserStorage,
  clearSavedGame,
  loadSavedGame,
  saveGame,
  type KeyValueStore,
} from './storage'

/**
 * Pantalla actual:
 * - warning: advertencia +18, aparece cada vez que se abre la app.
 * - denied: el usuario dijo que es menor de edad.
 * - home: inicio (nueva partida o continuar).
 * - setup: configurar jugadores y vueltas.
 * - game: partida en curso (incluye la tarjeta final del ganador).
 * - results: fin de partida y tabla de posiciones.
 */
export type Screen = 'warning' | 'denied' | 'home' | 'setup' | 'game' | 'results'

export type GameState = {
  screen: Screen
  game: Game | null
  /** Partida guardada que se puede continuar. */
  saved: Game | null
  /** Se encontró un guardado dañado y se descartó. */
  savedWasCorrupt: boolean
  /** No se pudo guardar la partida en este navegador. */
  saveFailed: boolean
  rulesOpen: boolean
  playersOpen: boolean
  draft: SetupDraft
  error: string | null

  confirmAge: () => void
  denyAge: () => void
  goHome: () => void
  goSetup: () => void
  setDraft: (draft: SetupDraft) => void
  startGame: () => void
  roll: () => void
  next: () => void
  resumeSaved: () => void
  discardSaved: () => void
  playAgain: () => void
  openRules: () => void
  closeRules: () => void
  openPlayers: () => void
  closePlayers: () => void
  addPlayer: (name: string) => void
  removePlayer: (playerId: string) => void
}

export type StoreDeps = {
  storage: KeyValueStore
  actions: readonly Action[]
  newSeed: () => number
}

/** Semilla opcional en la dirección (?seed=123), útil para depurar y para las pruebas e2e. */
export function seedFromUrl(search: string): number | null {
  const raw = new URLSearchParams(search).get('seed')
  if (raw === null || !/^\d+$/.test(raw)) return null
  const seed = Number(raw)
  return seed <= MAX_SEED ? seed : null
}

export function defaultDeps(): StoreDeps {
  const forced = typeof window === 'undefined' ? null : seedFromUrl(window.location.search)
  return {
    storage: browserStorage(),
    actions: baseActions,
    newSeed: () => forced ?? generateSeed(),
  }
}

/** Crea el almacén de estado de la aplicación. Se separa para poder probarlo. */
export function createGameStore(deps: StoreDeps): StoreApi<GameState> {
  const initial = loadSavedGame(deps.storage)
  if (initial.status === 'corrupt') clearSavedGame(deps.storage)

  return createStore<GameState>()((set, get) => {
    /** Guarda la partida (o borra el guardado si ya terminó) y devuelve el estado a fusionar. */
    function persist(game: Game): Pick<GameState, 'saveFailed'> {
      if (game.phase === 'finished') {
        clearSavedGame(deps.storage)
        return { saveFailed: false }
      }
      return { saveFailed: !saveGame(deps.storage, game) }
    }

    function begin(names: string[], laps: number): void {
      try {
        const game = createGame({
          playerNames: names,
          laps,
          seed: deps.newSeed(),
          actions: deps.actions,
        })
        set({
          game,
          saved: null,
          screen: 'game',
          rulesOpen: false,
          playersOpen: false,
          error: null,
          ...persist(game),
        })
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'No se pudo crear la partida' })
      }
    }

    /** Aplica un cambio de jugadores a la partida en curso y lo guarda; muestra el error si no se puede. */
    function change(update: (game: Game) => Game): void {
      const { game } = get()
      if (!game) return
      try {
        const next = update(game)
        set({ game: next, error: null, ...persist(next) })
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'No se pudo cambiar la lista' })
      }
    }

    return {
      screen: 'warning',
      game: null,
      saved: initial.status === 'ok' ? initial.game : null,
      savedWasCorrupt: initial.status === 'corrupt',
      saveFailed: false,
      rulesOpen: false,
      playersOpen: false,
      draft: DEFAULT_SETUP,
      error: null,

      confirmAge: () => set({ screen: 'home' }),
      denyAge: () => set({ screen: 'denied' }),
      goHome: () => set({ screen: 'home', rulesOpen: false, playersOpen: false, error: null }),
      goSetup: () => set({ screen: 'setup', error: null }),
      setDraft: (draft) => set({ draft, error: null }),

      startGame: () => {
        const { draft } = get()
        const problems = validateSetup(draft)
        if (problems.length > 0) {
          set({ error: problems[0] })
          return
        }
        begin(cleanNames(draft.names), draft.laps)
      },

      roll: () => {
        const { game } = get()
        if (!game || game.phase !== 'roll') return
        const next = rollDice(game)
        set({
          game: next,
          screen: next.phase === 'finished' ? 'results' : 'game',
          ...persist(next),
        })
      },

      next: () => {
        const { game } = get()
        if (!game || game.phase !== 'card') return
        const next = continueTurn(game)
        set({
          game: next,
          screen: next.phase === 'finished' ? 'results' : 'game',
          ...persist(next),
        })
      },

      resumeSaved: () => {
        const { saved } = get()
        if (!saved) return
        set({
          game: saved,
          saved: null,
          screen: 'game',
          rulesOpen: false,
          playersOpen: false,
          saveFailed: false,
          error: null,
        })
      },

      discardSaved: () => {
        clearSavedGame(deps.storage)
        set({ saved: null, savedWasCorrupt: false })
      },

      playAgain: () => {
        const { game } = get()
        if (!game) return
        begin(
          game.players.map((p) => p.name),
          game.laps,
        )
      },

      openRules: () => set({ rulesOpen: true }),
      closeRules: () => set({ rulesOpen: false }),
      openPlayers: () => set({ playersOpen: true, error: null }),
      closePlayers: () => set({ playersOpen: false, error: null }),

      addPlayer: (name) => change((game) => addPlayer(game, name)),
      removePlayer: (playerId) => change((game) => removePlayer(game, playerId)),
    }
  })
}

export const gameStore = createGameStore(defaultDeps())

/** Hook para leer el estado desde los componentes. */
export function useGame<T>(selector: (state: GameState) => T): T {
  return useStore(gameStore, selector)
}
