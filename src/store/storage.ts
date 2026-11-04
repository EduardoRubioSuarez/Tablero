import { deserializeGame, serializeGame, type Game } from '../engine'

/** Almacén mínimo compatible con `localStorage`. */
export type KeyValueStore = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export const SAVE_KEY = 'tablero:partida:v1'

/** Almacén en memoria: sirve de respaldo y para pruebas. */
export function memoryStorage(): KeyValueStore {
  const data = new Map<string, string>()
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  }
}

/** `localStorage` si está disponible; si el navegador lo bloquea, usa memoria. */
export function browserStorage(): KeyValueStore {
  try {
    const probe = '__tablero_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return window.localStorage
  } catch {
    return memoryStorage()
  }
}

export type LoadedSave =
  { status: 'none' } | { status: 'ok'; game: Game } | { status: 'corrupt'; error: string }

/** Lee la partida guardada. Nunca lanza. */
export function loadSavedGame(store: KeyValueStore): LoadedSave {
  let text: string | null
  try {
    text = store.getItem(SAVE_KEY)
  } catch {
    return { status: 'none' }
  }
  if (text === null) return { status: 'none' }
  const result = deserializeGame(text)
  return result.ok
    ? { status: 'ok', game: result.game }
    : { status: 'corrupt', error: result.error }
}

/** Guarda la partida. Devuelve false si el navegador no dejó guardarla. */
export function saveGame(store: KeyValueStore, game: Game): boolean {
  try {
    store.setItem(SAVE_KEY, serializeGame(game))
    return true
  } catch {
    return false
  }
}

export function clearSavedGame(store: KeyValueStore): void {
  try {
    store.removeItem(SAVE_KEY)
  } catch {
    // Sin almacenamiento: no hay nada que borrar.
  }
}
