import { useSyncExternalStore } from 'react'
import { installHelpFor, type InstallHelp } from './install'

/** Evento que el navegador entrega para ofrecer la instalación (no está en los tipos estándar). */
type InstallPromptEvent = Event & {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export const DISMISS_KEY = 'tablero:instalacion:v1'

type State = { help: InstallHelp; dismissed: boolean }

let deferred: InstallPromptEvent | null = null
let installed = false
let state: State = { help: 'none', dismissed: false }
const listeners = new Set<() => void>()

function readDismissed(): boolean {
  try {
    return window.localStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

function isStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true
}

function refresh() {
  const help = installed
    ? 'none'
    : installHelpFor({
        standalone: isStandalone(),
        canPrompt: deferred !== null,
        userAgent: navigator.userAgent,
        maxTouchPoints: navigator.maxTouchPoints ?? 0,
      })
  state = { help, dismissed: readDismissed() }
  listeners.forEach((fn) => fn())
}

/** Empieza a escuchar los eventos de instalación. Se llama una vez al abrir la app. */
export function watchInstall(): void {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferred = event as InstallPromptEvent
    refresh()
  })
  window.addEventListener('appinstalled', () => {
    installed = true
    deferred = null
    refresh()
  })
  refresh()
}

/** Abre el cuadro de instalación del navegador, si lo hay. */
export async function promptInstall(): Promise<void> {
  const event = deferred
  if (!event) return
  deferred = null
  await event.prompt()
  await event.userChoice
  refresh()
}

/** El jugador no quiere ver más la guía. */
export function dismissInstall(): void {
  try {
    window.localStorage.setItem(DISMISS_KEY, '1')
  } catch {
    // Sin almacenamiento, la guía volverá a aparecer en la próxima visita.
  }
  state = { ...state, dismissed: true }
  listeners.forEach((fn) => fn())
}

export function useInstall(): State {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn)
      return () => void listeners.delete(fn)
    },
    () => state,
  )
}
