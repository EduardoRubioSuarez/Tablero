import { describe, expect, it } from 'vitest'
import {
  COLUMNS,
  FINISH_ROW,
  MAP_ROWS,
  clampPan,
  columnOf,
  displayOrder,
  nextSpot,
  playerColor,
  rowOf,
  walkPath,
} from '../../src/ui/map/geometry'

describe('camino serpenteante (hito 4.3)', () => {
  it('dibuja las 60 casillas una sola vez', () => {
    const order = displayOrder()
    expect(order).toHaveLength(60)
    expect(new Set(order).size).toBe(60)
    expect(Math.min(...order)).toBe(1)
    expect(Math.max(...order)).toBe(60)
  })

  it('las filas pares van de izquierda a derecha y las impares al revés', () => {
    const order = displayOrder()
    expect(order.slice(0, COLUMNS)).toEqual([1, 2, 3, 4, 5, 6])
    expect(order.slice(COLUMNS, COLUMNS * 2)).toEqual([12, 11, 10, 9, 8, 7])
    expect(order.slice(-COLUMNS)).toEqual([60, 59, 58, 57, 56, 55])
  })

  it('cada casilla está en la columna y fila donde se dibuja', () => {
    const order = displayOrder()
    order.forEach((position, index) => {
      expect(columnOf(position)).toBe(index % COLUMNS)
      expect(rowOf(position)).toBe(1 + Math.floor(index / COLUMNS))
    })
  })

  it('la salida está arriba y la meta es la última fila', () => {
    expect(rowOf(0)).toBe(0)
    expect(rowOf(1)).toBe(1)
    expect(rowOf(60)).toBe(10)
    expect(FINISH_ROW).toBe(MAP_ROWS - 1)
  })

  it('casillas consecutivas siempre son vecinas en el dibujo', () => {
    for (let p = 1; p < 60; p++) {
      const dr = Math.abs(rowOf(p + 1) - rowOf(p))
      const dc = Math.abs(columnOf(p + 1) - columnOf(p))
      expect(dr + dc).toBe(1)
    }
  })
})

describe('fichas que caminan (hito 4.6)', () => {
  it('después de la 60 sigue la 1 de la vuelta siguiente', () => {
    expect(nextSpot({ lap: 1, position: 60 })).toEqual({ lap: 2, position: 1 })
    expect(nextSpot({ lap: 1, position: 0 })).toEqual({ lap: 1, position: 1 })
  })

  it('recorre las casillas intermedias al avanzar', () => {
    expect(walkPath({ lap: 1, position: 3 }, { lap: 1, position: 6 })).toEqual([
      { lap: 1, position: 4 },
      { lap: 1, position: 5 },
      { lap: 1, position: 6 },
    ])
    expect(walkPath({ lap: 1, position: 0 }, { lap: 1, position: 4 })).toHaveLength(4)
  })

  it('al rebasar la 60 pasa por la 60 y entra a la vuelta siguiente', () => {
    const path = walkPath({ lap: 1, position: 58 }, { lap: 2, position: 3 })
    expect(path?.map((s) => `${s.lap}:${s.position}`)).toEqual([
      '1:59',
      '1:60',
      '2:1',
      '2:2',
      '2:3',
    ])
  })

  it('no camina un retroceso ni volver a la salida: salta directo', () => {
    expect(walkPath({ lap: 1, position: 20 }, { lap: 1, position: 15 })).toBeNull()
    expect(walkPath({ lap: 1, position: 50 }, { lap: 1, position: 0 })).toBeNull()
    expect(walkPath({ lap: 1, position: 10 }, { lap: 1, position: 10 })).toEqual([])
  })
})

describe('cámara y colores (hitos 4.3 y 4.4)', () => {
  it('la cámara no se sale del tablero', () => {
    expect(clampPan(50, 300, 800, 1)).toBe(0)
    expect(clampPan(-9999, 300, 800, 1)).toBe(-500)
    expect(clampPan(-200, 300, 800, 1)).toBe(-200)
    expect(clampPan(-9999, 300, 800, 0.5)).toBe(-100)
    expect(clampPan(-50, 300, 200, 1)).toBe(0)
  })

  it('hay 30 colores de ficha distintos', () => {
    const colors = Array.from({ length: 30 }, (_, i) => playerColor(`p${i + 1}`))
    expect(new Set(colors).size).toBe(30)
  })

  it('un jugador agregado más tarde conserva su color', () => {
    expect(playerColor('p7')).toBe(playerColor('p7'))
    expect(playerColor('p31')).not.toBe(playerColor('p1'))
  })
})
