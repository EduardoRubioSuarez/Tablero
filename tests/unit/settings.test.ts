import { describe, expect, it } from 'vitest'
import { baseActions } from '../../src/content'
import { createGameStore } from '../../src/store/gameStore'
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  loadSettings,
  saveSettings,
} from '../../src/store/settings'
import { memoryStorage } from '../../src/store/storage'
import { CUES, PATTERNS } from '../../src/ui/feedback'

describe('ajustes de sonido y vibración (hito 4.8)', () => {
  it('por defecto están activados', () => {
    expect(loadSettings(memoryStorage())).toEqual(DEFAULT_SETTINGS)
    expect(DEFAULT_SETTINGS).toEqual({ sound: true, vibration: true })
  })

  it('se guardan y se leen', () => {
    const storage = memoryStorage()
    saveSettings(storage, { sound: false, vibration: true })
    expect(loadSettings(storage)).toEqual({ sound: false, vibration: true })
  })

  it('un guardado dañado o raro vuelve a los valores por defecto', () => {
    const storage = memoryStorage()
    storage.setItem(SETTINGS_KEY, '{no es json')
    expect(loadSettings(storage)).toEqual(DEFAULT_SETTINGS)
    storage.setItem(SETTINGS_KEY, '{"sound":"si","vibration":false}')
    expect(loadSettings(storage)).toEqual({ sound: true, vibration: false })
    storage.setItem(SETTINGS_KEY, 'null')
    expect(loadSettings(storage)).toEqual(DEFAULT_SETTINGS)
  })

  it('los interruptores de la app cambian y se recuerdan al reabrir', () => {
    const storage = memoryStorage()
    const make = () => createGameStore({ storage, actions: baseActions, newSeed: () => 1 })
    const first = make()
    first.getState().toggleSound()
    first.getState().toggleVibration()
    expect(first.getState().sound).toBe(false)
    expect(first.getState().vibration).toBe(false)
    const second = make()
    expect(second.getState().sound).toBe(false)
    expect(second.getState().vibration).toBe(false)
    second.getState().toggleSound()
    expect(make().getState().sound).toBe(true)
  })

  it('cada señal tiene sonido y vibración definidos', () => {
    for (const cue of Object.keys(CUES) as Array<keyof typeof CUES>) {
      expect(CUES[cue].length).toBeGreaterThan(0)
      expect(PATTERNS[cue].length).toBeGreaterThan(0)
      for (const note of CUES[cue]) {
        expect(note.freq).toBeGreaterThan(50)
        expect(note.dur).toBeGreaterThan(0)
      }
    }
  })
})
