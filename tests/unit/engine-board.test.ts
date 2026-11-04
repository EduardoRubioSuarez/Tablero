import { describe, expect, it } from 'vitest'
import { baseActions, type Action } from '../../src/content'
import { buildBoard, selectActions, validateBoard } from '../../src/engine/board'
import { makeRng } from '../../src/engine/rng'

const lapStart = baseActions.find((a) => a.effect?.type === 'toLapStart') as Action
const back5 = baseActions.find((a) => a.effect?.type === 'back' && a.effect.steps === 5) as Action
const back10 = baseActions.find((a) => a.effect?.type === 'back' && a.effect.steps === 10) as Action
const plain = baseActions.filter((a) => a.effect === undefined)

/** Tablero a mano: coloca acciones en posiciones concretas y rellena el resto. */
function handmade(placed: Record<number, Action>): Action[] {
  const fillers = [...plain]
  const board: Action[] = []
  for (let position = 1; position <= 60; position++) {
    board.push(placed[position] ?? (fillers.shift() as Action))
  }
  return board
}

describe('selectActions (hito 2.2)', () => {
  it('elige 60 acciones distintas, todas del contenido, incluida VUELVE A LA SALIDA', () => {
    const selected = selectActions(baseActions, makeRng(1))
    expect(selected).toHaveLength(60)
    expect(new Set(selected.map((a) => a.id)).size).toBe(60)
    expect(selected.some((a) => a.effect?.type === 'toLapStart')).toBe(true)
    const ids = new Set(baseActions.map((a) => a.id))
    expect(selected.every((a) => ids.has(a.id))).toBe(true)
  })

  it('con la misma semilla da el mismo resultado; con otra, uno distinto', () => {
    const ids = (seed: number) => selectActions(baseActions, makeRng(seed)).map((a) => a.id)
    expect(ids(10)).toEqual(ids(10))
    expect(ids(10)).not.toEqual(ids(11))
  })

  it('no modifica el contenido original', () => {
    const copy = baseActions.map((a) => a.id)
    selectActions(baseActions, makeRng(3))
    expect(baseActions.map((a) => a.id)).toEqual(copy)
  })

  it('falla si falta VUELVE A LA SALIDA o si hay menos de 60 acciones', () => {
    expect(() => selectActions(plain, makeRng(1))).toThrow(/VUELVE A LA SALIDA/)
    expect(() => selectActions(baseActions.slice(0, 40), makeRng(1))).toThrow()
  })

  it('con más de una VUELVE A LA SALIDA en el contenido, usa solo una', () => {
    const second: Action = { ...lapStart, id: 'extra-001' }
    for (let seed = 0; seed < 50; seed++) {
      const selected = selectActions([...baseActions, second], makeRng(seed))
      expect(selected.filter((a) => a.effect?.type === 'toLapStart')).toHaveLength(1)
    }
  })
})

describe('validateBoard (hito 2.3)', () => {
  it('acepta un tablero correcto hecho a mano', () => {
    const board = handmade({ 50: lapStart, 20: back5, 40: back10 })
    expect(validateBoard(board)).toEqual([])
  })

  it('rechaza un tablero que no tiene 60 casillas', () => {
    expect(validateBoard(plain.slice(0, 59))).toHaveLength(1)
  })

  it('rechaza un retroceso antes de la posición 11', () => {
    const board = handmade({ 50: lapStart, 10: back5 })
    expect(validateBoard(board).join()).toMatch(/11 o más/)
  })

  it('acepta un retroceso de 10 justo en la posición 11 (llega a la 1)', () => {
    expect(validateBoard(handmade({ 50: lapStart, 11: back10 }))).toEqual([])
  })

  it('rechaza un retroceso que termina en otro retroceso', () => {
    const board = handmade({ 50: lapStart, 20: back5, 25: back5 })
    expect(validateBoard(board).join()).toMatch(/otra casilla de movimiento/)
  })

  it('rechaza un retroceso que termina en VUELVE A LA SALIDA', () => {
    const board = handmade({ 50: lapStart, 55: back5 })
    expect(validateBoard(board).join()).toMatch(/otra casilla de movimiento/)
  })

  it('rechaza VUELVE A LA SALIDA fuera de las posiciones 41 a 60', () => {
    expect(validateBoard(handmade({ 40: lapStart })).join()).toMatch(/entre las posiciones 41 y 60/)
    expect(validateBoard(handmade({ 41: lapStart }))).toEqual([])
    expect(validateBoard(handmade({ 60: lapStart }))).toEqual([])
  })

  it('rechaza un tablero sin VUELVE A LA SALIDA', () => {
    expect(validateBoard(handmade({})).join()).toMatch(/exactamente una/)
  })

  it('rechaza acciones repetidas', () => {
    const board = handmade({ 50: lapStart })
    board[0] = board[1]
    expect(validateBoard(board).join()).toMatch(/repetida/)
  })
})

describe('buildBoard (hito 2.3)', () => {
  it('arma un tablero válido de 60 casillas', () => {
    const board = buildBoard(baseActions, makeRng(2026))
    expect(board).toHaveLength(60)
    expect(validateBoard(board)).toEqual([])
  })

  it('es reproducible con la misma semilla', () => {
    const ids = (seed: number) => buildBoard(baseActions, makeRng(seed)).map((a) => a.id)
    expect(ids(77)).toEqual(ids(77))
    expect(ids(77)).not.toEqual(ids(78))
  })

  it('coloca siempre VUELVE A LA SALIDA en las últimas 20 casillas', () => {
    const board = buildBoard(baseActions, makeRng(5))
    const position = board.findIndex((a) => a.effect?.type === 'toLapStart') + 1
    expect(position).toBeGreaterThanOrEqual(41)
    expect(position).toBeLessThanOrEqual(60)
  })

  it('un retroceso largo (12) nunca queda donde saldría de la vuelta', () => {
    const back12: Action = { ...back10, id: 'extra-901', effect: { type: 'back', steps: 12 } }
    for (let seed = 0; seed < 300; seed++) {
      const board = buildBoard([...baseActions, back12], makeRng(seed))
      const position = board.findIndex((a) => a.id === 'extra-901') + 1
      if (position > 0) expect(position, `semilla ${seed}`).toBeGreaterThanOrEqual(13)
      expect(validateBoard(board), `semilla ${seed}`).toEqual([])
    }
  })

  it('funciona con contenido extra con más retrocesos', () => {
    const extra: Action[] = [back5, back10].flatMap((a, i) => [
      { ...a, id: `extra-${i}1` },
      { ...a, id: `extra-${i}2` },
    ])
    for (let seed = 0; seed < 200; seed++) {
      const board = buildBoard([...baseActions, ...extra], makeRng(seed))
      expect(validateBoard(board), `semilla ${seed}`).toEqual([])
    }
  })
})
