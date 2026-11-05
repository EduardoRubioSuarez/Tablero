import { LOGO_T, LOGO_WORD } from './logoPaths'

/** Confeti del logo: x, y, giro (o "o" si es un punto) y color, en el cuadro de 100 × 100 de la T. */
const CONFETTI: Array<[number, number, number | 'o', string]> = [
  [14, 22, 30, '#ff4f8b'],
  [28, 10, -20, '#3ad6ff'],
  [50, 6, 'o', '#6fe07a'],
  [72, 12, 40, '#ffffff'],
  [88, 26, -30, '#ff9f1c'],
  [8, 48, 'o', '#3ad6ff'],
  [93, 50, 20, '#ff4f8b'],
  [14, 72, -40, '#6fe07a'],
  [88, 74, 'o', '#ff9f1c'],
  [28, 92, 20, '#3ad6ff'],
  [72, 92, -30, '#ffffff'],
  [50, 97, 'o', '#ff4f8b'],
  [6, 88, 10, '#ff9f1c'],
  [95, 90, -10, '#6fe07a'],
]

/** Capas del canto (la sombra sólida de abajo) de la T y de la palabra. */
const CANTO_T = [7, 6, 5, 4, 3, 2, 1]
const CANTO_WORD = [5, 4, 3, 2, 1]

/**
 * Logo de Tablero: la T amarilla con canto rodeada de confeti y el nombre debajo. Es un dibujo
 * (los trazos salen de la fuente Titan One), así que no necesita cargar ninguna fuente.
 */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 200" aria-hidden="true" className={className}>
      <g transform="translate(90 6) scale(1.2)">
        {CONFETTI.map(([x, y, turn, color], i) =>
          turn === 'o' ? (
            <circle key={i} cx={x} cy={y} r={2.4} fill={color} />
          ) : (
            <rect
              key={i}
              x={x - 3.4}
              y={y - 1.8}
              width={6.8}
              height={3.6}
              rx={1}
              fill={color}
              transform={`rotate(${turn} ${x} ${y})`}
            />
          ),
        )}
        <g fill="#a87e00">
          {CANTO_T.map((i) => (
            <path key={i} d={LOGO_T} transform={`translate(0 ${(i * 1.1).toFixed(1)})`} />
          ))}
        </g>
        <path d={LOGO_T} fill="#ffd21f" />
      </g>
      <g fill="#a87e00">
        {CANTO_WORD.map((i) => (
          <path key={i} d={LOGO_WORD} transform={`translate(0 ${i})`} />
        ))}
      </g>
      <path d={LOGO_WORD} fill="#ffd21f" />
    </svg>
  )
}
