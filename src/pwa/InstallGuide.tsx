import { Button } from '../ui/Button'
import { INSTALL_TEXT } from './install'
import { dismissInstall, promptInstall, useInstall } from './installStore'

/** Hito 5.3. Guía de instalación en el inicio. Solo aparece cuando aplica y se puede descartar. */
export function InstallGuide() {
  const { help, dismissed } = useInstall()
  if (help === 'none' || dismissed) return null
  const text = INSTALL_TEXT[help]

  return (
    <section
      aria-labelledby="install-title"
      className="flex flex-col gap-3 rounded-2xl bg-white/10 p-5 ring-1 ring-white/10"
    >
      <h2 id="install-title" className="font-display text-lg">
        {text.title}
      </h2>
      {help === 'native' ? (
        <p className="text-sm text-lila">{text.steps[0]}</p>
      ) : (
        <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm text-lila">
          {text.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      )}
      <div className="flex gap-2">
        {help === 'native' && (
          <Button className="flex-1" onClick={() => void promptInstall()}>
            Instalar
          </Button>
        )}
        <Button variant="ghost" className="flex-1" onClick={dismissInstall}>
          No mostrar más
        </Button>
      </div>
    </section>
  )
}
