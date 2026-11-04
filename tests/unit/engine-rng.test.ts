import { describe, expect, it } from 'vitest'
import { generateSeed, makeRng, shuffle } from '../../src/engine/rng'

describe('makeRng', () => {
  it('es determinista: la misma semilla da la misma secuencia', () => {
    const a = makeRng(123)
    const b = makeRng(123)
    const seqA = Array.from({ length: 20 }, () => a.next())
    const seqB = Array.from({ length: 20 }, () => b.next())
    expect(seqA).toEqual(seqB)
  })

  it('semillas distintas dan secuencias distintas', () => {
    const sequence = (seed: number) => {
      const rng = makeRng(seed)
      return Array.from({ length: 5 }, () => rng.next())
    }
    expect(sequence(1)).not.toEqual(sequence(2))
  })

  it('next() devuelve valores en [0, 1)', () => {
    const rng = makeRng(7)
    for (let i = 0; i < 5000; i++) {
      const v = rng.next()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('int(n) devuelve enteros en [0, n) y cubre todos los valores', () => {
    const rng = makeRng(99)
    const seen = new Set<number>()
    for (let i = 0; i < 2000; i++) {
      const v = rng.int(6)
      expect(Number.isInteger(v)).toBe(true)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(6)
      seen.add(v)
    }
    expect(seen.size).toBe(6)
  })

  it('int() rechaza límites inválidos', () => {
    const rng = makeRng(1)
    expect(() => rng.int(0)).toThrow(RangeError)
    expect(() => rng.int(-3)).toThrow(RangeError)
    expect(() => rng.int(2.5)).toThrow(RangeError)
  })

  it('el estado guardado permite continuar la misma secuencia', () => {
    const original = makeRng(42)
    original.next()
    original.next()
    const resumed = makeRng(original.state)
    expect(resumed.next()).toBe(original.next())
    expect(resumed.next()).toBe(original.next())
  })
})

describe('shuffle', () => {
  it('devuelve una permutación sin modificar el original', () => {
    const items = Array.from({ length: 80 }, (_, i) => i)
    const copy = items.slice()
    const result = shuffle(items, makeRng(5))
    expect(items).toEqual(copy)
    expect(result).toHaveLength(80)
    expect([...result].sort((x, y) => x - y)).toEqual(items)
  })

  it('es determinista con la misma semilla y cambia con otra', () => {
    const items = Array.from({ length: 30 }, (_, i) => i)
    expect(shuffle(items, makeRng(8))).toEqual(shuffle(items, makeRng(8)))
    expect(shuffle(items, makeRng(8))).not.toEqual(shuffle(items, makeRng(9)))
  })

  it('maneja arreglos vacíos y de un elemento', () => {
    expect(shuffle([], makeRng(1))).toEqual([])
    expect(shuffle([7], makeRng(1))).toEqual([7])
  })
})

describe('generateSeed', () => {
  it('devuelve un entero sin signo de 32 bits', () => {
    const seed = generateSeed()
    expect(Number.isInteger(seed)).toBe(true)
    expect(seed).toBeGreaterThanOrEqual(0)
    expect(seed).toBeLessThan(2 ** 32)
  })
})
