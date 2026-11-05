import { useEffect, useRef, useState } from 'react'
import type { Player } from '../../engine'
import { walkPath, type Spot } from './geometry'

/** Tiempo entre un paso y el siguiente de una ficha, en milisegundos. */
export const STEP_MS = 110

/**
 * Hito 4.6. Posición que se dibuja de cada ficha. Cuando una ficha avanza pocas casillas camina
 * una por una; un retroceso o volver a la salida salta directo. Con `instant` no hay pasos.
 */
export function useWalkingSpots(players: Player[], instant = false): ReadonlyMap<string, Spot> {
  const [shown, setShown] = useState<ReadonlyMap<string, Spot>>(
    () => new Map(players.map((p) => [p.id, { lap: p.lap, position: p.position }])),
  )
  const latest = useRef(shown)
  const queues = useRef(new Map<string, Spot[]>())
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    latest.current = shown
  })

  useEffect(() => {
    const map = new Map(latest.current)
    const waiting = queues.current
    let changed = false

    const ids = new Set(players.map((p) => p.id))
    for (const id of [...map.keys()]) {
      if (!ids.has(id)) {
        map.delete(id)
        waiting.delete(id)
        changed = true
      }
    }

    for (const p of players) {
      const target: Spot = { lap: p.lap, position: p.position }
      const current = map.get(p.id)
      if (!current) {
        map.set(p.id, target)
        changed = true
      } else if (current.lap === target.lap && current.position === target.position) {
        waiting.delete(p.id)
      } else {
        const path = instant ? null : walkPath(current, target)
        if (path && path.length > 0) {
          waiting.set(p.id, path)
        } else {
          map.set(p.id, target)
          waiting.delete(p.id)
          changed = true
        }
      }
    }

    if (changed) {
      latest.current = map
      setShown(map)
    }

    if (waiting.size > 0 && timer.current === null) {
      timer.current = setInterval(() => {
        const stepped = new Map(latest.current)
        for (const [id, path] of waiting) {
          const next = path.shift()
          if (next) stepped.set(id, next)
          if (path.length === 0) waiting.delete(id)
        }
        latest.current = stepped
        setShown(stepped)
        if (waiting.size === 0 && timer.current !== null) {
          clearInterval(timer.current)
          timer.current = null
        }
      }, STEP_MS)
    }
  }, [players, instant])

  useEffect(
    () => () => {
      if (timer.current !== null) clearInterval(timer.current)
      timer.current = null
    },
    [],
  )

  return shown
}
