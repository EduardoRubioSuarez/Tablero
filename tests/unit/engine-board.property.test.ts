import { describe, expect, it } from 'vitest'
import { baseActions } from '../../src/content'
import { buildBoard, validateBoard } from '../../src/engine/board'
import { makeRng } from '../../src/engine/rng'

const SEEDS = 10_000

describe('propiedades del tablero con 10 000 semillas (hito 2.4)', () => {
  const boards = Array.from({ length: SEEDS }, (_, seed) => buildBoard(baseActions, makeRng(seed)))

  it('ningún tablero rompe una regla', () => {
    const broken: string[] = []
    boards.forEach((board, seed) => {
      const problems = validateBoard(board)
      if (problems.length > 0) broken.push(`semilla ${seed}: ${problems.join('; ')}`)
    })
    expect(broken.slice(0, 5)).toEqual([])
  })

  it('siempre hay 60 casillas distintas y una sola VUELVE A LA SALIDA entre la 41 y la 60', () => {
    for (const board of boards) {
      expect(board).toHaveLength(60)
      expect(new Set(board.map((a) => a.id)).size).toBe(60)
      const positions = board
        .map((a, i) => (a.effect?.type === 'toLapStart' ? i + 1 : 0))
        .filter((p) => p > 0)
      expect(positions).toHaveLength(1)
      expect(positions[0]).toBeGreaterThanOrEqual(41)
      expect(positions[0]).toBeLessThanOrEqual(60)
    }
  })

  it('todo retroceso está en la posición 11 o más y termina en una casilla sin movimiento', () => {
    for (const board of boards) {
      board.forEach((action, index) => {
        if (action.effect?.type !== 'back') return
        const position = index + 1
        const destination = position - action.effect.steps
        expect(position).toBeGreaterThanOrEqual(11)
        expect(destination).toBeGreaterThanOrEqual(1)
        expect(board[destination - 1].effect).toBeUndefined()
      })
    }
  })

  it('el azar sí varía: salen 0, 1 y 2 retrocesos, y VUELVE A LA SALIDA usa todo el rango', () => {
    const backCounts = new Set<number>()
    const lapStartPositions = new Set<number>()
    for (const board of boards) {
      backCounts.add(board.filter((a) => a.effect?.type === 'back').length)
      lapStartPositions.add(board.findIndex((a) => a.effect?.type === 'toLapStart') + 1)
    }
    expect([...backCounts].sort()).toEqual([0, 1, 2])
    expect(lapStartPositions.size).toBe(20)
  })
})
