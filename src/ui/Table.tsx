import { useEffect, useMemo, useRef, useState } from 'react'
import { CELLS_PER_LAP, rollDice } from '../engine'
import { useGame } from '../store/gameStore'
import { Button } from './Button'
import { CardView } from './CardView'
import { Dice3D } from './Dice3D'
import { prefersReducedMotion, signal } from './feedback'
import { ProgressStrip } from './map/ProgressStrip'
import { useWalkingSpots } from './map/useWalkingSpots'
import { useWakeLock } from './useWakeLock'

/** Cuánto dura el dado rodando antes de mostrar la tarjeta (giro más un instante para ver el número). */
const ROLL_MS = 1500

function ToggleButton({
  label,
  on,
  onClick,
  children,
}: {
  label: string
  on: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={on}
      onClick={onClick}
      className={`grid size-11 place-items-center rounded-xl ring-1 ring-inset ${
        on ? 'bg-sol-400 text-ink ring-sol-400' : 'bg-white/12 text-white/70 ring-white/20'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {children}
        {!on && <path d="M4 4l16 16" />}
      </svg>
    </button>
  )
}

/** Hitos 3.4, 4.2, 4.6 y 4.9. Pantalla de turno: jugador en turno, dado en 3D y tarjeta. */
export function Table() {
  const game = useGame((s) => s.game)
  const saveFailed = useGame((s) => s.saveFailed)
  const sound = useGame((s) => s.sound)
  const vibration = useGame((s) => s.vibration)
  const roll = useGame((s) => s.roll)
  const next = useGame((s) => s.next)
  const openRules = useGame((s) => s.openRules)
  const openPlayers = useGame((s) => s.openPlayers)
  const openMap = useGame((s) => s.openMap)
  const toggleSound = useGame((s) => s.toggleSound)
  const toggleVibration = useGame((s) => s.toggleVibration)

  const wake = useWakeLock()
  const instant = useMemo(() => prefersReducedMotion(), [])
  const spots = useWalkingSpots(game?.players ?? [], instant)
  /** Valor del dado mientras rueda; null si está quieto. */
  const [rolling, setRolling] = useState<number | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current)
    },
    [],
  )

  if (!game) return null
  const player = game.players[game.turn]
  const settings = { sound, vibration }

  function handleRoll() {
    if (!game || rolling !== null) return
    // El resultado es el mismo que calculará la partida: el azar sale de la semilla guardada.
    const preview = rollDice(game).lastRoll
    if (instant || preview === null) {
      signal('land', settings)
      roll()
      return
    }
    setRolling(preview)
    signal('roll', settings)
    timer.current = setTimeout(() => {
      roll()
      setRolling(null)
      signal('land', settings)
    }, ROLL_MS)
  }

  return (
    <main className="anim-pantalla tiny:gap-2 tiny:pt-2 tiny:pb-2 mx-auto flex min-h-dvh w-full max-w-md flex-col gap-3 px-4 pt-3 pb-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <p className="font-display text-xl leading-none text-sol-400">TABLERO</p>
          <p className="mt-1 text-xs text-lila">
            Vuelta {player.lap} de {game.laps}
          </p>
        </div>
        <div className="flex gap-2">
          <ToggleButton label="Sonido" on={sound} onClick={toggleSound}>
            <path d="M4 9v6h4l5 4V5L8 9H4z" />
            <path d="M16.5 8.5a5 5 0 0 1 0 7" />
          </ToggleButton>
          <ToggleButton label="Vibración" on={vibration} onClick={toggleVibration}>
            <rect x="8" y="4" width="8" height="16" rx="2" />
            <path d="M4 8v8M20 8v8" />
          </ToggleButton>
        </div>
      </header>

      <ProgressStrip players={game.players} spots={spots} turnId={player.id} />

      {saveFailed && (
        <p role="status" className="rounded-xl bg-white/10 p-3 text-sm text-sol-300">
          No se pudo guardar la partida en este navegador. Puedes seguir jugando, pero no se podrá
          retomar.
        </p>
      )}
      {wake === 'unsupported' && (
        <p role="status" className="rounded-xl bg-white/10 p-3 text-sm text-lila">
          Tu navegador no puede mantener la pantalla encendida. Si se apaga sola, quita el bloqueo
          automático en los ajustes del celular mientras juegas.
        </p>
      )}

      {game.phase === 'roll' ? (
        <section aria-live="polite" className="text-center">
          <p className="text-sm text-lila">Turno de</p>
          <h1 className="font-display text-3xl leading-tight break-words">{player.name}</h1>
          <p className="mt-1 text-sm text-lila">
            {player.position === 0
              ? 'En la salida'
              : `Casilla ${player.position} de ${CELLS_PER_LAP}`}
          </p>
        </section>
      ) : (
        <section
          aria-live="polite"
          className="flex flex-wrap items-baseline justify-center gap-x-3 text-center"
        >
          <h1 className="font-display text-2xl leading-tight break-words">{player.name}</h1>
          <p className="text-sm text-lila">
            Casilla {player.position} de {CELLS_PER_LAP}
          </p>
          {game.lastRoll !== null && (
            <p className="text-sm text-lila">
              Dado: <span className="font-display text-lg text-sol-400">{game.lastRoll}</span>
            </p>
          )}
        </section>
      )}

      {game.phase === 'roll' ? (
        <>
          <div className="flex flex-1 flex-col items-center justify-center py-2">
            <Dice3D value={rolling} rolling={rolling !== null} />
            <div className="dado-sombra" aria-hidden="true" />
          </div>
          <Button
            onClick={handleRoll}
            disabled={rolling !== null}
            aria-busy={rolling !== null}
            className="min-h-20 text-2xl"
          >
            {rolling !== null ? 'Tirando…' : 'Tirar dado'}
          </Button>
        </>
      ) : (
        <CardView game={game} onContinue={next} />
      )}

      <nav aria-label="Más opciones" className="flex gap-2">
        <Button
          variant="secondary"
          onClick={openRules}
          className="tiny:min-h-10 min-h-11 flex-1 px-2 text-sm"
        >
          Reglamento
        </Button>
        <Button
          variant="secondary"
          onClick={openPlayers}
          className="tiny:min-h-10 min-h-11 flex-1 px-2 text-sm"
        >
          Jugadores
        </Button>
        <Button
          variant="secondary"
          onClick={openMap}
          className="tiny:min-h-10 min-h-11 flex-1 px-2 text-sm"
        >
          Mapa
        </Button>
      </nav>
    </main>
  )
}
