const COLORS = ['#ffd21f', '#ff4f8b', '#3ad6ff', '#6fe07a', '#ffffff']

type Piece = {
  left: number
  width: number
  height: number
  color: string
  round: boolean
  duration: number
  delay: number
  sway: number
  turn: number
  top: number
}

/** Piezas del confeti. Es determinista: la misma semilla da siempre el mismo reparto. */
function confettiPieces(seed: number, count = 22): Piece[] {
  let s = seed % 233280
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
  return Array.from({ length: count }, (_, i) => {
    const width = 5 + Math.round(rnd() * 5)
    const duration = 9 + rnd() * 7
    return {
      left: rnd() * 96,
      width,
      height: i % 3 === 0 ? width : Math.max(4, width - 3),
      color: COLORS[i % COLORS.length],
      round: i % 3 === 0,
      duration,
      delay: -rnd() * duration,
      sway: Math.round(rnd() * 50 - 25),
      turn: Math.round(300 + rnd() * 500),
      top: Math.round(rnd() * 60),
    }
  })
}

/**
 * Hito 4.7. Confeti que cae despacio por toda la pantalla. Va por encima de la tarjeta y por
 * debajo del botón principal. Con "reducir movimiento" las piezas se quedan quietas.
 */
export function Confeti({ seed = 7 }: { seed?: number }) {
  return (
    <div
      aria-hidden="true"
      className="confeti pointer-events-none fixed inset-0 z-20 overflow-hidden"
    >
      {confettiPieces(seed).map((p, i) => (
        <i
          key={i}
          className={p.round ? 'r' : ''}
          style={
            {
              left: `${p.left}%`,
              width: p.width,
              height: p.height,
              background: p.color,
              '--d': `${p.duration.toFixed(1)}s`,
              '--l': `${p.delay.toFixed(1)}s`,
              '--sx': `${p.sway}px`,
              '--rt': `${p.turn}deg`,
              '--top': `${p.top}%`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
