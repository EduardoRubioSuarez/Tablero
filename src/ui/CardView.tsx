import { useEffect, type CSSProperties } from 'react'
import type { ActionKind } from '../content'
import type { Game } from '../engine'
import { useGame } from '../store/gameStore'
import { Button } from './Button'
import { Confeti } from './Confeti'
import { signal } from './feedback'
import { ActionIcon } from './icons'

/** Color de los rayos y del listón según el tipo de acción. */
const TONES: Record<ActionKind, { r1: string; r2: string; rc: string; rd: string }> = {
  drink: { r1: '#ffe25a', r2: '#ffc400', rc: '#ffd21f', rd: '#d9a800' },
  dare: { r1: '#ffc2d6', r2: '#ff8fb4', rc: '#ff7aa8', rd: '#d8386f' },
  truth: { r1: '#c8f3ff', r2: '#3ad6ff', rc: '#6fe0ff', rd: '#1aa6cf' },
  movement: { r1: '#ffc2d6', r2: '#ff8fb4', rc: '#ff7aa8', rd: '#d8386f' },
}

/** Frase que explica el efecto de la tarjeta, si lo tiene. */
function effectHint(game: Game): string | null {
  const effect = game.currentCard?.action.effect
  if (!effect) return null
  if (game.winnerId !== null) return 'Como ya ganaste, este efecto no se aplica.'
  if (effect.type === 'back') return `Al continuar, retrocedes ${effect.steps} casillas.`
  return 'Al continuar, vuelves a la salida de esta vuelta.'
}

/** Tamaño de la letra según el largo del texto, para que la tarjeta no cambie de tamaño. */
function textSize(text: string): string {
  if (text.length <= 36) return 'text-2xl'
  if (text.length <= 70) return 'text-xl'
  return 'text-lg'
}

function Stars({ count }: { count: number }) {
  return (
    <span className="flex items-center justify-center gap-1.5" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" className="size-4">
          <path
            className="ic-o"
            fill="#ffd21f"
            strokeWidth="2.4"
            d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"
          />
        </svg>
      ))}
    </span>
  )
}

/**
 * Hitos 3.5 y 4.7. Tarjeta "Estallido": medalla con rayos y la ilustración de la acción, listón
 * de estrellas, texto y confeti que cae despacio. Todas miden lo mismo. No muestra el número de
 * casilla ni el tipo de acción; solo un botón "Continuar".
 */
export function CardView({ game, onContinue }: { game: Game; onContinue: () => void }) {
  const card = game.currentCard
  const sound = useGame((s) => s.sound)
  const vibration = useGame((s) => s.vibration)
  const winnerId = game.winnerId
  const effect = card?.action.effect

  // Una señal cada vez que aparece una tarjeta nueva.
  const key = card ? `${card.position}:${card.viaEffect}:${game.rngState}` : ''
  useEffect(() => {
    if (!key) return
    // La fanfarria del ganador suena en la pantalla final, al pulsar Continuar.
    signal(winnerId === null && effect ? 'move' : 'card', { sound, vibration })
    // Solo cuando cambia la tarjeta, no cuando cambian los ajustes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  if (!card) return null
  const player = game.players[game.turn]
  const winner = winnerId !== null ? player : null
  const hint = effectHint(game)
  const tone = TONES[card.action.kind]
  const style = {
    '--r1': tone.r1,
    '--r2': tone.r2,
    '--rc': tone.rc,
    '--rd': tone.rd,
  } as CSSProperties

  return (
    <>
      <Confeti seed={card.position * 13 + game.turn} />
      <section
        key={key}
        aria-label={`Tarjeta de la casilla ${card.position}`}
        style={style}
        className="anim-carta puntos canto-carta relative flex min-h-0 flex-1 flex-col items-center gap-3 rounded-[20px] border-[3px] border-ink short:gap-2 short:pt-4 short:pb-3 tiny:gap-1.5 tiny:pt-3 px-3.5 pt-5 pb-4 text-ink before:pointer-events-none before:absolute before:inset-1.5 before:rounded-[14px] before:border-2 before:border-dashed before:border-sol-500 before:content-['']"
      >
        {winner && (
          <p
            role="status"
            className="z-10 rounded-full border-2 border-ink bg-sol-400 px-4 py-1 text-center text-sm font-extrabold"
          >
            ¡{winner.name} llegó a la meta!
          </p>
        )}

        <div className="short:size-28 tiny:size-24 relative mt-1 size-36 shrink-0 overflow-hidden rounded-full border-[3px] border-ink shadow-[0_0_0_5px_#fff,0_0_0_8px_#0f1f5c]">
          <div className="rayos anim-rayos absolute inset-0 rounded-full" />
          <ActionIcon
            actionId={card.action.id}
            kind={card.action.kind}
            className="absolute inset-[14%] size-[72%]"
          />
        </div>

        <div className="liston -mt-1" aria-hidden="true">
          <Stars count={3} />
        </div>

        <p
          className={`font-display flex min-h-0 flex-1 items-center text-center leading-[1.15] text-balance break-words ${textSize(card.action.text)}`}
        >
          {card.action.text}
        </p>

        {card.viaEffect && (
          <p className="z-10 rounded-lg bg-ink/10 px-3 py-1.5 text-center text-sm font-semibold">
            Retrocediste a esta casilla.
          </p>
        )}
        {hint && (
          <p className="z-10 rounded-lg bg-ink/10 px-3 py-1.5 text-center text-sm font-semibold">
            {hint}
          </p>
        )}
        <div className="tiny:hidden">
          <Stars count={3} />
        </div>
      </section>
      <div className="relative z-30">
        <Button onClick={onContinue} className="tiny:min-h-12 min-h-14 w-full text-lg">
          Continuar
        </Button>
      </div>
    </>
  )
}
