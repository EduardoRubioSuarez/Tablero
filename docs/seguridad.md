# Revisión de seguridad y privacidad (hito 5.9)

Hecha el 2026-11-05 sobre el código de la versión actual.

## Qué se revisó
Código fuente de `src/`, dependencias, comportamiento de la app en el navegador y las cabeceras con las que se sirve.

## Hallazgos y qué se hizo

| # | Hallazgo | Riesgo | Resolución |
|---|---|---|---|
| 1 | La página se servía sin política de seguridad de contenido ni otras cabeceras de seguridad. | Medio | Se agregó `vercel.json` con una política que solo permite recursos propios (`default-src 'self'`, sin `unsafe-eval` ni `unsafe-inline`, sin objetos ni marcos), `nosniff`, `Referrer-Policy: no-referrer`, `Permissions-Policy` sin cámara, micrófono ni ubicación, y `X-Frame-Options: DENY`. Esas mismas cabeceras se aplican a `npm run preview` y las pruebas e2e corren bajo ellas. |
| 2 | La librería de validación (zod) intentaba generar código con `eval`, lo que la nueva política bloquea. | Bajo | Se desactivó esa optimización (`jitless`). No cambia el comportamiento. |
| 3 | Se buscaron puntos peligrosos en el código (`innerHTML`, `dangerouslySetInnerHTML`, `eval`, `fetch`, cookies, `window.open`, `postMessage`). | — | No hay ninguno. El reglamento se muestra con un lector de Markdown propio que genera elementos de React, nunca HTML. |
| 4 | Nombres de jugadores con HTML o código. | — | Se muestran como texto y no se ejecutan (prueba e2e). Máximo de 30 caracteres. |
| 5 | Datos guardados que alguien manipule a mano en el navegador. | — | La partida se valida con un esquema y una revisión cruzada, y un guardado dañado se descarta con un aviso. Los ajustes y la guía de instalación ignoran valores raros. Probado. |
| 6 | Parámetro `?seed=` de la dirección. | — | Solo se acepta un entero sin signo de 32 bits; cualquier otra cosa se ignora. Probado. |
| 7 | Dependencias. | Bajo | `npm audit` sin vulnerabilidades en lo que se entrega al jugador. Hay 6 avisos moderados en herramientas de compilación de Workbox (`vite-plugin-pwa`), que no llegan al navegador; no tienen arreglo sin bajar de versión el plugin. |

## Privacidad
- La app **no hace ninguna petición fuera de su propio sitio** (prueba e2e que juega una partida y mira todas las peticiones).
- No hay cuentas, anuncios, analítica ni cookies. La analítica (hito 6.5) se omitió por decisión del autor.
- Se guardan en el celular, y solo ahí: la partida en curso (con los nombres), el sonido y la vibración, y si se descartó la guía de instalación. El aviso de privacidad de la app lo explica y dice cómo borrarlo.
- Las fuentes se sirven desde la propia app, no desde Google.
- Permisos del navegador: la app no pide cámara, micrófono ni ubicación. Usa vibración, bloqueo de pantalla y portapapeles solo al tocar un botón.

## Riesgos que se aceptan
- **Edad:** la advertencia +18 es una autodeclaración; no se puede verificar. Está dicho en el aviso.
- **Hosting:** Vercel, como cualquier servidor, puede registrar datos técnicos de las visitas (por ejemplo, la dirección IP). La app no recibe esos datos. Se retiró del aviso de la app el apartado sobre el sitio por decisión del autor.
- **Borrado automático en iPhone:** Safari puede borrar los datos de un sitio que no se usa en varios días si no está instalado en el inicio. Se pierde la partida guardada, nada más.
- **Contenido para adultos:** en tiendas de aplicaciones podría ser rechazado; por ahora solo se publica como PWA.

## Qué no se hizo
- Revisión legal del aviso de privacidad por un profesional (a criterio del autor).
- Prueba de penetración externa: no aplica a una app sin servidor ni cuentas.
