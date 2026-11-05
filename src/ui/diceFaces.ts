/** Qué pips se encienden en cada cara (cuadrícula de 3 × 3, de 0 a 8). */
export const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
}

/**
 * Giro del cubo (X, Y, Z, en grados, aplicados en ese orden como en CSS) que deja arriba la cara
 * con ese valor. El número de la cara de arriba es la cantidad de casillas que avanza el jugador.
 * Caras: 1 al frente, 6 atrás, 2 a la derecha, 5 a la izquierda, 3 arriba y 4 abajo.
 */
export const FACE_ROTATION: Record<number, [number, number, number]> = {
  1: [90, 0, 0],
  2: [0, 0, -90],
  3: [0, 0, 0],
  4: [180, 0, 0],
  5: [0, 0, 90],
  6: [-90, 0, 0],
}
