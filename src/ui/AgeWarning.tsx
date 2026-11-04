import { useGame } from '../store/gameStore'
import { Button } from './Button'

/** Hito 3.2. Aparece cada vez que se abre la app. */
export function AgeWarning() {
  const confirmAge = useGame((s) => s.confirmAge)
  const denyAge = useGame((s) => s.denyAge)

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-4">
      <h1 className="text-3xl font-bold">Tablero</h1>
      <section
        aria-labelledby="warning-title"
        className="flex flex-col gap-3 rounded-2xl bg-zinc-900 p-5"
      >
        <h2 id="warning-title" className="text-xl font-semibold text-amber-300">
          Solo para mayores de 18 años
        </h2>
        <p>Este juego incluye retos y acciones relacionadas con el alcohol y de índole sexual.</p>
        <p>
          Si bebes, hazlo con moderación y no conduzcas. Nadie está obligado a hacer algo con lo que
          no se sienta cómodo.
        </p>
      </section>
      <div className="flex flex-col gap-3">
        <Button onClick={confirmAge}>Tengo 18 años o más</Button>
        <Button variant="secondary" onClick={denyAge}>
          Soy menor de edad
        </Button>
      </div>
    </main>
  )
}

export function AgeDenied() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-3 p-4">
      <h1 className="text-2xl font-bold">Acceso no permitido</h1>
      <p>Este juego es solo para mayores de 18 años. Cierra esta página.</p>
    </main>
  )
}
