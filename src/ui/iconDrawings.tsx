/* oxlint-disable react/only-export-components -- Este archivo solo contiene dibujos; no hay recarga en caliente que cuidar. */
import type { ReactNode } from 'react'

/**
 * Hito 4.2. Ilustraciones de las casillas (docs/guia-de-estilo.md, sección 7): un objeto por
 * acción, contorno azul marino grueso y colores planos, dibujadas como SVG de 64 × 64.
 */

const Y = '#ffd21f'
const P = '#ff4f8b'
const C = '#3ad6ff'
const G = '#6fe07a'
const O = '#ff9f1c'
const B = '#2f6bff'
const W = '#ffffff'
const LB = '#bfe9ff'
const R = '#e53950'
const SKIN = '#ffd9a8'

const o = 'ic-o'
const nf = 'ic-o ic-nf'

/** Insignia amarilla con un texto corto (cantidades, tiempos, interrogaciones). */
function Badge({ cx, cy, r, t, fs }: { cx: number; cy: number; r: number; t: string; fs: number }) {
  return (
    <>
      <circle className={o} cx={cx} cy={cy} r={r} fill={Y} />
      <text className="ic-tx" x={cx} y={cy + fs * 0.36} textAnchor="middle" fontSize={fs}>
        {t}
      </text>
    </>
  )
}

const HEART = 'M32 56C6 38 10 12 24 12C29 12 32 17 32 19C32 17 35 12 40 12C54 12 58 38 32 56Z'
const LIPS_PATH = 'M7 34C12 20 24 20 32 27C40 20 52 20 57 34C50 48 39 52 32 52C25 52 14 48 7 34Z'

function Lips() {
  return (
    <>
      <path className={o} fill={P} d={LIPS_PATH} />
      <path className={nf} d="M8 34C20 39 44 39 56 34" />
      <path className={nf} d="M17 28c3-2 6-2 9 0" stroke="#fff" opacity=".8" />
    </>
  )
}

function Shot() {
  return (
    <>
      <path className={o} fill="#eaf4ff" d="M13 9h38l-5 47H18z" />
      <path className={o} fill={O} d="M15.4 25h33.2l-3.4 31H18.8z" />
      <path className={nf} d="M21 14l3 34" stroke="#fff" strokeWidth="3" opacity=".85" />
      <rect
        className={o}
        x="33"
        y="32"
        width="10"
        height="10"
        rx="2"
        fill={W}
        transform="rotate(14 38 37)"
      />
    </>
  )
}

/** Tarro de cerveza centrado en el origen de su cuadro (ancho 20, alto 32). */
function Mug({ x, y, handle = 'right' }: { x: number; y: number; handle?: 'left' | 'right' }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        className={nf}
        d={
          handle === 'right'
            ? 'M20 8h4a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-4'
            : 'M0 8h-4a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h4'
        }
      />
      <rect className={o} x="0" y="4" width="20" height="30" rx="4" fill="#ffc21a" />
      <circle className={o} cx="4" cy="4" r="4.5" fill={W} />
      <circle className={o} cx="10" cy="2" r="5" fill={W} />
      <circle className={o} cx="16" cy="4" r="4" fill={W} />
    </g>
  )
}

function Heart({ fill = P }: { fill?: string }) {
  return (
    <>
      <path className={o} fill={fill} d={HEART} />
      <path className={nf} d="M17 20c2-3 5-3 7-2" stroke="#fff" strokeWidth="3" opacity=".85" />
    </>
  )
}

function Phone({ children }: { children?: ReactNode }) {
  return (
    <>
      <rect className={o} x="17" y="5" width="30" height="54" rx="7" fill="#2347c9" />
      <rect x="21" y="13" width="22" height="38" rx="2" fill="#bfe0ff" />
      {children}
    </>
  )
}

function Tshirt({ fill }: { fill: string }) {
  return (
    <path className={o} fill={fill} d="M20 8L8 18l6 10 6-4v32h24V24l6 4 6-10L44 8q-12 8-24 0z" />
  )
}

const EyeShape = ({ iris }: { iris: string }) => (
  <>
    <ellipse className={o} cx="18" cy="33" rx="14" ry="11" fill={W} />
    <ellipse className={o} cx="46" cy="33" rx="14" ry="11" fill={W} />
    <circle cx="20" cy="33" r="7" fill={iris} />
    <circle cx="44" cy="33" r="7" fill={iris} />
    <circle cx="20" cy="33" r="3.2" fill="#000" />
    <circle cx="44" cy="33" r="3.2" fill="#000" />
    <circle cx="22.5" cy="30" r="1.8" fill={W} />
    <circle cx="46.5" cy="30" r="1.8" fill={W} />
    <path className={nf} d="M6 18q8-6 16-3M58 18q-8-6-16-3" strokeWidth="3" />
  </>
)

export const ICONS = {
  shot: <Shot />,
  shot3: (
    <>
      <Shot />
      <Badge cx={48} cy={46} r={13} t="3s" fs={14} />
    </>
  ),
  mugs: (
    <>
      <g transform="rotate(-14 21 42)">
        <Mug x={12} y={18} handle="left" />
      </g>
      <g transform="rotate(14 43 42)">
        <Mug x={34} y={18} />
      </g>
    </>
  ),
  mugX: (
    <>
      <Mug x={14} y={12} />
      <circle className={o} cx="44" cy="44" r="15" fill={R} />
      <path className={nf} d="M37 37l14 14M51 37L37 51" stroke="#fff" strokeWidth="5" />
    </>
  ),
  mugQ: (
    <>
      <Mug x={12} y={14} />
      <Badge cx={46} cy={44} r={14} t="?" fs={20} />
    </>
  ),
  mugRight: (
    <>
      <Mug x={8} y={14} />
      <polygon className={o} fill={G} points="36,26 48,26 48,18 62,32 48,46 48,38 36,38" />
    </>
  ),
  mugLeft: (
    <g transform="translate(64 0) scale(-1 1)">
      <Mug x={8} y={14} />
      <polygon className={o} fill={G} points="36,26 48,26 48,18 62,32 48,46 48,38 36,38" />
    </g>
  ),
  chug: (
    <>
      <Mug x={8} y={12} handle="left" />
      <polygon className={o} fill={G} points="42,10 56,10 56,30 62,30 49,50 36,30 42,30" />
    </>
  ),
  lips: <Lips />,
  lips3: (
    <>
      <g transform="translate(-4 -4) scale(.92)">
        <Lips />
      </g>
      <Badge cx={48} cy={48} r={13} t="×3" fs={15} />
    </>
  ),
  lipsPlus4: (
    <>
      <g transform="translate(-4 -4) scale(.92)">
        <Lips />
      </g>
      <Badge cx={48} cy={48} r={13} t="+4" fs={15} />
    </>
  ),
  lipsPlus10: (
    <>
      <g transform="translate(-4 -4) scale(.92)">
        <Lips />
      </g>
      <Badge cx={46} cy={48} r={15} t="+10" fs={14} />
    </>
  ),
  lipsPlus15: (
    <>
      <g transform="translate(-4 -4) scale(.92)">
        <Lips />
      </g>
      <Badge cx={46} cy={48} r={15} t="+15" fs={14} />
    </>
  ),
  lipsQ: (
    <>
      <g transform="translate(-4 -4) scale(.92)">
        <Lips />
      </g>
      <Badge cx={48} cy={48} r={13} t="?" fs={18} />
    </>
  ),
  lipsArrow: (
    <>
      <g transform="translate(-6 14) scale(.72)">
        <Lips />
      </g>
      <path className={nf} d="M30 30Q34 10 52 10" strokeDasharray="4 5" />
      <polygon className={o} fill={Y} points="60,10 50,3 50,17" />
    </>
  ),
  lipsShots: (
    <>
      <g transform="translate(-2 -2) scale(.7)">
        <Lips />
      </g>
      <g transform="translate(24 20) scale(.62)">
        <Shot />
      </g>
    </>
  ),
  iceKiss: (
    <>
      <rect className={o} x="6" y="8" width="36" height="36" rx="7" fill={LB} />
      <path className={nf} d="M14 16l8 0M14 16l0 8" stroke="#fff" strokeWidth="3" />
      <g transform="translate(22 28) scale(.6)">
        <Lips />
      </g>
    </>
  ),
  water: (
    <>
      <rect className={o} x="26" y="6" width="12" height="9" rx="2" fill={B} />
      <path className={o} fill={LB} d="M24 15h16l4 8v29a6 6 0 0 1-6 6H26a6 6 0 0 1-6-6V23z" />
      <path className={nf} d="M20 36c4-3 8 3 12 0s8 3 12 0" stroke={B} />
      <path className={nf} d="M27 24v26" stroke="#fff" strokeWidth="3" opacity=".8" />
    </>
  ),
  back5: (
    <>
      <polygon className={o} fill={P} points="5,30 25,9 25,21 55,21 55,39 25,39 25,51" />
      <Badge cx={45} cy={47} r={14} t="−5" fs={16} />
    </>
  ),
  back10: (
    <>
      <polygon className={o} fill={P} points="5,30 25,9 25,21 55,21 55,39 25,39 25,51" />
      <Badge cx={44} cy={47} r={15} t="−10" fs={13} />
    </>
  ),
  flag: (
    <>
      <g fill="#0f1f5c">
        <rect x="14" y="10" width="10" height="9" />
        <rect x="34" y="10" width="10" height="9" />
        <rect x="24" y="19" width="10" height="9" />
        <rect x="44" y="19" width="10" height="9" />
        <rect x="14" y="28" width="10" height="9" />
        <rect x="34" y="28" width="10" height="9" />
      </g>
      <rect className={nf} x="14" y="10" width="40" height="27" />
      <path className={nf} d="M14 6v52" />
      <path className={o} fill={Y} d="M6 58h18v-4H6z" />
      <path className={nf} d="M42 52c6 0 10-4 10-9" stroke={P} strokeWidth="4" />
      <polygon className={o} fill={P} points="46,38 54,44 44,48" />
    </>
  ),
  phone: (
    <>
      <Phone>
        <path
          className={o}
          fill={P}
          strokeWidth="2.6"
          d="M32 44C21 37 23 25 28.5 25C31 25 32 27 32 27C32 27 33 25 35.5 25C41 25 43 37 32 44Z"
        />
      </Phone>
      <circle className={o} cx="48" cy="9" r="6.5" fill={Y} />
    </>
  ),
  phoneEye: (
    <Phone>
      <ellipse className={o} cx="32" cy="32" rx="9" ry="6.5" fill={W} strokeWidth="2.6" />
      <circle cx="32" cy="32" r="3.6" fill={C} />
      <circle cx="32" cy="32" r="1.6" fill="#000" />
    </Phone>
  ),
  phoneBroken: (
    <Phone>
      <path
        className={o}
        fill={P}
        strokeWidth="2.6"
        d="M32 44C21 37 23 25 28.5 25C31 25 32 27 32 27C32 27 33 25 35.5 25C41 25 43 37 32 44Z"
      />
      <path className={nf} d="M32 27l-3 6 5 3-3 8" strokeWidth="2.4" stroke="#fff" />
    </Phone>
  ),
  glasses: (
    <>
      <circle cx="19" cy="35" r="12" fill={LB} />
      <circle cx="45" cy="35" r="12" fill={LB} />
      <circle className={nf} cx="19" cy="35" r="12" strokeWidth="4.5" />
      <circle className={nf} cx="45" cy="35" r="12" strokeWidth="4.5" />
      <path className={nf} d="M31 33q1-3 2 0M7 31L3 23M57 31l4-8" strokeWidth="4" />
      <path className={nf} d="M13 31c1-3 3-4 5-4" stroke="#fff" strokeWidth="3" opacity=".9" />
    </>
  ),
  vr: (
    <>
      <path
        className={o}
        fill={C}
        d="M12 6h26a8 8 0 0 1 8 8v12a8 8 0 0 1-8 8H24l-10 8v-8h-2a8 8 0 0 1-8-8V14a8 8 0 0 1 8-8z"
      />
      <path
        className={o}
        fill={P}
        d="M30 30h22a8 8 0 0 1 8 8v12a8 8 0 0 1-8 8h-2v8l-10-8H30a8 8 0 0 1-8-8V38a8 8 0 0 1 8-8z"
        transform="translate(0 -4) scale(.98)"
      />
      <text className="ic-tx" x="25" y="27" textAnchor="middle" fontSize="19">
        V
      </text>
      <text
        x="41"
        y="51"
        textAnchor="middle"
        fontFamily="Bowlby One"
        fontSize="19"
        fill="#fff"
        stroke="#0f1f5c"
        strokeWidth="2.4"
        paintOrder="stroke"
      >
        R
      </text>
    </>
  ),
  mic: (
    <>
      <path className={o} fill="#2347c9" d="M25 30h14l-3 26h-8z" />
      <circle className={o} cx="32" cy="20" r="13" fill="#d3dbf3" />
      <path className={nf} d="M22 16h20M20 22h24M24 28h16" strokeWidth="2.4" opacity=".6" />
      <circle className={o} cx="54" cy="46" r="4.5" fill={Y} />
      <path className={nf} d="M58 46V30l-6 3" />
    </>
  ),
  pants: (
    <>
      <path className={o} fill={B} d="M15 5h34l4 54H36L32 27 28 59H11z" />
      <path className={nf} d="M15 14h34" strokeWidth="3" />
      <circle className={o} cx="32" cy="10" r="2.6" fill={Y} strokeWidth="2.4" />
      <path
        className={nf}
        d="M17 20c3 5 6 5 8 3M47 20c-3 5-6 5-8 3"
        stroke={LB}
        strokeWidth="2.4"
        strokeDasharray="3 3"
      />
    </>
  ),
  strawberry: (
    <>
      <path
        className={o}
        fill="#ff3b4e"
        d="M32 58C10 46 6 26 14 20C22 15 30 20 32 21C34 20 42 15 50 20C58 26 54 46 32 58Z"
      />
      <path className={o} fill="#4ccf6a" d="M17 17L32 7L47 17L39 20L32 14L25 20Z" />
      <g fill="#fff2b0">
        <ellipse cx="22" cy="32" rx="1.8" ry="2.6" />
        <ellipse cx="32" cy="30" rx="1.8" ry="2.6" />
        <ellipse cx="42" cy="32" rx="1.8" ry="2.6" />
        <ellipse cx="27" cy="42" rx="1.8" ry="2.6" />
        <ellipse cx="37" cy="42" rx="1.8" ry="2.6" />
        <ellipse cx="32" cy="50" rx="1.8" ry="2.6" />
      </g>
    </>
  ),
  fire: (
    <>
      <path
        className={o}
        fill="#ff7a1a"
        d="M32 5C34 18 49 22 49 38C49 50 41 59 32 59C22 59 15 51 15 40C15 32 22 28 22 19C28 24 30 17 32 5Z"
      />
      <path
        fill={Y}
        d="M32 33C34 40 41 42 41 48C41 53 37 57 32 57C27 57 23 53 23 48C23 42 30 40 32 33Z"
      />
    </>
  ),
  eyes: <EyeShape iris="#4a2a14" />,
  eyesBlue: <EyeShape iris="#2f9bff" />,
  pong: (
    <>
      <path className={o} fill={R} d="M12 24H48L43 58H17Z" />
      <path fill={W} d="M14.3 34H45.7L44.5 43H15.5Z" />
      <ellipse className={o} cx="30" cy="24" rx="18" ry="5" fill="#ff8191" />
      <circle className={o} cx="50" cy="10" r="7" fill={W} />
      <path className={nf} d="M41 6Q34 2 27 8" strokeDasharray="3 4" strokeWidth="3" />
    </>
  ),
  lime: (
    <>
      <circle className={o} cx="32" cy="32" r="25" fill={G} />
      <circle cx="32" cy="32" r="19.5" fill="#d3f8b4" />
      <path
        d="M32 32V13M32 32L48 22.5M32 32L48 41.5M32 32V51M32 32L16 41.5M32 32L16 22.5"
        stroke={G}
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="32" cy="32" r="4" fill={G} />
    </>
  ),
  heart: (
    <>
      <Heart />
      <path className={nf} d="M6 58L50 12" strokeWidth="4" />
      <polygon className={o} fill={Y} points="57,5 43,8 53,19" />
      <path className={nf} d="M9 55l-5-1 1-5M14 50l-5-1 1-5" strokeWidth="3" />
    </>
  ),
  hearts2: (
    <>
      <g transform="translate(-6 2) scale(.78)">
        <Heart />
      </g>
      <g transform="translate(26 14) scale(.62)">
        <Heart fill="#ff9ac0" />
      </g>
    </>
  ),
  hearts3: (
    <>
      <g transform="translate(1 3) scale(.5)">
        <Heart />
      </g>
      <g transform="translate(31 3) scale(.5)">
        <Heart fill="#ff9ac0" />
      </g>
      <g transform="translate(16 30) scale(.5)">
        <Heart fill="#ffd1e0" />
      </g>
    </>
  ),
  brokenHeart: (
    <>
      <path className={o} fill={P} d={HEART} />
      <path
        d="M33 12L27 26L37 33L29 46L34 58"
        stroke="#0b1a5a"
        strokeWidth="6"
        fill="none"
        strokeLinejoin="round"
      />
      <path
        className={nf}
        d="M33 12L27 26L37 33L29 46L34 58"
        stroke="#fff"
        strokeWidth="2"
        opacity=".7"
      />
    </>
  ),
  heartEyes: (
    <>
      <circle className={o} cx="32" cy="32" r="25" fill={Y} />
      <g transform="translate(14 17) scale(.3)">
        <path fill={P} stroke="#0f1f5c" strokeWidth="9" d={HEART} />
      </g>
      <g transform="translate(34 17) scale(.3)">
        <path fill={P} stroke="#0f1f5c" strokeWidth="9" d={HEART} />
      </g>
      <path className={nf} d="M18 40q14 14 28 0" />
    </>
  ),
  sad: (
    <>
      <circle className={o} cx="32" cy="32" r="25" fill={Y} />
      <circle cx="23" cy="27" r="3" fill="#0f1f5c" />
      <circle cx="41" cy="27" r="3" fill="#0f1f5c" />
      <path className={nf} d="M20 46q12-12 24 0" />
      <path className={o} fill={C} strokeWidth="2.4" d="M43 33q4 6 0 9q-4-3 0-9z" />
    </>
  ),
  dress: (
    <>
      <path className={o} fill={P} d="M24 6h4l4 6 4-6h4l-2 18 14 32H12l14-32z" />
      <path className={nf} d="M26 24h12" stroke={Y} strokeWidth="4" />
      <circle cx="32" cy="42" r="2.4" fill={Y} />
      <circle cx="22" cy="48" r="2" fill={Y} />
      <circle cx="42" cy="48" r="2" fill={Y} />
    </>
  ),
  tshirtBlack: (
    <>
      <Tshirt fill="#2b2b3d" />
      <path className={nf} d="M24 30v18" stroke="#fff" strokeWidth="3" opacity=".6" />
    </>
  ),
  tank: (
    <>
      <path className={o} fill={C} d="M20 6h6l2 14q4 6 8 0l2-14h6l2 18 4 32H14l4-32z" />
      <path className={nf} d="M20 30h24" stroke="#fff" strokeWidth="3" opacity=".7" />
    </>
  ),
  swap: (
    <>
      <g transform="translate(-4 -2) scale(.9)">
        <Tshirt fill={C} />
      </g>
      <circle className={o} cx="46" cy="46" r="15" fill={Y} />
      <path className={nf} d="M38 42h14M48 37l5 5-5 5M54 51H40M44 46l-5 5 5 5" strokeWidth="3" />
    </>
  ),
  pointer: (
    <>
      <rect className={o} x="26" y="24" width="34" height="11" rx="5.5" fill={SKIN} />
      <rect className={o} x="5" y="20" width="28" height="30" rx="9" fill={SKIN} />
      <rect className={o} x="14" y="10" width="12" height="16" rx="6" fill={SKIN} />
      <path className={nf} d="M10 40h18M10 45h14" strokeWidth="2.6" opacity=".55" />
    </>
  ),
  hand: (
    <>
      <rect className={o} x="13" y="12" width="9" height="30" rx="4.5" fill={SKIN} />
      <rect className={o} x="22" y="6" width="9" height="34" rx="4.5" fill={SKIN} />
      <rect className={o} x="31" y="8" width="9" height="32" rx="4.5" fill={SKIN} />
      <rect className={o} x="40" y="14" width="9" height="28" rx="4.5" fill={SKIN} />
      <rect className={o} x="11" y="30" width="40" height="28" rx="12" fill={SKIN} />
      <ellipse
        className={o}
        cx="10"
        cy="38"
        rx="6"
        ry="10"
        fill={SKIN}
        transform="rotate(-30 10 38)"
      />
    </>
  ),
  dog: (
    <>
      <path className={o} fill="#8b5a2b" d="M10 14l14 6-4 20-12-6z" />
      <path className={o} fill="#8b5a2b" d="M54 14L40 20l4 20 12-6z" />
      <ellipse className={o} cx="32" cy="36" rx="19" ry="18" fill="#f0b46a" />
      <circle cx="24" cy="31" r="3" fill="#0f1f5c" />
      <circle cx="40" cy="31" r="3" fill="#0f1f5c" />
      <ellipse className={o} cx="32" cy="41" rx="5" ry="3.6" fill="#0f1f5c" />
      <path className={o} fill={P} strokeWidth="2.6" d="M28 46q4 9 8 0z" />
    </>
  ),
  kissPair: (
    <>
      <circle className={o} cx="16" cy="38" r="13" fill={SKIN} />
      <circle className={o} cx="48" cy="38" r="13" fill={SKIN} />
      <circle cx="19" cy="35" r="2" fill="#0f1f5c" />
      <circle cx="45" cy="35" r="2" fill="#0f1f5c" />
      <g transform="translate(22 4) scale(.32)">
        <path fill={P} stroke="#0f1f5c" strokeWidth="9" d={HEART} />
      </g>
      <path className={nf} d="M24 42q8 4 16 0" strokeWidth="3" />
    </>
  ),
  marry: (
    <>
      <g transform="translate(2 4) scale(.5)">
        <circle className={nf} cx="32" cy="38" r="16" strokeWidth="13" />
        <circle className={nf} cx="32" cy="38" r="16" stroke={Y} strokeWidth="6" />
        <polygon className={o} fill={C} points="32,4 42,14 32,24 22,14" />
      </g>
      <g transform="translate(30 2) scale(.5)">
        <path
          className={o}
          fill="#ff7a1a"
          d="M32 5C34 18 49 22 49 38C49 50 41 59 32 59C22 59 15 51 15 40C15 32 22 28 22 19C28 24 30 17 32 5Z"
        />
        <path
          fill={Y}
          d="M32 33C34 40 41 42 41 48C41 53 37 57 32 57C27 57 23 53 23 48C23 42 30 40 32 33Z"
        />
      </g>
      <g transform="translate(16 30) scale(.5)">
        <path
          className={o}
          fill="#eef1ff"
          d="M32 6C16 6 8 18 8 30c0 8 4 12 8 14v10h32V44c4-2 8-6 8-14C56 18 48 6 32 6z"
        />
        <circle cx="22" cy="30" r="6" fill="#0f1f5c" />
        <circle cx="42" cy="30" r="6" fill="#0f1f5c" />
        <path className={nf} d="M26 46v8M32 46v8M38 46v8" strokeWidth="3" />
      </g>
    </>
  ),
  noBubble: (
    <>
      <path
        className={o}
        fill={W}
        d="M10 10h44a6 6 0 0 1 6 6v22a6 6 0 0 1-6 6H30l-10 10v-10h-10a6 6 0 0 1-6-6V16a6 6 0 0 1 6-6z"
        transform="translate(-3 0)"
      />
      <text className="ic-tx" x="29" y="36" textAnchor="middle" fontSize="20">
        NO
      </text>
      <circle className={nf} cx="32" cy="32" r="27" stroke={R} strokeWidth="5" />
      <path className={nf} d="M13 13l38 38" stroke={R} strokeWidth="5" />
    </>
  ),
  padlock: (
    <>
      <path className={nf} d="M20 28V20a12 12 0 0 1 24 0v8" strokeWidth="9" />
      <path className={nf} d="M20 28V20a12 12 0 0 1 24 0v8" stroke="#d3dbf3" strokeWidth="4" />
      <rect className={o} x="12" y="27" width="40" height="30" rx="6" fill={Y} />
      <circle cx="32" cy="40" r="4.5" fill="#0f1f5c" />
      <rect x="30.2" y="42" width="3.6" height="8" rx="1.5" fill="#0f1f5c" />
    </>
  ),
  bubbleHeart: (
    <>
      <path
        className={o}
        fill={W}
        d="M10 8h44a6 6 0 0 1 6 6v26a6 6 0 0 1-6 6H32l-12 11V46H10a6 6 0 0 1-6-6V14a6 6 0 0 1 6-6z"
      />
      <g transform="translate(18 10) scale(.4)">
        <path fill={P} stroke="#0f1f5c" strokeWidth="8" d={HEART} />
      </g>
    </>
  ),
  bubbleAa: (
    <>
      <path
        className={o}
        fill={W}
        d="M10 8h44a6 6 0 0 1 6 6v26a6 6 0 0 1-6 6H32l-12 11V46H10a6 6 0 0 1-6-6V14a6 6 0 0 1 6-6z"
      />
      <text className="ic-tx" x="32" y="36" textAnchor="middle" fontSize="22">
        Aa
      </text>
    </>
  ),
  mask: (
    <>
      <path className={o} fill={Y} d="M10 10h44v22c0 14-10 24-22 24S10 46 10 32z" />
      <path
        className="ic-o"
        fill="#0f1f5c"
        d="M17 24q5-4 11 1q-2 7-6 7t-5-8zM47 24q-5-4-11 1q2 7 6 7t5-8z"
      />
      <path className={nf} d="M20 42q12 10 24 0" strokeWidth="4" />
    </>
  ),
  cake: (
    <>
      <rect className={o} x="31" y="14" width="4" height="14" fill={C} strokeWidth="2.4" />
      <path className={o} fill={Y} strokeWidth="2.4" d="M33 4q4 5 0 9q-4-4 0-9z" />
      <rect className={o} x="8" y="30" width="48" height="26" rx="5" fill={P} />
      <path className={o} fill={W} d="M8 30h48v8q-4 6-8 0q-4 6-8 0q-4 6-8 0q-4 6-8 0q-4 6-8 0z" />
      <path className={nf} d="M12 50h40" stroke={Y} strokeWidth="3" />
    </>
  ),
  closet: (
    <>
      <rect className={o} x="10" y="6" width="36" height="50" rx="3" fill="#b07a3b" />
      <path className={nf} d="M28 6v50" />
      <circle cx="24" cy="32" r="2.4" fill="#0f1f5c" />
      <circle cx="32" cy="32" r="2.4" fill="#0f1f5c" />
      <rect className={o} x="8" y="56" width="40" height="4" fill="#8b5a2b" strokeWidth="2.4" />
      <Badge cx={48} cy={20} r={13} t="1'" fs={16} />
    </>
  ),
  megaphone: (
    <>
      <path className={o} fill={P} d="M10 24L42 10v44L10 40z" />
      <rect className={o} x="4" y="24" width="10" height="16" rx="3" fill={Y} />
      <path className={o} fill="#d8386f" d="M16 40l4 16h10l-3-12z" />
      <path className={nf} d="M48 22q6 10 0 20M54 16q10 16 0 32" />
    </>
  ),
  mirror: (
    <>
      <rect className={o} x="27" y="38" width="10" height="22" rx="4" fill={Y} />
      <circle className={o} cx="32" cy="24" r="20" fill={Y} />
      <circle cx="32" cy="24" r="14" fill={LB} />
      <path className={nf} d="M23 19q3-5 8-6" stroke="#fff" strokeWidth="3.5" />
    </>
  ),
  tie: (
    <>
      <path className={o} fill={B} d="M25 6h14l-3 11h-8z" />
      <path className={o} fill={B} d="M28 17h8l7 38-11 6-11-6z" />
      <path className={nf} d="M27 28l10 6M25 38l14 8" stroke="#fff" strokeWidth="3" opacity=".8" />
    </>
  ),
  heel: (
    <>
      <path className={o} fill={Y} d="M9 36l9 3-4 21h-6z" />
      <path className={o} fill={P} d="M8 8h15l3 24c12 4 28 6 35 15v6H28c-5 0-8-2-10-7L8 40z" />
      <path className={nf} d="M26 38c10 3 20 5 28 10" stroke="#fff" strokeWidth="3" opacity=".7" />
    </>
  ),
  cloudHeart: (
    <>
      <path className={o} fill={W} d="M16 40a10 10 0 0 1 2-19a13 13 0 0 1 25-3a12 12 0 0 1 8 22z" />
      <g transform="translate(21 17) scale(.34)">
        <path fill={P} stroke="#0f1f5c" strokeWidth="9" d={HEART} />
      </g>
      <circle className={o} cx="14" cy="50" r="5" fill={W} strokeWidth="3" />
      <circle className={o} cx="7" cy="58" r="3" fill={W} strokeWidth="2.6" />
    </>
  ),
  bed: (
    <>
      <rect className={o} x="4" y="14" width="8" height="42" rx="2" fill="#b07a3b" />
      <rect className={o} x="8" y="38" width="52" height="12" rx="3" fill={W} />
      <rect className={o} x="12" y="28" width="16" height="10" rx="4" fill={Y} />
      <path className={o} fill={P} d="M28 36h30a2 2 0 0 1 2 2v12H28z" />
      <rect className={o} x="54" y="46" width="6" height="12" rx="2" fill="#b07a3b" />
    </>
  ),
  bed1: (
    <>
      <rect className={o} x="4" y="14" width="8" height="42" rx="2" fill="#b07a3b" />
      <rect className={o} x="8" y="38" width="52" height="12" rx="3" fill={W} />
      <rect className={o} x="12" y="28" width="16" height="10" rx="4" fill={Y} />
      <path className={o} fill={P} d="M28 36h30a2 2 0 0 1 2 2v12H28z" />
      <Badge cx={46} cy={20} r={13} t="1" fs={18} />
    </>
  ),
  nameE: (
    <>
      <rect className={o} x="6" y="12" width="52" height="42" rx="6" fill={W} />
      <path className="ic-o" fill={P} d="M6 18a6 6 0 0 1 6-6h40a6 6 0 0 1 6 6v8H6z" />
      <text className="ic-tx" x="32" y="48" textAnchor="middle" fontSize="26">
        E
      </text>
    </>
  ),
  nameA: (
    <>
      <rect className={o} x="6" y="12" width="52" height="42" rx="6" fill={W} />
      <path className="ic-o" fill={P} d="M6 18a6 6 0 0 1 6-6h40a6 6 0 0 1 6 6v8H6z" />
      <text className="ic-tx" x="32" y="48" textAnchor="middle" fontSize="26">
        A
      </text>
    </>
  ),
  peach: (
    <>
      <circle className={o} cx="21" cy="38" r="16" fill="#ffb27a" />
      <circle className={o} cx="43" cy="38" r="16" fill="#ffa56a" />
      <path className={nf} d="M21 24q-4 14 0 28M43 24q-4 14 0 28" strokeWidth="2.6" opacity=".55" />
      <path className={o} fill={G} d="M30 22q8-12 18-8q-4 10-18 8z" strokeWidth="3" />
    </>
  ),
  hairface: (
    <>
      <circle className={o} cx="32" cy="36" r="19" fill={SKIN} />
      <path
        className={o}
        fill="#6b3f1d"
        d="M13 34C10 8 54 8 51 34C47 25 41 22 32 22C23 22 17 25 13 34z"
      />
      <circle cx="25" cy="38" r="2.6" fill="#0f1f5c" />
      <circle cx="39" cy="38" r="2.6" fill="#0f1f5c" />
      <path className={nf} d="M25 47q7 6 14 0" strokeWidth="3" />
    </>
  ),
  ring: (
    <>
      <circle className={nf} cx="32" cy="38" r="16" strokeWidth="13" />
      <circle className={nf} cx="32" cy="38" r="16" stroke={Y} strokeWidth="6" />
      <polygon className={o} fill={C} points="32,4 43,15 32,26 21,15" />
    </>
  ),
  stopwatch: (
    <>
      <rect className={o} x="27" y="4" width="10" height="7" rx="2" fill={Y} />
      <circle className={o} cx="32" cy="36" r="22" fill={Y} />
      <circle cx="32" cy="36" r="16" fill={W} />
      <path className={nf} d="M32 36V24M32 36l8 6" strokeWidth="3.6" />
      <path className={nf} d="M50 16l5-5" strokeWidth="5" />
    </>
  ),
  coin: (
    <>
      <circle className={o} cx="32" cy="32" r="25" fill={Y} />
      <circle className={nf} cx="32" cy="32" r="18" strokeWidth="2.6" opacity=".6" />
      <text className="ic-tx" x="32" y="42" textAnchor="middle" fontSize="28">
        $
      </text>
    </>
  ),
  anchor: (
    <>
      <path
        className={nf}
        d="M32 18v36M20 30h24M10 38c2 14 12 18 22 18s20-4 22-18"
        stroke="#0f1f5c"
        strokeWidth="10"
      />
      <circle className={nf} cx="32" cy="12" r="7" stroke="#0f1f5c" strokeWidth="10" />
      <path
        className={nf}
        d="M32 18v36M20 30h24M10 38c2 14 12 18 22 18s20-4 22-18"
        stroke={C}
        strokeWidth="4"
      />
      <circle className={nf} cx="32" cy="12" r="7" stroke={C} strokeWidth="4" />
    </>
  ),
  camera: (
    <>
      <path
        className={o}
        fill={P}
        d="M8 20h12l4-7h16l4 7h12a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V24a4 4 0 0 1 4-4z"
      />
      <circle className={o} cx="32" cy="38" r="12" fill={W} />
      <circle cx="32" cy="38" r="7" fill={C} />
      <circle cx="49" cy="27" r="2.6" fill={Y} />
    </>
  ),
  chair: (
    <>
      <path className={o} fill="#b07a3b" d="M14 4h8l4 30H18z" />
      <rect className={o} x="12" y="32" width="38" height="9" rx="3" fill="#c98a45" />
      <path className={nf} d="M16 41v19M46 41v19" strokeWidth="5" />
    </>
  ),
  snail: (
    <>
      <path className={o} fill="#9dd9a0" d="M6 52q0-8 8-8h38q6 0 6 6v2q0 6-6 6H12q-6 0-6-6z" />
      <path className={nf} d="M10 44q-2-12 4-16" strokeWidth="5" />
      <path className={nf} d="M14 28l-3-6M18 29l1-7" strokeWidth="3" />
      <circle className={o} cx="32" cy="32" r="17" fill={O} />
      <path
        className={nf}
        d="M32 32m-2 0a2 2 0 1 1 4 0a6 6 0 1 1-8 0a10 10 0 1 1 14 0"
        strokeWidth="2.6"
        opacity=".7"
      />
    </>
  ),
  hoop: (
    <>
      <circle className={nf} cx="32" cy="34" r="18" stroke="#0f1f5c" strokeWidth="10" />
      <circle className={nf} cx="32" cy="34" r="18" stroke="#e9eefc" strokeWidth="4" />
      <circle className={o} cx="32" cy="16" r="6" fill={Y} />
    </>
  ),
  battery: (
    <>
      <rect className={o} x="5" y="18" width="46" height="28" rx="5" fill={W} />
      <rect className={o} x="51" y="27" width="7" height="10" rx="2" fill={W} strokeWidth="3" />
      <rect x="10" y="23" width="9" height="18" rx="2" fill={R} />
      <path className={nf} d="M32 24l-4 9h8l-4 9" stroke={Y} strokeWidth="3" />
    </>
  ),
  heartTimer: (
    <>
      <g transform="translate(-4 -4) scale(.92)">
        <Heart />
      </g>
      <Badge cx={47} cy={48} r={15} t="30s" fs={11} />
    </>
  ),
} satisfies Record<string, ReactNode>

export type IconKey = keyof typeof ICONS
