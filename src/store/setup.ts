import { MAX_LAPS, MAX_PLAYERS, MIN_LAPS, MIN_PLAYERS } from '../engine'

export type SetupDraft = {
  /** Nombres en el orden en que están sentados. */
  names: string[]
  laps: number
}

export const DEFAULT_SETUP: SetupDraft = { names: ['', ''], laps: 1 }

/** Devuelve la lista de problemas de la configuración (vacía si se puede empezar). */
export function validateSetup(draft: SetupDraft): string[] {
  const problems: string[] = []
  const filled = draft.names.map((n) => n.trim()).filter((n) => n.length > 0)

  const seen = new Set<string>()
  for (const name of filled) {
    const key = name.toLocaleLowerCase('es')
    if (seen.has(key)) {
      problems.push(`Hay dos jugadores llamados "${name}"; usa nombres distintos`)
      break
    }
    seen.add(key)
  }
  if (filled.length < MIN_PLAYERS) problems.push(`Agrega al menos ${MIN_PLAYERS} jugadores`)
  if (draft.names.length > MAX_PLAYERS) problems.push(`Máximo ${MAX_PLAYERS} jugadores`)
  if (!Number.isInteger(draft.laps) || draft.laps < MIN_LAPS) {
    problems.push(`Elige al menos ${MIN_LAPS} vuelta`)
  } else if (draft.laps > MAX_LAPS) {
    problems.push(`Máximo ${MAX_LAPS} vueltas`)
  }
  return problems
}

/** Nombres listos para crear la partida: sin espacios sobrantes y sin filas vacías. */
export function cleanNames(names: readonly string[]): string[] {
  return names.map((n) => n.trim()).filter((n) => n.length > 0)
}
