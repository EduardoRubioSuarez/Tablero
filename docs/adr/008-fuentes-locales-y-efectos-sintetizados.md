# ADR-008: Fuentes locales, efectos sintetizados y pantalla encendida

Estado: Aceptado
Fecha: 2026-11-04

## Contexto
El bloque 4 agrega tipografía propia, sonido, vibración y mantener la pantalla encendida. La app debe funcionar sin conexión, pesar poco y no enviar datos a terceros (ni siquiera la dirección IP del jugador).

## Opciones consideradas
- **Fuentes desde Google Fonts.** Fácil, pero falla sin conexión y cada carga avisa a un tercero.
- **Fuentes del sistema.** Cero peso, pero la identidad visual de la guía de estilo se pierde.
- **Fuentes alojadas en la app con `@fontsource`.** Paquetes de npm mantenidos, con los archivos dentro del proyecto. Se importa solo el subconjunto latino, que cubre el español.
- **Sonidos como archivos de audio.** Más naturales, pero suman peso, licencias y archivos que precargar para el modo sin conexión.
- **Sonidos sintetizados con Web Audio.** Sin archivos, con muy poco código.
- **Pantalla encendida con la API Screen Wake Lock** frente a un video oculto en bucle (truco de NoSleep). El video gasta batería y es frágil.

## Decisión
- Bowlby One y Figtree (variable) se instalan con `@fontsource` y se cargan solo en latino (`font-display: swap`).
- Los sonidos se sintetizan con osciladores de Web Audio y la vibración usa `navigator.vibrate`. Ambos son opcionales, están activados por defecto y se recuerdan en `localStorage`.
- La pantalla se mantiene encendida con Screen Wake Lock. Se pide al entrar a la partida, se vuelve a pedir al volver a la pestaña y se libera al salir. Si el navegador no la tiene, se avisa al jugador; no se usa el truco del video.

## Consecuencias
- Más fácil: todo funciona sin conexión y sin llamadas a terceros; la primera carga pesa poco (las fuentes suman alrededor de 40 KB).
- Más difícil: los sonidos son simples (tonos), no grabaciones. Si el autor quiere sonidos con más carácter, se agregan archivos y se precargan con el service worker.
- Reversible: cambiar de fuentes es editar `src/index.css`; los efectos están aislados en `src/ui/feedback.ts` y el bloqueo de pantalla en `src/ui/wakeLock.ts`.
- Pendiente: probar el bloqueo de pantalla y la vibración en celulares reales (hito 5.7). iOS no vibra con `navigator.vibrate`.
