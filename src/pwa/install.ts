/**
 * Hito 5.3. Guía para instalar la app en la pantalla de inicio. Esta parte es lógica pura: decide
 * qué instrucciones mostrar según el dispositivo.
 */

/**
 * - `none`: no hay nada que mostrar (ya está instalada, o es una computadora sin opción de instalar).
 * - `native`: el navegador ofrece instalar con un botón (Android y Chrome de escritorio).
 * - `ios`: iPhone o iPad; se instala desde el menú Compartir.
 * - `manual`: Android u otro celular sin botón; se instala desde el menú del navegador.
 */
export type InstallHelp = 'none' | 'native' | 'ios' | 'manual'

export type InstallEnvironment = {
  /** La app ya se abrió desde el ícono de inicio. */
  standalone: boolean
  /** El navegador entregó el evento `beforeinstallprompt`. */
  canPrompt: boolean
  userAgent: string
  /** `navigator.maxTouchPoints`: los iPad nuevos se presentan como Mac y se distinguen por la pantalla táctil. */
  maxTouchPoints: number
}

export function isIosDevice(userAgent: string, maxTouchPoints: number): boolean {
  if (/iPhone|iPad|iPod/.test(userAgent)) return true
  return /Macintosh/.test(userAgent) && maxTouchPoints > 1
}

export function isMobileDevice(userAgent: string): boolean {
  return /Android|iPhone|iPad|iPod|Mobile/.test(userAgent)
}

export function installHelpFor(env: InstallEnvironment): InstallHelp {
  if (env.standalone) return 'none'
  if (env.canPrompt) return 'native'
  if (isIosDevice(env.userAgent, env.maxTouchPoints)) return 'ios'
  if (isMobileDevice(env.userAgent)) return 'manual'
  return 'none'
}

/** Textos de cada guía. */
export const INSTALL_TEXT: Record<
  Exclude<InstallHelp, 'none'>,
  { title: string; steps: string[] }
> = {
  native: {
    title: 'Instala Tablero en tu celular',
    steps: ['Así se abre como una app y funciona aunque no tengas señal.'],
  },
  ios: {
    title: 'Instala Tablero en tu iPhone',
    steps: [
      'Toca el botón Compartir, el cuadro con una flecha hacia arriba.',
      'Elige "Agregar a inicio".',
      'Abre Tablero desde el ícono nuevo.',
    ],
  },
  manual: {
    title: 'Instala Tablero en tu celular',
    steps: [
      'Abre el menú del navegador, los tres puntos.',
      'Elige "Instalar app" o "Agregar a la pantalla de inicio".',
      'Abre Tablero desde el ícono nuevo.',
    ],
  },
}
