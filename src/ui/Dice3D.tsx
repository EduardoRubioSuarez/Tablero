import { FACE_ROTATION, PIPS } from './diceFaces'

function Face({ n }: { n: number }) {
  return (
    <div className={`dado-cara c${n}`}>
      {Array.from({ length: 9 }, (_, i) => (
        <i key={i} className={PIPS[n].includes(i) ? 'on' : ''} />
      ))}
    </div>
  )
}

/**
 * Hito 4.6. Dado en 3D. Con `rolling` da vueltas hasta quedar con `value` de frente; sin valor
 * se queda de reposo mostrando tres caras.
 */
export function Dice3D({ value, rolling }: { value: number | null; rolling: boolean }) {
  const [x, y] = value ? FACE_ROTATION[value] : [0, 0]
  const spin = rolling ? 720 : 0
  return (
    <div className="dado-escena" aria-hidden="true">
      <div className={rolling ? '' : 'anim-flota'}>
        <div className="dado-inclina">
          <div
            className="dado"
            style={{ transform: `rotateX(${x + spin}deg) rotateY(${y + spin}deg)` }}
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Face key={n} n={n} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
