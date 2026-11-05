import { useState } from 'react'
import { INSTALL_TEXT } from './install'
import { dismissInstall, promptInstall, useInstall } from './installStore'

/**
 * Hito 5.3. Guía de instalación en el inicio. Es una barra pequeña pegada abajo, así no empuja el
 * resto de la pantalla. Los pasos se abren solo si el jugador los pide. Se puede descartar.
 */
export function InstallGuide() {
  const { help, dismissed } = useInstall()
  const [open, setOpen] = useState(false)
  if (help === 'none' || dismissed) return null
  const text = INSTALL_TEXT[help]

  return (
    <section
      aria-labelledby="install-title"
      className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md p-3"
    >
      <div className="rounded-2xl bg-noche/95 ring-1 ring-white/20">
        <div className="flex items-center gap-2 py-2 pr-2 pl-4">
          <h2 id="install-title" className="min-w-0 flex-1 text-sm font-semibold">
            {text.title}
          </h2>
          {help === 'native' ? (
            <button
              type="button"
              onClick={() => void promptInstall()}
              className="min-h-10 shrink-0 rounded-xl bg-sol-400 px-4 text-sm font-extrabold text-ink"
            >
              Instalar
            </button>
          ) : (
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="min-h-10 shrink-0 rounded-xl bg-white/12 px-4 text-sm font-semibold ring-1 ring-white/20"
            >
              {open ? 'Ocultar' : 'Ver cómo'}
            </button>
          )}
          <button
            type="button"
            aria-label="No mostrar más"
            onClick={dismissInstall}
            className="grid size-10 shrink-0 place-items-center rounded-xl text-lila hover:bg-white/10"
          >
            <svg
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        {help === 'native' ? (
          <p className="px-4 pb-3 text-xs text-lila">{text.steps[0]}</p>
        ) : (
          open && (
            <ol className="flex list-decimal flex-col gap-1 px-4 pb-3 pl-9 text-sm text-lila">
              {text.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          )
        )}
      </div>
    </section>
  )
}
