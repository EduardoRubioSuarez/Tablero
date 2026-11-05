import { describe, expect, it } from 'vitest'
import { baseActions } from '../../src/content'
import { ICONS } from '../../src/ui/iconDrawings'
import { ICON_BY_ACTION, iconKeyFor } from '../../src/ui/iconMap'

describe('ilustraciones de las casillas (hito 4.2)', () => {
  it('cada una de las 80 acciones tiene su ícono propio', () => {
    for (const action of baseActions) {
      expect(ICON_BY_ACTION[action.id], `falta el ícono de ${action.id}`).toBeDefined()
      expect(ICONS[ICON_BY_ACTION[action.id]]).toBeDefined()
    }
  })

  it('no hay íconos asignados a acciones que no existen', () => {
    const ids = new Set(baseActions.map((a) => a.id))
    for (const id of Object.keys(ICON_BY_ACTION)) expect(ids.has(id), id).toBe(true)
  })

  it('las casillas de movimiento usan los íconos de movimiento', () => {
    const movement = baseActions.filter((a) => a.kind === 'movement')
    expect(movement.map((a) => iconKeyFor(a.id, a.kind)).sort()).toEqual([
      'back10',
      'back5',
      'flag',
    ])
  })

  it('una acción de otro pack sin dibujo usa el ícono de respaldo de su tipo', () => {
    expect(iconKeyFor('alberca-001', 'drink')).toBe('mugs')
    expect(iconKeyFor('alberca-002', 'dare')).toBe('megaphone')
    expect(iconKeyFor('alberca-003', 'truth')).toBe('vr')
    expect(iconKeyFor('alberca-004', 'movement')).toBe('back5')
  })

  it('todos los íconos definidos se usan en alguna acción', () => {
    const used = new Set(Object.values(ICON_BY_ACTION))
    for (const key of Object.keys(ICONS))
      expect(used.has(key as keyof typeof ICONS), key).toBe(true)
  })
})
