import { CELLS_PER_LAP } from '../../engine'

/** Columnas del tablero. Con 60 casillas salen 10 filas. */
export const COLUMNS = 6
export const CELL_ROWS = CELLS_PER_LAP / COLUMNS

/** Filas del mapa: la salida (0), las 10 filas de casillas (1 a 10) y la meta (11). */
export const MAP_ROWS = CELL_ROWS + 2
export const START_ROW = 0
export const FINISH_ROW = MAP_ROWS - 1

/** Fila del mapa donde está una posición (0 = salida, 1 a 60 = casillas). */
export function rowOf(position: number): number {
  if (position <= 0) return START_ROW
  return 1 + Math.floor((position - 1) / COLUMNS)
}

/** Columna (0 a 5) de una casilla. Las filas impares van de derecha a izquierda (camino serpenteante). */
export function columnOf(position: number): number {
  const index = (position - 1) % COLUMNS
  const cellRow = Math.floor((position - 1) / COLUMNS)
  return cellRow % 2 === 0 ? index : COLUMNS - 1 - index
}

/** Las 60 posiciones en el orden en que se dibujan (fila por fila, de arriba abajo). */
export function displayOrder(): number[] {
  const order: number[] = []
  for (let row = 0; row < CELL_ROWS; row++) {
    const cells: number[] = []
    for (let col = 0; col < COLUMNS; col++) cells.push(row * COLUMNS + col + 1)
    if (row % 2 === 1) cells.reverse()
    order.push(...cells)
  }
  return order
}

/** Lugar de una ficha: vuelta y posición. */
export type Spot = { lap: number; position: number }

/** Siguiente casilla en el camino. Al rebasar la 60 se pasa a la vuelta siguiente (sin parar en la salida). */
export function nextSpot(spot: Spot): Spot {
  if (spot.position >= CELLS_PER_LAP) return { lap: spot.lap + 1, position: 1 }
  return { lap: spot.lap, position: spot.position + 1 }
}

/**
 * Casillas que recorre una ficha al avanzar de `from` a `to`, una por una. Devuelve null si el
 * movimiento no es una caminata corta hacia adelante (un retroceso o volver a la salida): en ese
 * caso la ficha salta directo.
 */
export function walkPath(from: Spot, to: Spot, maxSteps = 8): Spot[] | null {
  const path: Spot[] = []
  let current = from
  for (let i = 0; i < maxSteps; i++) {
    if (current.lap === to.lap && current.position === to.position) return path
    current = nextSpot(current)
    path.push(current)
  }
  return current.lap === to.lap && current.position === to.position ? path : null
}

/** Limita el desplazamiento vertical de la cámara para que no se salga del tablero. */
export function clampPan(
  y: number,
  viewHeight: number,
  contentBottom: number,
  scale: number,
): number {
  const min = Math.min(0, viewHeight - contentBottom * scale)
  return Math.max(min, Math.min(0, y))
}

const PALETTE = [
  '#ffd21f',
  '#ff4f8b',
  '#3ad6ff',
  '#6fe07a',
  '#ff9f1c',
  '#c58bff',
  '#ff6b5e',
  '#2dd4bf',
  '#f5f5f5',
  '#8ea2ff',
]

/**
 * Color de la ficha de un jugador (ids "p1", "p2"...). Los primeros diez son colores vivos y
 * muy distintos; el resto se genera con saltos de tono para llegar a 30 sin repetir.
 */
export function playerColor(playerId: string): string {
  const n = Math.max(1, Number(playerId.slice(1)) || 1)
  if (n <= PALETTE.length) return PALETTE[n - 1]
  const k = n - PALETTE.length
  return `hsl(${(k * 47 + 20) % 360} 88% ${k % 2 === 0 ? 62 : 48}%)`
}
