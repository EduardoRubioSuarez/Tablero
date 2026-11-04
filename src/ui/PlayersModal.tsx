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
  const [name, setName] = useState('')
  const closeRef = useRef<HTMLButtonElement>(null)

  const closeAndReset = () => {
    setName('')
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
      className="fixed inset-0 z-50 flex flex-col bg-zinc-950"
    >
      <div className="mx-auto flex w-full max-w-md items-center justify-between p-4">
        <h2 className="text-xl font-bold">Jugadores</h2>
        <Button ref={closeRef} variant="secondary" onClick={closeAndReset}>
          Cerrar
        </Button>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 overflow-y-auto px-4 pb-8">
        {!canChange && (
          <p role="status" className="rounded-xl bg-zinc-900 p-3 text-sm text-amber-300">
            Solo se puede cambiar la lista antes de tirar el dado. Termina esta jugada primero.
          </p>
        )}

        <ol className="flex flex-col gap-2">
          {game.players.map((player, index) => (
            <li key={player.id} className="flex items-center gap-3 rounded-xl bg-zinc-900 p-3">
              <span className="w-6 text-right text-sm text-zinc-500">{index + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {player.name}
                  {index === game.turn && (
                    <span className="ml-2 text-xs text-amber-300">en turno</span>
                  )}
                </p>
                <p className="text-xs text-zinc-400">
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
          <p className="text-xs text-zinc-500">Debe quedar al menos {MIN_PLAYERS} jugadores.</p>
        )}

        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <label htmlFor="new-player" className="font-semibold">
            Agregar jugador
          </label>
          <p className="text-xs text-zinc-400">
            Entra al final del orden de turnos y empieza en la salida de la vuelta donde está la
            mayoría.
          </p>
          {duplicate && (
            <p role="status" className="text-xs text-amber-300">
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
              className="min-h-12 min-w-0 flex-1 rounded-xl bg-zinc-800 px-3 text-base text-zinc-50 placeholder:text-zinc-500 focus-visible:outline-2 focus-visible:outline-amber-300 disabled:opacity-50"
            />
            <Button type="submit" disabled={!canAdd}>
              Agregar
            </Button>
          </div>
        </form>

        {error && (
          <p role="alert" className="text-sm text-amber-300">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
