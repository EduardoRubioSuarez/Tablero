/**
 * Generador de números aleatorios con semilla (mulberry32).
 *
 * Todo el azar del motor pasa por aquí para que las partidas y las pruebas sean
 * reproducibles. El único punto no determinista es `generateSeed`, que debe llamarse
 * solo desde la capa de interfaz al crear una partida.
 */
export type Rng = {
  /** Número decimal en [0, 1). */
  next(): number
  /** Entero en [0, maxExclusive). */
  int(maxExclusive: number): number
  /** Estado interno actual; se guarda para poder continuar la secuencia. */
  readonly state: number
}

/** Crea un generador a partir de una semilla o de un estado guardado. */
export function makeRng(seed: number): Rng {
  let state = seed >>> 0

  function next(): number {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  return {
    next,
    int(maxExclusive: number): number {
      if (!Number.isInteger(maxExclusive) || maxExclusive <= 0) {
        throw new RangeError(`maxExclusive debe ser un entero positivo, recibido ${maxExclusive}`)
      }
      return Math.floor(next() * maxExclusive)
    },
    get state() {
      return state
    },
  }
}

/** Baraja una copia del arreglo (Fisher-Yates). No modifica el original. */
export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const result = items.slice()
  for (let i = result.length - 1; i > 0; i--) {
    const j = rng.int(i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/** Semilla nueva e impredecible. Única función no determinista del motor. */
export function generateSeed(): number {
  const buffer = new Uint32Array(1)
  crypto.getRandomValues(buffer)
  return buffer[0]
}
