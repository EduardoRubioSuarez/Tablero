import type { KeyValueStore } from './storage'

/** Hito 4.8. Ajustes opcionales de sonido y vibración. */
export type Settings = { sound: boolean; vibration: boolean }

export const SETTINGS_KEY = 'tablero:ajustes:v1'
export const DEFAULT_SETTINGS: Settings = { sound: true, vibration: true }

/** Lee los ajustes guardados. Nunca lanza: ante cualquier problema usa los valores por defecto. */
export function loadSettings(store: KeyValueStore): Settings {
  try {
    const text = store.getItem(SETTINGS_KEY)
    if (text === null) return DEFAULT_SETTINGS
    const data: unknown = JSON.parse(text)
    if (typeof data !== 'object' || data === null) return DEFAULT_SETTINGS
    const { sound, vibration } = data as Record<string, unknown>
    return {
      sound: typeof sound === 'boolean' ? sound : DEFAULT_SETTINGS.sound,
      vibration: typeof vibration === 'boolean' ? vibration : DEFAULT_SETTINGS.vibration,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

/** Guarda los ajustes. Si el navegador no deja, se conservan solo mientras la página siga abierta. */
export function saveSettings(store: KeyValueStore, settings: Settings): void {
  try {
    store.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // Sin almacenamiento: no pasa nada grave.
  }
}
