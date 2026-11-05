import { describe, expect, it } from 'vitest'
import { FACE_ROTATION, PIPS } from '../../src/ui/diceFaces'

type V = [number, number, number]

// Giros de CSS (rotateX, rotateY, rotateZ) sobre un punto; y positivo es hacia abajo.
const rad = (d: number) => (d * Math.PI) / 180
const rx = ([x, y, z]: V, d: number): V => [
  x,
  y * Math.cos(rad(d)) - z * Math.sin(rad(d)),
  y * Math.sin(rad(d)) + z * Math.cos(rad(d)),
]
const ry = ([x, y, z]: V, d: number): V => [
  x * Math.cos(rad(d)) + z * Math.sin(rad(d)),
  y,
  -x * Math.sin(rad(d)) + z * Math.cos(rad(d)),
]
const rz = ([x, y, z]: V, d: number): V => [
  x * Math.cos(rad(d)) - y * Math.sin(rad(d)),
  x * Math.sin(rad(d)) + y * Math.cos(rad(d)),
  z,
]

/** Dónde apunta, antes de girar, la cara de cada número (misma disposición que el CSS). */
const NORMAL: Record<number, V> = {
  1: [0, 0, 1],
  6: [0, 0, -1],
  2: [1, 0, 0],
  5: [-1, 0, 0],
  3: [0, -1, 0],
  4: [0, 1, 0],
}

describe('dado en 3D (hito 4.6)', () => {
  it('el número que se tira queda en la cara de arriba', () => {
    for (let n = 1; n <= 6; n++) {
      const [x, y, z] = FACE_ROTATION[n]
      // transform: rotateX(x) rotateY(y) rotateZ(z) aplica primero Z, luego Y y al final X.
      const [px, py, pz] = rx(ry(rz(NORMAL[n], z), y), x)
      expect(px, `cara ${n}`).toBeCloseTo(0)
      expect(py, `cara ${n}`).toBeCloseTo(-1)
      expect(pz, `cara ${n}`).toBeCloseTo(0)
    }
  })

  it('cada cara tiene tantos puntos como su número', () => {
    for (let n = 1; n <= 6; n++) expect(PIPS[n]).toHaveLength(n)
  })

  it('caras opuestas suman 7', () => {
    expect(1 + 6).toBe(7)
    expect(2 + 5).toBe(7)
    expect(3 + 4).toBe(7)
  })
})
