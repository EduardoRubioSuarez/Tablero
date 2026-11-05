import { describe, expect, it } from 'vitest'
import { LOGO_T, LOGO_WORD } from '../../src/ui/logoPaths'

describe('logo (hito 6.3)', () => {
  it('los trazos son datos de dibujo válidos', () => {
    for (const path of [LOGO_T, LOGO_WORD]) {
      expect(path.startsWith('M')).toBe(true)
      expect(path).not.toMatch(/NaN|undefined|Infinity/)
      expect(path.length).toBeGreaterThan(100)
    }
  })

  it('la T cabe en su caja de 100 × 100 y no es ni larga ni ancha', () => {
    const numbers = LOGO_T.match(/-?\d+(?:\.\d+)?/g)!.map(Number)
    const xs = numbers.filter((_, i) => i % 2 === 0)
    const ys = numbers.filter((_, i) => i % 2 === 1)
    const width = Math.max(...xs) - Math.min(...xs)
    const height = Math.max(...ys) - Math.min(...ys)
    expect(width).toBeLessThanOrEqual(56.5)
    expect(height).toBeLessThanOrEqual(62.5)
    expect(width / height).toBeGreaterThan(0.7)
    expect(width / height).toBeLessThan(1)
  })
})
