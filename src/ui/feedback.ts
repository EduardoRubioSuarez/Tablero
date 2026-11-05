/**
 * Hito 4.8. Sonido y vibración opcionales. Todo se sintetiza con Web Audio (sin archivos de
 * audio, así pesa casi nada y funciona sin conexión) y se silencia con el interruptor.
 */

export type Cue = 'roll' | 'land' | 'card' | 'move' | 'win' | 'tap'

type Note = { freq: number; at: number; dur: number; type?: OscillatorType; gain?: number }

/** Notas de cada señal. `at` y `dur` están en segundos. */
export const CUES: Record<Cue, Note[]> = {
  roll: [0, 0.07, 0.15, 0.24, 0.34, 0.46, 0.6, 0.76].map((at, i) => ({
    freq: 170 + ((i * 53) % 90),
    at,
    dur: 0.045,
    type: 'square' as const,
    gain: 0.12,
  })),
  land: [
    { freq: 520, at: 0, dur: 0.09, type: 'triangle', gain: 0.29 },
    { freq: 780, at: 0.08, dur: 0.14, type: 'triangle', gain: 0.29 },
  ],
  card: [
    { freq: 660, at: 0, dur: 0.12, type: 'sine', gain: 0.34 },
    { freq: 880, at: 0.1, dur: 0.2, type: 'sine', gain: 0.34 },
  ],
  move: [
    { freq: 440, at: 0, dur: 0.14, type: 'sawtooth', gain: 0.17 },
    { freq: 330, at: 0.12, dur: 0.14, type: 'sawtooth', gain: 0.17 },
    { freq: 220, at: 0.24, dur: 0.22, type: 'sawtooth', gain: 0.17 },
  ],
  win: [523, 659, 784, 1047].map((freq, i) => ({
    freq,
    at: i * 0.13,
    dur: i === 3 ? 0.5 : 0.16,
    type: 'triangle' as const,
    gain: 0.36,
  })),
  tap: [{ freq: 620, at: 0, dur: 0.04, type: 'sine', gain: 0.19 }],
}

/** Patrones de vibración, en milisegundos (vibra, pausa, vibra...). */
export const PATTERNS: Record<Cue, number[]> = {
  roll: [25, 50, 25, 50, 25],
  land: [60],
  card: [40],
  move: [90, 50, 90],
  win: [80, 60, 80, 60, 220],
  tap: [8],
}

let context: AudioContext | null = null

function audio(): AudioContext | null {
  try {
    if (typeof window === 'undefined') return null
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    context ??= new Ctor()
    if (context.state === 'suspended') void context.resume()
    return context
  } catch {
    return null
  }
}

/**
 * Despierta el audio con el primer toque en la pantalla. Los navegadores (sobre todo Safari en
 * iPhone) no dejan sonar nada hasta que el jugador toca algo.
 */
export function unlockAudio(): void {
  audio()
}

/** true si este dispositivo puede vibrar (Android sí; iPhone y la mayoría de las computadoras no). */
export function canVibrate(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
}

export function playCue(cue: Cue, enabled: boolean): void {
  if (!enabled) return
  const ctx = audio()
  if (!ctx) return
  const start = ctx.currentTime + 0.01
  for (const note of CUES[cue]) {
    const osc = ctx.createOscillator()
    const amp = ctx.createGain()
    osc.type = note.type ?? 'sine'
    osc.frequency.value = note.freq
    const peak = note.gain ?? 0.1
    amp.gain.setValueAtTime(0.0001, start + note.at)
    amp.gain.exponentialRampToValueAtTime(peak, start + note.at + 0.01)
    amp.gain.exponentialRampToValueAtTime(0.0001, start + note.at + note.dur)
    osc.connect(amp).connect(ctx.destination)
    osc.start(start + note.at)
    osc.stop(start + note.at + note.dur + 0.02)
  }
}

export function vibrate(cue: Cue, enabled: boolean): void {
  if (!enabled) return
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(PATTERNS[cue])
    }
  } catch {
    // Algunos navegadores no permiten vibrar: se ignora.
  }
}

/** Sonido y vibración de una señal, según los ajustes. */
export function signal(cue: Cue, settings: { sound: boolean; vibration: boolean }): void {
  playCue(cue, settings.sound)
  vibrate(cue, settings.vibration)
}

/** true si el usuario pidió menos movimiento en su sistema. */
export function prefersReducedMotion(): boolean {
  try {
    return (
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
  } catch {
    return false
  }
}
