import { describe, expect, it } from 'vitest'
import { qrModules, qrPath } from '../../src/ui/qr'

describe('código QR (hito 6.4)', () => {
  it('es una matriz cuadrada con los tres cuadros de esquina', () => {
    const m = qrModules('https://tablero.vercel.app/')
    expect(m.length).toBeGreaterThanOrEqual(21)
    for (const row of m) expect(row).toHaveLength(m.length)
    const n = m.length
    // Cada esquina (salvo abajo a la derecha) lleva un cuadro de 7 × 7 con borde oscuro y centro oscuro.
    for (const [r, c] of [
      [0, 0],
      [0, n - 7],
      [n - 7, 0],
    ]) {
      for (let i = 0; i < 7; i++) {
        expect(m[r][c + i]).toBe(true)
        expect(m[r + 6][c + i]).toBe(true)
        expect(m[r + i][c]).toBe(true)
        expect(m[r + i][c + 6]).toBe(true)
      }
      expect(m[r + 3][c + 3]).toBe(true)
      expect(m[r + 1][c + 1]).toBe(false)
    }
  })

  it('el mismo texto da siempre el mismo código y textos distintos dan códigos distintos', () => {
    expect(qrModules('https://a.example/')).toEqual(qrModules('https://a.example/'))
    expect(qrModules('https://a.example/')).not.toEqual(qrModules('https://b.example/'))
  })

  it('el trazo deja 4 módulos de margen y solo dibuja cuadros oscuros', () => {
    const m = qrModules('https://tablero.vercel.app/')
    const { path, size } = qrPath(m)
    expect(size).toBe(m.length + 8)
    const dark = m.flat().filter(Boolean).length
    expect(path.match(/M/g)).toHaveLength(dark)
    expect(path.startsWith('M4 4')).toBe(true)
  })
})
