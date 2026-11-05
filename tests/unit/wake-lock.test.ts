import { describe, expect, it } from 'vitest'
import { createWakeLock, type WakeSentinel, type WakeStatus } from '../../src/ui/wakeLock'

function fakeDoc() {
  const listeners = new Set<() => void>()
  return {
    visibilityState: 'visible',
    addEventListener: (_: 'visibilitychange', fn: () => void) => void listeners.add(fn),
    removeEventListener: (_: 'visibilitychange', fn: () => void) => void listeners.delete(fn),
    fire() {
      listeners.forEach((fn) => fn())
    },
    count: () => listeners.size,
  }
}

type FakeSentinel = WakeSentinel & { released: boolean; drop(): void }

function fakeNav(options: { fail?: boolean } = {}) {
  const sentinels: FakeSentinel[] = []
  return {
    sentinels,
    wakeLock: {
      request: async (): Promise<WakeSentinel> => {
        if (options.fail) throw new Error('NotAllowedError')
        const handlers: Array<() => void> = []
        const s: FakeSentinel = {
          released: false,
          release: async () => {
            s.released = true
          },
          addEventListener: (_: 'release', fn: () => void) => void handlers.push(fn),
          drop: () => handlers.forEach((h) => h()),
        }
        sentinels.push(s)
        return s
      },
    },
  }
}

describe('pantalla siempre encendida (hito 4.9)', () => {
  it('pide el bloqueo al empezar y lo libera al terminar', async () => {
    const nav = fakeNav()
    const doc = fakeDoc()
    const seen: WakeStatus[] = []
    const lock = createWakeLock(nav, doc, (s) => seen.push(s))
    await lock.start()
    expect(seen).toEqual(['active'])
    expect(nav.sentinels).toHaveLength(1)
    await lock.stop()
    expect(nav.sentinels[0].released).toBe(true)
    expect(seen.at(-1)).toBe('idle')
    expect(doc.count()).toBe(0)
  })

  it('lo vuelve a pedir cuando la página vuelve a estar visible', async () => {
    const nav = fakeNav()
    const doc = fakeDoc()
    const lock = createWakeLock(nav, doc, () => {})
    await lock.start()
    nav.sentinels[0].drop() // el navegador lo suelta al cambiar de pestaña
    doc.fire()
    await Promise.resolve()
    await Promise.resolve()
    expect(nav.sentinels).toHaveLength(2)
  })

  it('no pide un segundo bloqueo si ya tiene uno', async () => {
    const nav = fakeNav()
    const doc = fakeDoc()
    const lock = createWakeLock(nav, doc, () => {})
    await lock.start()
    doc.fire()
    await Promise.resolve()
    expect(nav.sentinels).toHaveLength(1)
  })

  it('si el navegador no tiene la API, avisa y no falla', async () => {
    const seen: WakeStatus[] = []
    const lock = createWakeLock({}, fakeDoc(), (s) => seen.push(s))
    expect(lock.supported).toBe(false)
    await lock.start()
    await lock.stop()
    expect(seen).toContain('unsupported')
  })

  it('si el navegador lo niega, avisa y puede reintentar', async () => {
    const seen: WakeStatus[] = []
    const lock = createWakeLock(fakeNav({ fail: true }), fakeDoc(), (s) => seen.push(s))
    await lock.start()
    expect(seen).toEqual(['denied'])
  })
})
