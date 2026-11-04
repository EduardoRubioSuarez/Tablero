import { MAX_LAPS, MAX_PLAYERS, MIN_LAPS, MIN_PLAYERS } from '../engine'
import { useGame } from '../store/gameStore'
import { validateSetup } from '../store/setup'
import { Button } from './Button'

/** Hito 3.3. Número de vueltas y jugadores en el orden en que están sentados. */
export function Setup() {
  const draft = useGame((s) => s.draft)
  const error = useGame((s) => s.error)
  const setDraft = useGame((s) => s.setDraft)
  const startGame = useGame((s) => s.startGame)
  const goHome = useGame((s) => s.goHome)

  const { names, laps } = draft
  const problems = validateSetup(draft)

  function setName(index: number, value: string) {
    setDraft({ ...draft, names: names.map((n, i) => (i === index ? value : n)) })
  }
  function addPlayer() {
    if (names.length < MAX_PLAYERS) setDraft({ ...draft, names: [...names, ''] })
  }
  function removePlayer(index: number) {
    setDraft({ ...draft, names: names.filter((_, i) => i !== index) })
  }
  function move(index: number, delta: -1 | 1) {
    const target = index + delta
    if (target < 0 || target >= names.length) return
    const next = names.slice()
    ;[next[index], next[target]] = [next[target], next[index]]
    setDraft({ ...draft, names: next })
  }
  function setLaps(value: number) {
    setDraft({ ...draft, laps: Math.min(MAX_LAPS, Math.max(MIN_LAPS, value)) })
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Nueva partida</h1>
        <Button variant="ghost" onClick={goHome}>
          Volver
        </Button>
      </header>

      <section
        aria-labelledby="laps-title"
        className="flex items-center justify-between rounded-2xl bg-zinc-900 p-4"
      >
        <h2 id="laps-title" className="font-semibold">
          Vueltas al tablero
        </h2>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            aria-label="Menos vueltas"
            onClick={() => setLaps(laps - 1)}
            disabled={laps <= MIN_LAPS}
          >
            −
          </Button>
          <output
            aria-live="polite"
            aria-label="Vueltas"
            className="w-8 text-center text-2xl font-bold"
          >
            {laps}
          </output>
          <Button
            variant="secondary"
            aria-label="Más vueltas"
            onClick={() => setLaps(laps + 1)}
            disabled={laps >= MAX_LAPS}
          >
            +
          </Button>
        </div>
      </section>

      <section aria-labelledby="players-title" className="flex flex-col gap-3">
        <h2 id="players-title" className="font-semibold">
          Jugadores
        </h2>
        <p className="rounded-xl bg-zinc-900 p-3 text-sm text-zinc-300">
          Agrégalos <strong>en el orden en que están sentados</strong>: las tarjetas hablan de la
          izquierda, la derecha y el de enfrente, y el turno sigue este orden.
        </p>

        <ol className="flex flex-col gap-2">
          {names.map((name, index) => (
            <li key={index} className="flex items-center gap-2">
              <span className="w-6 text-right text-sm text-zinc-500">{index + 1}</span>
              <input
                value={name}
                onChange={(e) => setName(index, e.target.value)}
                placeholder={`Jugador ${index + 1}`}
                aria-label={`Nombre del jugador ${index + 1}`}
                maxLength={30}
                autoComplete="off"
                className="min-h-12 min-w-0 flex-1 rounded-xl bg-zinc-800 px-3 text-base text-zinc-50 placeholder:text-zinc-500 focus-visible:outline-2 focus-visible:outline-amber-300"
              />
              <Button
                variant="ghost"
                className="px-3"
                aria-label={`Subir a ${name || `jugador ${index + 1}`}`}
                onClick={() => move(index, -1)}
                disabled={index === 0}
              >
                ↑
              </Button>
              <Button
                variant="ghost"
                className="px-3"
                aria-label={`Bajar a ${name || `jugador ${index + 1}`}`}
                onClick={() => move(index, 1)}
                disabled={index === names.length - 1}
              >
                ↓
              </Button>
              <Button
                variant="ghost"
                className="px-3"
                aria-label={`Quitar a ${name || `jugador ${index + 1}`}`}
                onClick={() => removePlayer(index)}
                disabled={names.length <= MIN_PLAYERS}
              >
                ✕
              </Button>
            </li>
          ))}
        </ol>

        <Button variant="secondary" onClick={addPlayer} disabled={names.length >= MAX_PLAYERS}>
          Agregar jugador
        </Button>
      </section>

      {(problems[0] ?? error) && (
        <p role="alert" className="text-sm text-amber-300">
          {problems[0] ?? error}
        </p>
      )}

      <Button onClick={startGame} disabled={problems.length > 0} className="mt-auto">
        Empezar partida
      </Button>
    </main>
  )
}
