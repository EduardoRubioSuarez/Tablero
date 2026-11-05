# ADR-004: vite-plugin-pwa para instalación y modo sin conexión

Estado: Aceptado
Fecha: 2026-11-04

## Contexto
La app debe poder instalarse en la pantalla de inicio y funcionar sin conexión después de la primera carga, porque las fiestas pueden tener mala señal. Escribir un service worker a mano es propenso a errores (caché desactualizada, actualizaciones que no llegan).

## Opciones consideradas
- **`vite-plugin-pwa` con Workbox.** Genera el manifest y el service worker, con estrategias de caché probadas y aviso de actualización.
- **Service worker manual.** Control total, pero más riesgo de errores de caché y más mantenimiento.
- **No hacer nada (solo página web).** Sin modo sin conexión ni instalación.

## Decisión
Usar **`vite-plugin-pwa`**. La app es toda estática, así que se precachea todo el contenido (incluidas las 80 acciones y el reglamento). Se muestra un aviso cuando hay una versión nueva, sin interrumpir la partida en curso. Se consultan los skills `pwa-development` al implementarlo (bloque 5).

## Resultado (bloque 5)
Se usó `vite-plugin-pwa` 2.0 con `registerType: 'prompt'`: el aviso de versión nueva lo decide el jugador. Se precachea todo, salvo las fuentes `.woff`. La instalación y los avisos viven en `src/pwa/`. Las pruebas e2e normales bloquean el service worker y `tests/e2e/pwa.spec.ts` lo activa.

## Consecuencias
- Más fácil: instalación, offline y actualizaciones con poca configuración.
- Más difícil: depurar problemas de caché en dispositivos reales, especialmente iOS Safari.
- Reversible: se puede reemplazar por un service worker propio si el plugin limita algo.
