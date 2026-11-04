import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { baseActions } from '../../src/content'

/** Lee docs/casillas.md y devuelve { número original: texto } sin la casilla eliminada. */
function readCasillas(): Map<number, string> {
  const lines = readFileSync('docs/casillas.md', 'utf8').split(/\r?\n/)
  const map = new Map<number, string>()
  for (const line of lines) {
    const m = line.match(/^(\d+)\. (.+?)\s*$/)
    if (m && !m[2].startsWith('~~')) map.set(Number(m[1]), m[2])
  }
  return map
}

describe('contenido base', () => {
  it('tiene 80 acciones, todas del pack base', () => {
    expect(baseActions).toHaveLength(80)
    expect(baseActions.every((a) => a.pack === 'base')).toBe(true)
  })

  it('no incluye la casilla del dado (eliminada)', () => {
    expect(baseActions.some((a) => /DADO/i.test(a.text))).toBe(false)
    expect(baseActions.some((a) => a.id === 'base-047')).toBe(false)
  })

  it('tiene exactamente 3 casillas de movimiento con los efectos correctos', () => {
    const moves = baseActions.filter((a) => a.kind === 'movement')
    expect(moves).toHaveLength(3)
    const byText = Object.fromEntries(moves.map((m) => [m.text, m.effect]))
    expect(byText['RETROCEDE 5 CASILLAS']).toEqual({ type: 'back', steps: 5 })
    expect(byText['RETROCEDE 10 CASILLAS']).toEqual({ type: 'back', steps: 10 })
    expect(byText['VUELVE A LA SALIDA']).toEqual({ type: 'toLapStart' })
  })

  it('conserva el texto de docs/casillas.md sin cambios', () => {
    const casillas = readCasillas()
    expect(casillas.size).toBe(80)
    for (const action of baseActions) {
      const n = Number(action.id.split('-')[1])
      expect(action.text, action.id).toBe(casillas.get(n))
    }
  })
})
