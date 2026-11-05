import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { getRanking, type Game } from '../../engine'
import { useGame } from '../../store/gameStore'
import { Button } from '../Button'
import { prefersReducedMotion } from '../feedback'
import { useModal } from '../useModal'
import { Board3D } from './Board3D'
import { FINISH_ROW, MAP_ROWS, clampPan, playerColor, rowOf } from './geometry'
import { ProgressStrip } from './ProgressStrip'
import { useWalkingSpots } from './useWalkingSpots'

/** Inclinación del tablero con la cámara siguiendo a un jugador, y al verlo todo. */
const FOLLOW_TILT = 54
const ALL_TILT = 16
const ALL_SCALE = 0.94
/** Margen bajo la fila de la meta, en píxeles. */
const BOTTOM_PAD = 30

/** Hitos 4.3 a 4.5. Panel del mapa: se abre desde el botón Mapa y no cambia el estado de la partida. */
export function MapView() {
  const open = useGame((s) => s.mapOpen)
  const game = useGame((s) => s.game)
  const close = useGame((s) => s.closeMap)
  if (!open || !game) return null
  return <MapDialog game={game} onClose={close} />
}

function MapDialog({ game, onClose }: { game: Game; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useModal(true, onClose, closeRef)

  const instant = useMemo(() => prefersReducedMotion(), [])
  const spots = useWalkingSpots(game.players, instant)
  const turnId = game.players[game.turn].id

  const [all, setAll] = useState(false)
  const [focusId, setFocusId] = useState(turnId)
  /** Desplazamiento puesto con el dedo. Mientras exista, la cámara no se mueve sola. */
  const [manual, setManual] = useState<number | null>(null)
  const [dragging, setDragging] = useState(false)
  const [hintSeen, setHintSeen] = useState(false)
  const [viewHeight, setViewHeight] = useState(300)
  const [rows, setRows] = useState<{ follow: number[]; all: number[] }>({ follow: [], all: [] })

  const viewRef = useRef<HTMLDivElement>(null)
  const panRef = useRef<HTMLDivElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ y: number; start: number } | null>(null)

  const focusPlayer = game.players.find((p) => p.id === focusId) ?? game.players[game.turn]
  const focusSpot = spots.get(focusPlayer.id) ?? {
    lap: focusPlayer.lap,
    position: focusPlayer.position,
  }

  /**
   * Mide, con el tablero en cada inclinación, dónde queda el centro de cada fila respecto a la
   * ventana. Con eso la cámara sabe cuánto desplazarse para centrar a un jugador.
   */
  const measure = useCallback(() => {
    const view = viewRef.current
    const pan = panRef.current
    const board = boardRef.current
    if (!view || !pan || !board) return
    const previousPan = pan.style.transform
    const previousBoard = board.style.transform
    pan.style.transition = 'none'
    board.style.transition = 'none'
    pan.style.transform = 'none'
    const top = view.getBoundingClientRect().top
    const collect = (tilt: number) => {
      board.style.transform = `rotateX(${tilt}deg)`
      return Array.from({ length: MAP_ROWS }, (_, row) => {
        const el = board.querySelector(`[data-row="${row}"]`)
        if (!el) return 0
        const box = el.getBoundingClientRect()
        return box.top + box.height / 2 - top
      })
    }
    const measured = { follow: collect(FOLLOW_TILT), all: collect(ALL_TILT) }
    board.style.transform = previousBoard
    pan.style.transform = previousPan
    void board.offsetHeight
    pan.style.transition = ''
    board.style.transition = ''
    setViewHeight(view.clientHeight)
    setRows(measured)
  }, [])

  useLayoutEffect(() => {
    measure()
    const view = viewRef.current
    if (!view || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => measure())
    observer.observe(view)
    return () => observer.disconnect()
  }, [measure])

  const rowY = all ? rows.all : rows.follow
  const scale = all ? ALL_SCALE : 1
  const bottom = (rowY[FINISH_ROW] ?? 0) + BOTTOM_PAD
  const automatic = all
    ? 0
    : clampPan(viewHeight / 2 - (rowY[rowOf(focusSpot.position)] ?? 0), viewHeight, bottom, 1)
  const panY = manual !== null ? clampPan(manual, viewHeight, bottom, scale) : automatic

  /** Casillas que enseña la cámara, para el marco de la tira. */
  let range: { from: number; to: number } | null = null
  const visible: number[] = []
  for (let row = 1; row < FINISH_ROW; row++) {
    const y = (rowY[row] ?? 0) * scale + panY
    if (y > 8 && y < viewHeight - 8) visible.push(row)
  }
  if (visible.length > 0) {
    range = { from: (visible[0] - 1) * 6 + 1, to: visible[visible.length - 1] * 6 }
  }

  const moveTo = (y: number) => {
    setManual(clampPan(y, viewHeight, bottom, scale))
    setHintSeen(true)
  }
  // Rueda y teclado: el listener de la rueda no puede ser pasivo para impedir el desplazamiento de la página.
  const panYRef = useRef(panY)
  const moveRef = useRef(moveTo)
  useEffect(() => {
    panYRef.current = panY
    moveRef.current = moveTo
  })
  useEffect(() => {
    const view = viewRef.current
    if (!view) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      moveRef.current(panYRef.current - e.deltaY)
    }
    view.addEventListener('wheel', onWheel, { passive: false })
    return () => view.removeEventListener('wheel', onWheel)
  }, [])

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    drag.current = { y: e.clientY, start: panY }
    setDragging(true)
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // Sin captura el arrastre sigue funcionando dentro de la ventana.
    }
  }
  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (drag.current) moveTo(drag.current.start + e.clientY - drag.current.y)
  }
  function endDrag() {
    drag.current = null
    setDragging(false)
  }

  function focusOn(id: string) {
    setFocusId(id)
    setAll(false)
    setManual(null)
  }
  function toggleAll() {
    setAll((v) => !v)
    setManual(null)
    setHintSeen(false)
  }

  const ranking = getRanking(game)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Mapa"
      className="anim-pantalla fondo-mesa fixed inset-0 z-50 flex flex-col"
    >
      <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col gap-2 px-4 pt-3 pb-4">
        <header className="flex items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-xl text-sol-400">Mapa</h2>
            <p className="text-xs text-lila">
              Vuelta {focusPlayer.lap} de {game.laps}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={all ? 'primary' : 'secondary'}
              aria-pressed={all}
              onClick={toggleAll}
              className="min-h-11 px-4 text-sm"
            >
              Ver todo
            </Button>
            <Button
              ref={closeRef}
              variant="secondary"
              onClick={onClose}
              className="min-h-11 px-4 text-sm"
            >
              Cerrar
            </Button>
          </div>
        </header>

        <ProgressStrip players={game.players} spots={spots} turnId={turnId} range={range} />

        <div
          ref={viewRef}
          tabIndex={0}
          role="group"
          aria-label="Tablero. Arrastra para recorrerlo."
          className="relative min-h-52 flex-1 cursor-grab touch-none overflow-hidden rounded-2xl select-none active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') moveTo(panY - 60)
            else if (e.key === 'ArrowUp') moveTo(panY + 60)
            else return
            e.preventDefault()
          }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-5 bg-linear-to-b from-[#0d2268] to-transparent" />
          <div
            ref={panRef}
            className={`absolute inset-x-0 top-0 origin-top ${
              dragging || instant
                ? ''
                : 'transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)]'
            }`}
            style={{ transform: `translateY(${panY}px) scale(${scale})` }}
          >
            <Board3D
              boardRef={boardRef}
              board={game.board}
              players={game.players}
              spots={spots}
              turnId={turnId}
              focusPosition={focusSpot.position}
              tilt={all ? ALL_TILT : FOLLOW_TILT}
            />
          </div>
          {all && !hintSeen && (
            <p className="pointer-events-none absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-noche/85 px-3 py-1 text-xs font-semibold whitespace-nowrap">
              Desliza para ver el resto
            </p>
          )}
        </div>

        <section
          aria-label="Posiciones"
          className="-mx-1 max-h-[34%] shrink-0 overflow-y-auto px-1 py-1"
        >
          <ol className="flex flex-col gap-1">
            {ranking.map(({ player, rank }) => {
              const selected = player.id === focusPlayer.id
              const where =
                player.id === game.winnerId
                  ? 'Meta'
                  : `Vuelta ${player.lap} · ${player.position === 0 ? 'salida' : `casilla ${player.position}`}`
              return (
                <li key={player.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => focusOn(player.id)}
                    className={`flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-sm ${
                      selected
                        ? 'bg-sol-400/20 ring-2 ring-sol-400'
                        : 'bg-white/10 hover:bg-white/15'
                    }`}
                  >
                    <span className="w-5 text-center font-display text-sol-400">{rank}</span>
                    <span
                      className="size-3.5 shrink-0 rounded-full border-2 border-noche"
                      style={{ background: playerColor(player.id) }}
                    />
                    <span className="min-w-0 flex-1 truncate font-semibold">
                      {player.name}
                      {player.id === turnId && (
                        <span className="ml-2 rounded-md bg-sol-400 px-1.5 py-0.5 text-[10px] font-extrabold text-ink">
                          TURNO
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-xs text-lila tabular-nums">{where}</span>
                  </button>
                </li>
              )
            })}
          </ol>
        </section>
      </div>
    </div>
  )
}
