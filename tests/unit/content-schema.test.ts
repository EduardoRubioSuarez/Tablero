import { describe, expect, it } from 'vitest'
import { ActionSchema, parseActions } from '../../src/content/schema'

const valid = { id: 'base-001', text: 'BESO AL MEJOR VESTIDO', pack: 'base', kind: 'dare' }

describe('ActionSchema', () => {
  it('acepta una acción válida', () => {
    expect(ActionSchema.safeParse(valid).success).toBe(true)
  })

  it('rechaza un id con formato incorrecto', () => {
    expect(ActionSchema.safeParse({ ...valid, id: 'x' }).success).toBe(false)
  })

  it('rechaza texto vacío', () => {
    expect(ActionSchema.safeParse({ ...valid, text: '' }).success).toBe(false)
  })

  it('rechaza un tipo desconocido', () => {
    expect(ActionSchema.safeParse({ ...valid, kind: 'baile' }).success).toBe(false)
  })

  it('acepta una casilla de movimiento con efecto', () => {
    const move = { ...valid, kind: 'movement', effect: { type: 'back', steps: 5 } }
    expect(ActionSchema.safeParse(move).success).toBe(true)
  })

  it('rechaza movimiento sin efecto', () => {
    expect(ActionSchema.safeParse({ ...valid, kind: 'movement' }).success).toBe(false)
  })

  it('rechaza un efecto en una acción que no es de movimiento', () => {
    const bad = { ...valid, effect: { type: 'toLapStart' } }
    expect(ActionSchema.safeParse(bad).success).toBe(false)
  })

  it('rechaza retroceder 0 casillas', () => {
    const bad = { ...valid, kind: 'movement', effect: { type: 'back', steps: 0 } }
    expect(ActionSchema.safeParse(bad).success).toBe(false)
  })
})

describe('parseActions', () => {
  it('rechaza ids duplicados', () => {
    expect(() => parseActions([valid, valid])).toThrow(/duplicado/i)
  })

  it('devuelve la lista cuando es válida', () => {
    expect(parseActions([valid])).toHaveLength(1)
  })
})
