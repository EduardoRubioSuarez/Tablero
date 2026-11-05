import { useRef, useState } from 'react'
import { CELLS_PER_LAP, MAX_PLAYERS, MIN_PLAYERS } from '../engine'
import { useGame } from '../store/gameStore'
import { Button } from './Button'
import { useModal } from './useModal'

/** Hito 3.9. Sacar y agregar jugadores durante la partida. */
export function PlayersModal() {
  const open = useGame((s) => s.playersOpen)
  const game = useGame((s) => s.game)
  const error = useGame((s) => s.error)
  const close = useGame((s) => s.closePlayers)
  const add = useGame((s) => s.addPlayer)
  const remove = useGame((s) => s.removePlayer)
  const endGame = useGame((s) => s.endGame)
  const [name, setName] = useState('')
  const [confirmingEnd, setConfirmingEnd] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  const closeAndReset = () => {
    setName('')
    setConfirmingEnd(false)
    close()
  }
  useModal(open, closeAndReset, closeRef)

  if (!open || !game) return null

  const canChange = game.phase === 'roll'
  const canRemove = canChange && game.players.length > MIN_PLAYERS
  const duplicate = game.players.some(
    (p) => p.name.toLocaleLowerCase('es') === name.trim().toLocaleLowerCase('es'),
  )
  const canAdd =
    canChange && game.players.length < MAX_PLAYERS && name.trim().length > 0 && !duplicate

  function submit() {
    if (!canAdd) return
    add(name)
    setName('')
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Jugadores"
      className="anim-pantalla fondo-mesa fixed inset-0 z-50 flex flex-col"
    >
      <div className="mx-auto flex w-full max-w-md items-center justify-between p-4">
        <h2 className="font-display text-xl text-sol-400">Jugadores</h2>
        <Button ref={closeRef} variant="secondary" onClick={closeAndReset}>
          Cerrar
        </Button>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 overflow-y-auto px-4 pb-8">
        {!canChange && (
          <p
            role="status"
            className="rounded-xl bg-white/10 ring-1 ring-white/10 p-3 text-sm text-sol-300"
          >
            Solo se puede cambiar la lista antes de tirar el dado. Termina esta jugada primero.
          </p>
        )}

        <ol className="flex flex-col gap-2">
          {game.players.map((player, index) => (
            <li
              key={player.id}
              className="flex items-center gap-3 rounded-xl bg-white/10 ring-1 ring-white/10 p-3"
            >
              <span className="w-6 text-right text-sm text-lila/80">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {player.name}
                  {index === game.turn && (
                    <span className="ml-2 text-xs text-sol-300">en turno</span>
                  )}
                </p>
                <p className="text-xs text-lila">
                  Vuelta {player.lap} ·{' '}
                  {player.position === 0
                    ? 'salida'
                    : `casilla ${player.position} de ${CELLS_PER_LAP}`}
                </p>
              </div>
              <Button
                variant="ghost"
                aria-label={`Sacar a ${player.name}`}
                onClick={() => {
                  remove(player.id)
                  // El botón desaparece al sacar la fila: se devuelve el foco al panel.
                  closeRef.current?.focus()
                }}
                disabled={!canRemove}
              >
                Sacar
              </Button>
            </li>
          ))}
        </ol>

        {game.players.length <= MIN_PLAYERS && (
          <p className="text-xs text-lila/80">Debe quedar al menos {MIN_PLAYERS} jugadores.</p>
        )}

        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <label htmlFor="new-player" className="font-display">
            Agregar jugador
          </label>
          <p className="text-xs text-lila">
            Entra al final del orden de turnos y empieza en la salida de la vuelta donde está la
            mayoría.
          </p>
          {duplicate && (
            <p role="status" className="text-xs text-sol-300">
              Ya hay un jugador con ese nombre.
            </p>
          )}
          <div className="flex gap-2">
            <input
              id="new-player"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre"
              maxLength={30}
              autoComplete="off"
              disabled={!canChange || game.players.length >= MAX_PLAYERS}
              className="min-h-12 min-w-0 flex-1 rounded-xl bg-white/12 px-3 text-base text-white ring-1 ring-white/20 placeholder:text-white/50  disabled:opacity-50"
            />
            <Button type="submit" disabled={!canAdd}>
              Agregar
            </Button>
          </div>
        </form>

        {error && (
          <p role="alert" className="text-sm text-sol-300">
            {error}
          </p>
        )}

        <section
          aria-labelledby="end-title"
          className="mt-2 flex flex-col gap-2 border-t border-white/15 pt-4"
        >
          <h3 id="end-title" className="font-display">
            Terminar partida
          </h3>
          {confirmingEnd ? (
            <div
              role="alertdialog"
              aria-label="Confirmar fin de la partida"
              className="flex flex-col gap-2 rounded-xl bg-white/10 p-3 ring-1 ring-white/15"
            >
              <p className="text-sm">
                Se mostrará la tabla de posiciones como van y la partida ya no se podrá continuar.
              </p>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={endGame}>
                  Sí, terminar
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setConfirmingEnd(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs text-lila">
                Acaba el juego sin que nadie llegue a la meta y muestra las posiciones actuales.
              </p>
              <Button variant="secondary" onClick={() => setConfirmingEnd(true)}>
                Terminar partida
              </Button>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
