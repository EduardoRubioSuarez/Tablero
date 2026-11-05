import { describe, expect, it } from 'vitest'
import {
  INSTALL_TEXT,
  installHelpFor,
  isIosDevice,
  type InstallEnvironment,
} from '../../src/pwa/install'
import {
  dismissPwaNotice,
  setNeedRefresh,
  setOfflineReady,
  setUpdater,
  updateNow,
} from '../../src/pwa/updateStore'

const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
const IPAD_AS_MAC =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'
const ANDROID =
  'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36'
const DESKTOP =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

const env = (patch: Partial<InstallEnvironment>): InstallEnvironment => ({
  standalone: false,
  canPrompt: false,
  userAgent: DESKTOP,
  maxTouchPoints: 0,
  ...patch,
})

describe('guía de instalación (hito 5.3)', () => {
  it('no muestra nada si la app ya se abrió desde el ícono', () => {
    expect(installHelpFor(env({ standalone: true, userAgent: IPHONE }))).toBe('none')
    expect(installHelpFor(env({ standalone: true, canPrompt: true }))).toBe('none')
  })

  it('ofrece el botón del navegador cuando existe', () => {
    expect(installHelpFor(env({ canPrompt: true, userAgent: ANDROID }))).toBe('native')
    expect(installHelpFor(env({ canPrompt: true }))).toBe('native')
  })

  it('en iPhone y iPad explica el menú Compartir', () => {
    expect(installHelpFor(env({ userAgent: IPHONE }))).toBe('ios')
    expect(installHelpFor(env({ userAgent: IPAD_AS_MAC, maxTouchPoints: 5 }))).toBe('ios')
  })

  it('un Mac sin pantalla táctil no es un iPad', () => {
    expect(isIosDevice(IPAD_AS_MAC, 0)).toBe(false)
    expect(installHelpFor(env({ userAgent: IPAD_AS_MAC }))).toBe('none')
  })

  it('en Android sin botón explica el menú del navegador', () => {
    expect(installHelpFor(env({ userAgent: ANDROID }))).toBe('manual')
  })

  it('en una computadora sin opción de instalar no muestra nada', () => {
    expect(installHelpFor(env({}))).toBe('none')
  })

  it('cada guía tiene título y pasos', () => {
    for (const help of ['native', 'ios', 'manual'] as const) {
      expect(INSTALL_TEXT[help].title.length).toBeGreaterThan(0)
      expect(INSTALL_TEXT[help].steps.length).toBeGreaterThan(0)
    }
  })
})

describe('aviso de actualización (hito 5.4)', () => {
  it('la actualización se aplica solo cuando el jugador la pide', async () => {
    let applied = 0
    setUpdater(async () => {
      applied++
    })
    setNeedRefresh(true)
    expect(applied).toBe(0)
    await updateNow()
    expect(applied).toBe(1)
  })

  it('"Después" y "Entendido" cierran los avisos sin actualizar', () => {
    let applied = 0
    setUpdater(async () => {
      applied++
    })
    setNeedRefresh(true)
    setOfflineReady(true)
    dismissPwaNotice()
    expect(applied).toBe(0)
  })
})
