import { useGame } from '../store/gameStore'
import { Button } from './Button'
import { Logo } from './Logo'

/** Hito 3.2. Aparece cada vez que se abre la app. */
export function AgeWarning() {
  const confirmAge = useGame((s) => s.confirmAge)
  const denyAge = useGame((s) => s.denyAge)

  return (
    <main className="anim-pantalla mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 p-4">
      <h1 className="mx-auto w-full max-w-56">
        <span className="sr-only">Tablero</span>
        <Logo className="w-full" />
      </h1>
      <section
        aria-labelledby="warning-title"
        className="flex flex-col gap-3 rounded-2xl bg-white/10 ring-1 ring-white/10 p-5"
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="font-display grid size-14 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-white text-xl text-ink shadow-[0_3px_0_#aab7f0]"
          >
            +18
          </span>
          <h2 id="warning-title" className="font-display text-xl text-sol-300">
            Solo para mayores de 18 años
          </h2>
        </div>
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
      <h1 className="font-display text-3xl text-sol-400">Acceso no permitido</h1>
      <p>Este juego es solo para mayores de 18 años. Cierra esta página.</p>
    </main>
  )
}
