# PLAN1 — Tablero: plan de desarrollo

Versión 1 · 2026-11-04
Elaborado con los marcos de `cpo-advisor` (producto: visión, alcance, métricas) y `cto-advisor` / `cto-review` (arquitectura, ADRs, riesgos, build vs buy).
Documentos de contexto: `docs/reglas-del-juego.md` (reglas decididas por el autor) y `docs/casillas.md` (80 acciones del pack `base`).

Etiquetas de confianza: 🟢 verificado o decidido por el autor · 🟡 recomendación razonada · 🔴 supuesto a validar.

---

## A. Resumen ejecutivo

**Qué es:** juego de tablero por turnos para fiestas con alcohol y mayores de 18. Un solo celular pasa de mano en mano. Se tira un dado, se avanza por un tablero de 60 casillas y cada casilla nueva muestra una tarjeta con una acción que el grupo cumple fuera de la app. Gana quien completa primero las vueltas acordadas.

**Decisión de plataforma:** PWA instalable (React + Vite + TypeScript), sin backend, sin cuentas. Se despliega como sitio estático. Capacitor y tiendas quedan como opción posterior. 🟢

**Alcance de la v1:** configurar partida, jugar por turnos, ver el mapa (camino serpenteante más lista de posiciones), consultar el reglamento durante la partida, guardar la partida, instalar la app y usarla sin conexión, con advertencia +18. Nada más.

**Riesgo principal:** no es técnico. Es el contenido (+18, sexual, alcohol) frente a las políticas de las tiendas si algún día se publica ahí. La PWA lo evita. Ver sección H.

---

## B. Producto (visión CPO)

### B.1 Trabajo que resuelve (JTBD)
"Cuando estamos reunidos en una fiesta con alcohol, quiero un juego que ponga el ritmo y los retos por mí, para no tener que inventar qué hacer y que todos participen."

### B.2 Usuario
- Grupos de 2 a 12 personas, mayores de 18, en una fiesta o pre.
- Una persona (el anfitrión) abre la app. Los demás solo juegan.
- 🔴 Supuesto: casi todos los grupos usan un solo celular. Si piden que cada quien use el suyo, es una versión 2 (multijugador).

### B.3 Métrica estrella
**Partidas completadas por semana** (se llegó a la pantalla de ganador). 🟡
Métricas de apoyo: partidas iniciadas, % que llega al final, instalaciones de la PWA, duración media.
La app no recopila nombres ni datos personales. Cualquier analítica debe ser agregada y sin identificadores.

### B.4 Qué entra y qué no

| Entra en v1 | Fuera de v1 |
|---|---|
| Setup: jugadores, nombres, vueltas | Packs temáticos (alberca, Halloween, cumpleaños) |
| Sorteo de 60 casillas entre las 80 `base` | Multijugador en línea o un celular por jugador |
| Dado y turnos | Cuentas, ranking global, anuncios, pagos |
| Tarjeta de acción en cada casilla | Editor de casillas propias |
| Casillas de movimiento con validaciones | Versión sin alcohol |
| Mapa completo con posición de todos | Publicación en tiendas |
| Guardado y reanudación de partida | Voces o narración |
| PWA instalable y offline | |
| Advertencia +18 y consumo responsable | |
| Reglamento consultable en cualquier momento de la partida | |

### B.5 Criterio de éxito de la v1 🟡
Un grupo nuevo puede, sin explicación, abrir un link, agregar jugadores y terminar una partida de 2 vueltas con 4 personas en iPhone y Android, y la partida se puede retomar si se cierra el navegador.

---

## C. Decisiones de arquitectura (ADRs)

Cada una se guardará como archivo en `docs/adr/` (formato: contexto, opciones, decisión, consecuencias).

| ADR | Decisión | Alternativa descartada | Reversibilidad |
|---|---|---|---|
| 001 | **PWA primero**, Capacitor después si pega 🟢 | Apps nativas desde cero | Alta: el mismo código se envuelve con Capacitor |
| 002 | **React + Vite + TypeScript + Tailwind** 🟡 | Flutter, Svelte | Media |
| 003 | **Zustand + `localStorage`** para estado y guardado 🟡 | Backend o base de datos | Alta |
| 004 | **`vite-plugin-pwa`** (Workbox) para offline e instalación 🟡 | Service worker manual | Alta |
| 005 | **Contenido en JSON con esquema validado**, fuera de los componentes 🟢 | Textos dentro del código | Alta |
| 006 | **Motor de juego puro y separado de la UI**, con RNG inyectable (semilla) 🟡 | Lógica dentro de componentes | Alta |
| 007 | **Hosting estático** (Vercel, Netlify o Cloudflare Pages) 🟡 | Servidor propio | Alta |

Build vs buy: se compra o reutiliza todo lo que no es propiedad intelectual (bundler, PWA, estado, pruebas). Lo propio es el contenido, las reglas y la experiencia de fiesta.

---

## D. Diseño técnico

### D.1 Estructura propuesta
```
Tablero/
  docs/                 casillas.md, reglas-del-juego.md, adr/
  src/
    engine/             lógica pura: tablero, turnos, movimiento, victoria
    content/            base.json (80 acciones), esquema y validador
    store/              Zustand + persistencia
    ui/                 pantallas y componentes
    pwa/                registro del service worker, aviso de actualización
  tests/                unitarias (Vitest) y e2e (Playwright)
  .claude/skills/       pwa-development, playwright-skill
```

### D.2 Modelo de datos
```ts
type Action = {
  id: string;             // "base-014"
  text: string;           // texto de la tarjeta, tal cual docs/casillas.md
  pack: "base" | string;  // "base" hoy; "alberca", "halloween" en el futuro
  kind: "drink" | "dare" | "truth" | "movement";
  effect?: { type: "back"; steps: number } | { type: "toLapStart" };
};

type Player = { id: string; name: string; lap: number; position: number }; // position 0 = salida, 1..60 = casillas; lap = vuelta en curso (empieza en 1)
type Game = { board: Action[]; players: Player[]; laps: number; turn: number; rngSeed: number; status: "playing" | "finished" };
```

### D.3 Reglas del motor 🟢 (de `docs/reglas-del-juego.md`)
- Cada vuelta tiene 60 casillas. La posición 0 es la salida y no tiene tarjeta.
- Se sortean 59 acciones al azar más "VUELVE A LA SALIDA" (de las 80), sin repetir, y el orden queda fijo durante la partida.
- Retroceder N casillas: se mueve N posiciones atrás y se muestra la tarjeta de la casilla de llegada. El efecto de la casilla de llegada no se encadena porque el tablero lo impide.
- Vuelve a la salida: la posición vuelve a 0 en la vuelta actual. No se pierden vueltas.
- Ganar: se gana al **pasar o llegar** a la meta de la última vuelta; no hace falta caer en la casilla exacta. 🟢
- La casilla "VUELVE A LA SALIDA" **siempre** forma parte del tablero y se coloca en una de las **últimas 20 casillas** (posiciones 41 a 60). 🟢
- Los retrocesos de 5 y 10 casillas son del sorteo normal: pueden salir los dos, uno o ninguno. 🟢
- La casilla del dado ("TIREN EL DADO, LOS NUMEROS IMPARES TOMAN") **se eliminó** del juego. Quedan 80 acciones `base`. 🟢
- Validaciones al generar el tablero:
  1. Todo retroceso (5 o 10) está en la posición 11 o superior.
  2. El destino de un retroceso (posición − N) no es otra casilla de movimiento, incluida "VUELVE A LA SALIDA".
  3. "VUELVE A LA SALIDA" está entre las posiciones 41 y 60.
- Algoritmo sugerido 🟡: barajar con semilla; colocar primero "VUELVE A LA SALIDA" en una posición válida del rango 41-60; sortear el resto de las 59 casillas entre las 79 acciones restantes; colocar los retrocesos que hayan salido en posiciones válidas; verificar las tres reglas y reintentar si falla. Se prueba con miles de semillas.

### D.4 Decisiones de regla cerradas 🟢 (2026-11-04)
1. **Meta:** se gana al pasar la meta, sin casilla exacta.
2. **Casillas de movimiento:** "VUELVE A LA SALIDA" siempre sale, en las últimas 20 casillas. Los retrocesos de 5 y 10 salen por azar.
3. **Casilla del dado:** eliminada. Ya no hay tiro de dado dentro de las tarjetas.
4. **Pasar retos:** la app no tiene botón "pasar" ni registra si alguien se saltó una acción. La tarjeta solo tiene el botón **Continuar**, que avanza al siguiente turno. Las consecuencias y el límite de retos que se puede saltar un jugador van en el **reglamento**.
5. **Orden de turnos:** es el orden de alta, que debe coincidir con el orden de asientos. Empieza un jugador elegido al azar.
7. **Dado:** uno de 6 caras, un tiro por turno, sin extras.
8. **Casilla 60:** casilla normal con tarjeta. La vuelta se completa al rebasarla; en la última vuelta, llegar a la 60 o pasarla gana (el ganador ve primero la tarjeta de la casilla 60, sin aplicar su efecto; al pulsar Continuar aparece el aviso de fin de partida y la tabla de posiciones).
9. **Límites:** de 2 a 30 jugadores; mínimo 1 vuelta, sin máximo definido (tope técnico alto, por ejemplo 99).
10. **Advertencia +18:** cada vez que se abre la app.
11. **Deshacer:** no hay en la v1.
12. **Retroceso:** dos tarjetas seguidas (la del retroceso y la de la casilla de llegada).
13. **Jugadores en partida:** se pueden sacar y agregar. El nuevo empieza en la posición 0 de la vuelta donde esté la mayoría de los jugadores activos. Detalles menores se confirman en el hito 3.9.
6. **Marca:** se trabaja con el nombre "Tablero" por ahora. Logo y dominio se deciden en la Fase 5.

### D.4.1 Reglamento dentro de la app
- Pantalla o panel de **Reglamento** accesible en cualquier momento de la partida (botón fijo, sin perder el turno ni el estado).
- Contenido: el autor lo define más adelante. Ahí se especificará, por ejemplo, que saltarse retos tiene consecuencias y el límite de saltos por jugador.
- Técnicamente el reglamento es un documento aparte (`src/content/reglamento.md` o `.json`), editable sin tocar componentes, igual que las casillas.
- Hasta que el autor lo escriba se usa un texto provisional.

### D.5 Pantallas
1. **Advertencia +18:** confirmación explícita y texto de consumo responsable, cada vez que se abre la app.
2. **Configurar partida:** número de vueltas (mínimo 1), jugadores en el orden en que están sentados (con la indicación visible), de 2 a 30. El primer jugador se elige al azar al empezar.
2b. **Gestionar jugadores en partida:** sacar y agregar jugadores sin perder el estado.
3. **Turno:** jugador actual, dado animado, avance de ficha.
4. **Tarjeta de casilla:** texto grande y un único botón **Continuar**, que pasa al siguiente turno. No hay botón "pasar" ni registro de retos saltados.
5. **Mapa completo:** camino serpenteante con las 60 casillas y las fichas de cada jugador, más una **lista de posiciones** (jugador, vuelta y casilla, ordenada de primero a último).
5b. **Reglamento:** accesible desde cualquier pantalla de la partida sin perder el estado.
6. **Fin de partida:** ganador, ranking, "jugar otra vez" (con tablero nuevo).
7. **Continuar partida guardada.**

### D.6 Requisitos no funcionales
- Funciona sin conexión después de la primera carga.
- Rinde bien en celulares de gama baja. Las animaciones respetan `prefers-reduced-motion`.
- Pantalla vertical primero. Botones grandes. Contraste suficiente.
- Texto fácil de leer a distancia y con poca luz (tema oscuro por defecto 🟡).
- Pantalla encendida durante la partida (Wake Lock API, con respaldo si no está disponible).
- Cero datos personales fuera del dispositivo.

---

## E. Roadmap por bloques e hitos

El trabajo se hace en varias sesiones. Está dividido en **bloques** (1 a 7) y cada bloque en **hitos** pequeños numerados (1.1, 1.2, 2.1...). Cada hito es una unidad de trabajo que cabe en una sesión corta, tiene una entrega concreta y un criterio para darlo por terminado.

**Numeración:** las secciones del documento usan letras (A a K) y los hitos usan números (1.1, 2.2...), para que "punto 2.2" siempre signifique el hito.

**Cómo retomar:** decir, por ejemplo, "continuemos con el punto 2.2". Al empezar se leen `PLAN1.MD`, `docs/reglas-del-juego.md` y `docs/casillas.md`, se hace solo ese hito, se prueba, se marca como terminado en la tabla de progreso (al final de esta sección) y se anota cualquier decisión nueva.

**Reglas de trabajo:**
- Un hito a la vez. No se adelanta trabajo de hitos posteriores.
- Si un hito necesita una decisión del autor, se pregunta antes de empezar.
- Un hito termina cuando su entrega existe y sus pruebas pasan.
- Las semanas son estimaciones para un ritmo parcial.

Leyenda: **Entrega** = qué queda hecho. **Depende de** = hitos que deben estar terminados antes.

---

### Bloque 1 — Fundamentos (semana 1)

- **1.1 Proyecto base.** Crear el proyecto Vite + React + TypeScript + Tailwind, ESLint, Prettier y `git init`. Entrega: `npm run dev` abre una página vacía. Depende de: nada.
- **1.2 Pruebas unitarias.** Configurar Vitest con una prueba de humo. Entrega: `npm test` en verde. Depende de: 1.1.
- **1.3 Pruebas e2e.** Configurar Playwright con proyectos móviles (iPhone y Pixel) y una prueba de humo. Entrega: `npx playwright test` en verde. Depende de: 1.1.
- **1.4 ADRs 001 a 004.** Escribir en `docs/adr/` PWA primero, stack, estado y guardado, y vite-plugin-pwa. Entrega: 4 archivos ADR. Depende de: nada.
- **1.5 ADRs 005 a 007.** Contenido en JSON, motor separado de la UI, hosting estático. Entrega: 3 archivos ADR. Depende de: nada.
- **1.6 Esquema del contenido.** Tipos TypeScript de `Action` y un validador (por ejemplo con Zod). Entrega: `src/content/schema.ts` con pruebas. Depende de: 1.2.
- **1.7 Contenido base.** Convertir `docs/casillas.md` en `src/content/base.json` con 80 acciones (sin la casilla 47), categoría de cada una y los 3 efectos de movimiento marcados. Entrega: JSON que pasa el validador, con una prueba que confirma 80 acciones y 3 de movimiento. Depende de: 1.6.
- **1.8 Reglamento provisional.** Crear `src/content/reglamento.md` con texto provisional. Entrega: archivo listo para que el autor lo reemplace. Depende de: 1.1.
- **1.9 Despliegue y CI.** Hosting estático y un flujo que corre las pruebas en cada cambio. Entrega: URL pública y CI en verde. Depende de: 1.2, 1.3.

### Bloque 2 — Motor del juego (semanas 2-3)

Todo con lógica pura, sin interfaz.

- **2.1 Tipos y azar con semilla.** Tipos `Game`, `Player`, `Board` y un generador de números aleatorios con semilla. Entrega: `src/engine/types.ts` y `rng.ts` con pruebas. Depende de: 1.7.
- **2.2 Sorteo de 60 casillas.** Elegir 60 acciones de 80 sin repetir, siempre con "VUELVE A LA SALIDA". Entrega: función con pruebas. Depende de: 2.1.
- **2.3 Colocación y validaciones.** Ordenar el tablero cumpliendo las tres reglas (retrocesos desde la posición 11, ningún retroceso termina en otra casilla de movimiento, "VUELVE A LA SALIDA" entre las posiciones 41 y 60) con reintento. Entrega: generador de tablero completo. Depende de: 2.2.
- **2.4 Pruebas de propiedades.** Verificar las reglas en 10 000 semillas. Entrega: prueba que falla si cualquier tablero rompe una regla. Depende de: 2.3.
- **2.5 Dado, turnos y vueltas.** Un dado de 6 sin extras, jugador inicial al azar (con la semilla), avanzar, pasar al siguiente jugador y cambiar de vuelta al rebasar la casilla 60 (caer exactamente en la 60 no completa la vuelta; el sobrante se cuenta desde la salida). Entrega: funciones con pruebas, incluidos los casos de caer en la 60 y de rebasarla. Depende de: 2.3.
- **2.6 Efectos de movimiento.** Retroceder 5 o 10 (devuelve la casilla de llegada) y volver al inicio de la vuelta actual. Entrega: función con pruebas de los casos límite. Depende de: 2.5.
- **2.7 Victoria y ranking.** Ganar al llegar a la 60 o pasarla en la última vuelta y ordenar a los jugadores. Entrega: función con pruebas, incluidos llegar justo a la 60 y rebasarla, y que el ganador vea la tarjeta de la 60 antes de terminar. Depende de: 2.5.
- **2.8 Guardado del estado.** Serializar y cargar la partida, con control de versión del formato. Entrega: funciones con pruebas de ida y vuelta. Depende de: 2.3.
- **2.9 Cierre del bloque.** Revisión con `code-review` y `simplify`, actualizar ADRs si algo cambió. Entrega: motor revisado y documentado. Depende de: 2.4 a 2.8.

### Bloque 3 — Partida jugable (semanas 4-5)

Interfaz mínima, sin diseño final.

- **3.1 Estructura de la app.** Navegación entre pantallas y store Zustand conectado al motor. Entrega: la app cambia de pantalla según el estado de la partida. Depende de: 2.9.
- **3.2 Advertencia +18.** Pantalla con confirmación de mayoría de edad y mensaje de consumo responsable, que aparece cada vez que se abre la app. Entrega: pantalla que bloquea el acceso hasta confirmar, sin recordar la confirmación entre sesiones. Depende de: 3.1.
- **3.3 Configurar partida.** Número de vueltas y jugadores, con la indicación de agregarlos en el orden de asientos, de 2 a 30 jugadores y mínimo 1 vuelta (tope técnico alto, por ejemplo 99). Entrega: pantalla que crea una partida. Depende de: 3.1.
- **3.4 Pantalla de turno.** Jugador actual, botón de dado y avance de la ficha. Entrega: se juega un turno. Depende de: 3.3.
- **3.5 Tarjeta de casilla.** Tarjeta con el texto y el botón **Continuar**, que pasa al siguiente turno. En un retroceso se muestran la tarjeta del retroceso y después la de la casilla de llegada. Entrega: tarjeta funcionando en todos los casos. Depende de: 3.4.
- **3.6 Reglamento en la partida.** Pantalla o panel accesible desde cualquier punto sin perder el estado. Entrega: botón fijo que abre `reglamento.md`. Depende de: 3.4.
- **3.7 Guardado automático y continuar.** Guardar tras cada turno y ofrecer "continuar partida" al abrir. Entrega: cerrar y abrir el navegador retoma la partida. Depende de: 3.4.
- **3.8 Fin de partida.** Cuando alguien gana se muestra primero la tarjeta de la casilla 60; al pulsar Continuar aparece el aviso de que terminó la partida con la tabla de posiciones (ranking) y "jugar otra vez" con tablero nuevo. Entrega: pantalla final. Depende de: 3.5.
- **3.9 Sacar y agregar jugadores en partida.** Función pura del motor (con pruebas) y pantalla para retirar jugadores y agregar nuevos. El jugador nuevo empieza en la posición 0 de la vuelta donde esté la mayoría de los jugadores activos. Antes de empezar, confirmar con el autor los detalles menores (empate de vueltas, lugar en el orden de turnos, mínimo de 2 jugadores, qué pasa si se saca al jugador en turno). Entrega: se puede cambiar la lista sin perder la partida. Depende de: 3.4, 3.7.
- **3.10 Prueba e2e y cierre.** Partida completa automatizada en viewport móvil (incluye retroceso, cambio de jugadores y reanudar) y revisión del bloque. Entrega: prueba e2e en verde. Depende de: 3.2 a 3.9.

### Bloque 4 — Mapa y experiencia de fiesta (semanas 6-7)

- **4.1 Estilo visual.** El autor define paleta, tipografía y tono (decisión pendiente). Entrega: guía de estilo breve. Depende de: nada. Requiere decisión del autor.
- **4.2 Sistema de diseño base.** Colores, tipografía grande, tema oscuro y componentes comunes. Entrega: tokens y componentes aplicados a las pantallas existentes. Depende de: 4.1.
- **4.3 Mapa: camino serpenteante.** Dibujar las 60 casillas en filas que van y vienen. Entrega: mapa que se ve bien en pantalla vertical. Depende de: 4.2.
- **4.4 Mapa: fichas y vueltas.** Mostrar la ficha de cada jugador y su vuelta. Entrega: mapa con posiciones reales. Depende de: 4.3.
- **4.5 Lista de posiciones.** Lista de jugadores con vuelta y casilla, ordenada de primero a último. Entrega: lista junto al mapa. Depende de: 4.3.
- **4.6 Animación del dado y de la ficha.** Entrega: dado animado y avance de ficha, respetando `prefers-reduced-motion`. Depende de: 4.4.
- **4.7 Animación de tarjetas.** Aparición de la tarjeta y transiciones entre pantallas. Entrega: transiciones fluidas. Depende de: 4.2.
- **4.8 Sonido y vibración.** Opcionales, con interruptor. Entrega: efectos básicos. Depende de: 4.6.
- **4.9 Pantalla siempre encendida.** Wake Lock con alternativa si el navegador no lo soporta. Entrega: la pantalla no se apaga durante la partida. Depende de: 3.4.
- **4.10 Pulido y prueba con un grupo.** Revisión visual completa y una partida real. Entrega: lista de ajustes aplicados. Depende de: 4.3 a 4.9.

### Bloque 5 — PWA y calidad (semana 8)

- **5.1 Manifest e íconos.** Entrega: la app se puede instalar. Depende de: 4.2.
- **5.2 Service worker y offline.** Entrega: la app abre sin conexión después de la primera carga. Depende de: 5.1.
- **5.3 Guía de instalación.** Aviso en pantalla de cómo instalar en iOS y Android. Entrega: guía visible cuando aplica. Depende de: 5.1.
- **5.4 Aviso de actualización.** Entrega: la app avisa cuando hay una versión nueva sin perder la partida. Depende de: 5.2.
- **5.5 Accesibilidad.** Pruebas con axe-core y correcciones. Entrega: sin errores graves. Depende de: 4.10.
- **5.6 Rendimiento y tamaño.** Meta: primera carga menor a 300 KB comprimidos y Lighthouse de 90 o más. Entrega: reporte y ajustes. Depende de: 5.2.
- **5.7 Dispositivos reales.** Probar en iPhone y Android reales. Entrega: lista de problemas y correcciones. Depende de: 5.2, 5.5.
- **5.8 E2E sin conexión.** Entrega: prueba que juega una partida sin red. Depende de: 5.2.
- **5.9 Revisión de seguridad y privacidad.** Con `security-review` y `ciso-review`. Entrega: informe y correcciones. Depende de: 5.7.

### Bloque 6 — Lanzamiento (semana 9)

- **6.1 Reglamento final.** El autor escribe el contenido y se integra. Entrega: `reglamento.md` definitivo. Requiere decisión del autor.
- **6.2 Aviso legal y privacidad.** Texto breve; revisión con un profesional recomendada. Entrega: página incluida en la app. Depende de: 5.9.
- **6.3 Nombre, logo y dominio.** Entrega: marca aplicada y dominio conectado. Requiere decisión del autor.
- **6.4 Código QR y publicación.** Entrega: versión 1.0 en producción. Depende de: 6.1 a 6.3.
- **6.5 Analítica agregada (opcional).** Sin nombres ni datos personales. Entrega: contador de partidas completadas. Depende de: 6.4.
- **6.6 Prueba con grupos reales.** Tres grupos y lista de correcciones. Entrega: informe y ajustes. Depende de: 6.4.

### Bloque 7 — Expansión (después de la v1)

Sin hitos detallados todavía. Se numeran cuando se decida hacerlos.
- Selector de packs al crear la partida (alberca, Halloween, cumpleaños).
- Versión sin alcohol.
- Capacitor y tiendas, si las políticas lo permiten.
- Multijugador, solo si hay demanda.

---

### Tabla de progreso

Marcar con ✅ al terminar cada hito y anotar la fecha. ⬜ = pendiente, 🔄 = en curso.

| Hito | Estado | Fecha | Notas |
|---|---|---|---|
| 1.1 | ✅ | 2026-11-04 | Vite 8, React 19, TS, Tailwind 4, Prettier. Linter oxlint (de la plantilla) en vez de ESLint. Scripts: dev, build, lint, typecheck, format. git init hecho, sin commits. |
| 1.2 | ✅ | 2026-11-04 | Vitest; scripts test y test:watch; pruebas en tests/unit y src. |
| 1.3 | ✅ | 2026-11-04 | Playwright con proyectos iphone (WebKit, iPhone 14) y pixel (Chromium, Pixel 7); webServer build + preview en puerto 4173; script test:e2e. 2 pruebas de humo en verde. |
| 1.4 | ✅ | 2026-11-04 | ADR 001 a 004 en docs/adr/. |
| 1.5 | ✅ | 2026-11-04 | ADR 005 a 007 en docs/adr/. Hosting concreto se decide en 1.9. |
| 1.6 | ✅ | 2026-11-04 | src/content/schema.ts (Zod) con 10 pruebas. |
| 1.7 | ✅ | 2026-11-04 | src/content/base.json (80 acciones, ids base-NNN con el número original; falta el 047) e index.ts. Tipos asignados por mí (drink 40, dare 27, truth 10, movement 3): el autor puede corregirlos. 4 pruebas, incluida una que compara el texto con docs/casillas.md. |
| 1.8 | ✅ | 2026-11-04 | src/content/reglamento.md provisional. |
| 1.9 | ✅ | 2026-11-04 | CI en verde en GitHub (.github/workflows/ci.yml). Desplegado en Vercel desde el repo EduardoRubioSuarez/Tablero; la página muestra el texto "Tablero". Bloque 1 completo. |
| 2.1 | ✅ | 2026-11-04 | src/engine/types.ts (tipos, constantes y límites), rng.ts (mulberry32 con semilla, shuffle, generateSeed). 10 pruebas. |
| 2.2 | ✅ | 2026-11-04 | selectActions en src/engine/board.ts: 59 al azar + una VUELVE A LA SALIDA. 5 pruebas. |
| 2.3 | ✅ | 2026-11-04 | buildBoard (colocación con reintento) y validateBoard (independiente, también sirve para partidas guardadas). Pruebas con tableros hechos a mano. |
| 2.4 | ✅ | 2026-11-04 | 10 000 semillas: sin violaciones, VUELVE A LA SALIDA usa las 20 posiciones, salen 0, 1 y 2 retrocesos. Tarda ~2 s. |
| 2.5 | ✅ | 2026-11-04 | src/engine/game.ts: createGame (2 a 30 jugadores, 1 a 99 vueltas, inicia uno al azar), rollDice (d6 sin extras, 60 normal, rebasar pasa de vuelta), continueTurn. Fases roll, card y finished. Inmutable y determinista. |
| 2.6 | ✅ | 2026-11-04 | Retroceso en dos tarjetas (la ficha se mueve al continuar la primera) y VUELVE A LA SALIDA a la posición 0 de la vuelta actual. |
| 2.7 | ✅ | 2026-11-04 | Gana en la última vuelta al llegar o pasar la 60; getRanking con empates compartidos. Simulación de 150 partidas completas sin violaciones. Total: 78 pruebas. |
| 2.8 | ✅ | 2026-11-04 | src/engine/persistence.ts: serializeGame y deserializeGame (Zod más validación cruzada, nunca lanza; versión de formato 1). 18 pruebas, incluidas partidas manipuladas. Total: 96 pruebas. |
| 2.9 | ✅ | 2026-11-04 | Revisión con el skill code-review (8 hallazgos) y arreglos: semilla validada, guardado con validación cruzada (tarjeta vs. jugador en turno, ganador en la meta, nombres en blanco), retrocesos largos, mensaje de error del tablero, tsconfig.test.json solo para tests. Nueva regla: el ganador ve la tarjeta de la 60 y la partida termina al pulsar Continuar. vitest actualizado a 5.1.0 (0 vulnerabilidades). 107 pruebas. Falta 3.9: agregar y sacar jugadores. |
| 3.1 | ✅ | 2026-11-04 | src/store/gameStore.ts (Zustand, fábrica con dependencias inyectables), setup.ts, storage.ts; src/App.tsx cambia de pantalla según el estado. ?seed=N en la URL fija la semilla (depuración y e2e). |
| 3.2 | ✅ | 2026-11-04 | AgeWarning y AgeDenied; aparece en cada apertura. |
| 3.3 | ✅ | 2026-11-04 | Setup: vueltas, jugadores con subir, bajar y quitar, aviso del orden de asientos, 2 a 30 jugadores. |
| 3.4 | ✅ | 2026-11-04 | Table: jugador en turno, casilla, dado y botón Tirar dado. |
| 3.5 | ✅ | 2026-11-04 | CardView con botón Continuar, dos tarjetas en retroceso, tarjeta del ganador sin aplicar efecto. |
| 3.6 | ✅ | 2026-11-04 | RulesModal con Markdown propio (sin HTML crudo); Escape y Cerrar; no altera la partida. |
| 3.7 | ✅ | 2026-11-04 | Guardado tras cada acción; Continuar o descartar en Inicio; aviso si el guardado estaba dañado o el navegador no deja guardar. |
| 3.8 | ✅ | 2026-11-04 | Results: aviso de fin, tabla de posiciones con empates compartidos, Jugar otra vez; borra el guardado. 26 pruebas e2e (iPhone y Pixel) y 127 unitarias en verde. |
| 3.9 | ✅ | 2026-11-04 | src/engine/players.ts (addPlayer, removePlayer, majorityLap) y PlayersModal. Decisiones del autor: empate de vueltas va a la menor; el nuevo entra al final de los turnos; mínimo 2; si se saca al jugador en turno pasa al siguiente. Solo se permite antes de tirar el dado. 22 pruebas unitarias nuevas y 4 e2e. |
| 3.10 | ✅ | 2026-11-04 | Revisión con el skill code-review (8 hallazgos): corregidos lastRoll al sacar al jugador en turno, error obsoleto en Setup, avisos obsoletos al continuar, roll con transición a resultados, nombres repetidos (se bloquean, sin distinguir mayúsculas), paneles con foco devuelto, Escape y fondo inerte. Sin corregir: el guardado sigue en disco tras continuar (latente, solo importaría si se agrega volver al inicio durante la partida) y la trampa de foco completa con Tab. Bloque 3 completo: 154 pruebas unitarias y 46 e2e (iPhone y Pixel). |
| 4.1 | ✅ | 2026-11-04 | Guía en docs/guia-de-estilo.md: mundo "Mesa de bar" (azul laca, amarillo, casillas blancas con canto), mapa 3D con cámara que sigue al turno, tira de 60 casillas, lista que enfoca y Ver todo con deslizado, íconos nuevos de contorno grueso (se descartan las ilustraciones originales), tarjeta Estallido quieta con confeti, sin número ni etiqueta de tipo. Tipografía Bowlby One y Figtree. Pendiente: confirmar si el color de la tarjeta va por tipo, y dibujar los íconos de las 80 acciones. Se creó PRODUCT.md. |
| 4.2 | ✅ | 2026-11-04 | Sistema de diseño en src/index.css (tokens Tailwind 4: laca, sol, rosa, cian; Bowlby One y Figtree alojadas en la app con @fontsource, solo subconjunto latino), Button, paneles y todas las pantallas restiladas. 80 ilustraciones de contorno grueso (src/ui/iconDrawings.tsx, iconMap.ts, icons.tsx) con prueba de que cada acción tiene su ícono. Detector de diseño de Impeccable sin hallazgos. ADR 008. |
| 4.3 | ✅ | 2026-11-04 | Mapa en 3D (src/ui/map/): salida, 60 casillas en camino serpenteante de 6 columnas con su ilustración, meta, canto de laca y perspectiva. Panel Mapa desde el botón de la partida. Cámara que sigue al jugador, deslizado con dedo, rueda y flechas, y Ver todo (inclinación 16 grados). 12 pruebas unitarias de geometría. |
| 4.4 | ✅ | 2026-11-04 | Peones de pie con sombra y un color por jugador (30 colores distintos, fijos por id aunque cambie la lista); el turno lleva aro amarillo. Hasta 2 por casilla y 6 en la salida, el resto con un "+n". La vuelta de cada jugador se ve en la lista. |
| 4.5 | ✅ | 2026-11-04 | Tira de 60 casillas con un punto por jugador y un marco que sigue a la cámara (también en la pantalla de turno), y lista de posiciones de primero a último con vuelta y casilla; tocar un nombre enfoca su ficha. Empates comparten lugar. |
| 4.6 | ✅ | 2026-11-04 | Dado en 3D que rueda y cae en el número real (se calcula antes con la misma semilla) y fichas que caminan casilla por casilla, con salto. Retrocesos y volver a la salida saltan directo. Sin animación con "reducir movimiento". Ajuste posterior: el número que cae en la cara de arriba del dado es la cantidad de casillas que avanza la ficha. |
| 4.7 | ✅ | 2026-11-04 | Tarjeta Estallido (medalla con rayos giratorios, ilustración, listón de estrellas, confeti que cae), de tamaño fijo, sin número de casilla ni etiqueta de tipo; el color del listón va por tipo de acción (propuesto, sin confirmar). Entradas animadas de tarjeta, pantallas y paneles. Pruebas e2e: mismo tamaño, sin scroll, Continuar libre. |
| 4.8 | ✅ | 2026-11-04 | Sonido sintetizado con Web Audio (sin archivos) y vibración, con interruptores en la partida que se recuerdan al reabrir. Por defecto activados. Señales: dado, caída, tarjeta, movimiento y victoria. |
| 4.9 | ✅ | 2026-11-04 | Wake Lock (src/ui/wakeLock.ts): se pide al entrar a la partida, se vuelve a pedir al regresar a la pestaña y se libera al salir. Si el navegador no lo tiene, avisa para ajustar el apagado automático. Probado con simulaciones (unitarias y e2e); no verificado en un celular real. |
| 4.10 | 🔄 | 2026-11-04 | Revisión visual hecha en 320, 390 y escritorio, con 3 y 30 jugadores, tarjetas largas, ganador y resultados. Ajustes: tarjeta y pantalla de turno compactas en pantallas bajitas (sin scroll en 320 × 568), perspectiva del mapa menos exagerada, fondo sin attachment fixed y confeti apagado con movimiento reducido (WebKit iba 5 veces más lento). Falta la partida real con un grupo, que solo puede hacer el autor. Ajustes pedidos después: botón Reglas en el inicio y Ayuda (solo aclaraciones) en la partida, Terminar partida desde Jugadores, borde amarillo de la lista del mapa sin cortar, y sonido más fuerte con una muestra al activarlo (la vibración se desactiva donde el dispositivo no puede). |
| 5.1 | ✅ | 2026-11-04 | Manifest generado por vite-plugin-pwa 2.0 (nombre, colores, modo app, vertical, español) e íconos propios: una "T" amarilla con canto sobre el azul (public/icon.svg, PNG de 192, 512 y maskable, y el de iPhone con `npm run icons`). Los íconos son provisionales: el logo final se decide en el hito 6.3. Pruebas e2e del manifest y de los íconos. |
| 5.2 | ✅ | 2026-11-04 | Service worker con precaché de toda la app (registerType prompt, solo woff2). Se probó con el navegador sin red: recarga, partida de 6 turnos, mapa, ayuda y reanudar. Las fuentes y los íconos también salen de la caché. |
| 5.3 | ✅ | 2026-11-04 | Guía en el inicio: botón Instalar donde el navegador lo ofrece, pasos del menú Compartir en iPhone y del menú del navegador en Android; se puede descartar y se recuerda, y no aparece si la app ya está instalada. 7 pruebas unitarias de la lógica y 2 e2e. |
| 5.4 | ✅ | 2026-11-04 | Aviso "Hay una versión nueva" dentro de la pantalla (inicio y partida) con Actualizar o Después; nada se aplica solo. Aviso de "Lista para jugar sin conexión" que se quita solo. Probado el almacén de avisos con pruebas unitarias; no se probó una actualización real entre dos versiones publicadas. |
| 5.5 | ✅ | 2026-11-04 | axe-core en 12 pruebas (iPhone y Pixel) sobre advertencia, inicio, reglas, configurar, turno, tarjeta (larga y de movimiento), ayuda, jugadores, mapa y resultados: 0 problemas. Corregido: el texto desplazable de Ayuda y Reglamento ahora se enfoca con el teclado. Se hizo antes de cerrar el 4.10 (falta la partida real); si ese hito cambia pantallas, se repite. |
| 5.6 | ✅ | 2026-11-04 | Lighthouse móvil: rendimiento 96, accesibilidad 100, mejores prácticas 100, SEO 91 (se agregó robots.txt). Primera carga de 167 KB comprimidos, con `npm run size` en la integración continua (límite 300 KB). Reporte en docs/rendimiento.md. |
| 5.7 | ⬜ | | Solo la puede hacer el autor con celulares reales. Lista de pasos lista en docs/pruebas-en-dispositivos.md. |
| 5.8 | ✅ | 2026-11-04 | Prueba e2e que juega sin red en iPhone y Pixel (ver 5.2), y prueba de que una partida completa no hace ninguna petición fuera de la propia app. |
| 5.9 | ⬜ | | Depende del 5.7. Adelantado: la prueba automática de que no sale ningún dato de la app y la revisión de dependencias (0 vulnerabilidades en lo que se entrega; 6 en herramientas de compilación de Workbox, sin arreglo sin bajar de versión). Falta la revisión con security-review y ciso-review. |
| 6.1 | ✅ | 2026-11-05 | Reglamento (src/content/reglamento.md): cómo se juega, reglas (casillas especiales, 2 vidas para evitar acciones con 2 segundos de trago y recuperación bebiendo una bebida completa de golpe, aclaraciones) y recomendaciones. Ayuda (src/content/ayuda.md): situaciones y disputas. Texto escrito con el autor; puntos confirmados por el autor; la app no guarda ni recuerda las vidas, eso depende de la mesa. Leído y aprobado por el autor. |
| 6.2 | ✅ | 2026-11-05 | Aviso y privacidad (src/content/aviso.md) con botón en el inicio: para quién es, juego responsable, qué datos se guardan (solo en el celular), cómo borrarlos (sin nota de revisión ni sección sobre el sitio, por decisión del autor). La revisión con un profesional que recomienda el plan queda a criterio del autor. El hito 5.9 (revisión de seguridad) sigue pendiente. |
| 6.3 | ✅ | 2026-11-05 | Nombre "Tablero" definitivo.  Logo decidido por el autor: T amarilla de Titan One con confeti, solo para el ícono de la app y el favicon (el inicio conserva el dado y el título). El autor decidió no usar dominio propio: el juego se queda en la dirección de Vercel; más adelante, si lo ve viable, lo subirá a una plataforma para descargarlo. |
| 6.4 | 🔄 | 2026-11-05 | Botón "Comparte el juego" en el inicio: pantalla con el código QR (se genera en el celular con la dirección desde la que se abrió, así no hace falta saberla), enlace para copiar y botón Compartir donde el navegador lo permite. Cambio frente al plan: el QR es parte de la app, no una imagen para imprimir. La publicación 1.0 en Vercel espera el reglamento final (6.1). |
| 6.5 | ⬜ | | |
| 6.6 | ⬜ | | |

## F. Calidad y pruebas
- **Unitarias (Vitest):** motor, generador de tablero, guardado.
- **Propiedades:** para miles de semillas, el tablero cumple siempre las reglas de D.3.
- **E2E (Playwright):** flujo completo en iPhone y Pixel emulados, offline, reanudar partida.
- **Accesibilidad:** axe-core en las pantallas principales.
- **Manual:** una partida real por fase 3, 4 y 5.
- **Definición de terminado de una fase:** salida cumplida, pruebas en verde, sin errores de consola, ADR actualizados.

---

## G. Métricas de salud del proyecto (dashboard CTO) 🟡
| Métrica | Meta |
|---|---|
| Pruebas del motor | 100 % en verde antes de cada despliegue |
| Cobertura del motor | ≥ 90 % |
| Tamaño de la primera carga | < 300 KB comprimido |
| Lighthouse (PWA, rendimiento, accesibilidad) | ≥ 90 |
| Tiempo de la primera partida (setup a primera tarjeta) | < 60 s |
| Deuda técnica | Revisar al cierre de cada fase; ninguna deuda de motor pendiente |

---

## H. Riesgos

| # | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| 1 | Las políticas de Apple y Google restringen contenido sexual y alcohol; la app podría ser rechazada | Alta si se publica en tiendas 🟡 | Medio | Empezar como PWA; revisar políticas actuales antes de Capacitor; versión suavizada para tiendas si hace falta |
| 2 | La advertencia de edad es una autodeclaración, no una verificación | Cierta | Medio | Dejar claro en el texto; no prometer verificación; no dirigirse a menores; revisar obligaciones locales |
| 3 | iOS limita las PWA (almacenamiento, instalación manual) | Media | Bajo | Guía de instalación en pantalla; guardar siempre en `localStorage`; probar en iOS real |
| 4 | Un bug en las reglas de movimiento arruina la partida | Media | Alto | Motor puro, pruebas de propiedades con miles de semillas |
| 5 | El contenido genera quejas (acoso, presión a participar) | Media | Medio | Reglamento dentro de la app con las consecuencias y el límite de retos que se pueden saltar; texto de consentimiento en la advertencia inicial; en v2 packs más suaves |
| 6 | Alcance crece (multijugador, packs) antes de validar la v1 | Alta | Medio | Mantener la lista "fuera de v1" y revisar al cierre de cada fase |
| 7 | Cierre del navegador pierde la partida | Baja | Medio | Guardado automático tras cada turno |

Nota legal: este plan no es asesoría legal. La sección de edad, alcohol y contenido sexual debe revisarse con un profesional antes de promover el juego públicamente.

---

## I. Skills y herramientas por bloque

| Skill | Estado | Uso |
|---|---|---|
| `pwa-development` | Instalado en `.claude/skills/` | Fase 4 (manifest, service worker, iOS) |
| `playwright-skill` | Instalado en `.claude/skills/` | Fases 0 y 4 (e2e, móvil, accesibilidad) |
| `frontend-design`, `design-taste-frontend`, `impeccable` | Ya disponibles | Fases 2 y 3 (diseño visual) |
| `motion-dev-animations` | Ya disponible | Fase 3 (dado, fichas, tarjetas) |
| `cto-advisor`, `cto-review` | Ya disponibles | ADRs y revisión al cierre de fase |
| `code-review`, `simplify`, `security-review` | Ya disponibles | Cierre de fases 1, 2 y 4 |
| `ciso-review` | Ya disponible | Antes de lanzar: privacidad y contenido |

---

## J. Decisiones resueltas y pendientes

**Resueltas (2026-11-04, segunda ronda):** casilla 60 normal con vuelta al rebasar; un dado de 6 sin extras; empieza un jugador al azar; de 2 a 30 jugadores y mínimo 1 vuelta; advertencia +18 cada vez que se abre; sin deshacer en la v1; se pueden sacar y agregar jugadores en partida; retroceso con dos tarjetas seguidas.

**Resueltas (2026-11-04):** meta al pasar; "VUELVE A LA SALIDA" siempre presente en las últimas 20 casillas y retrocesos por azar; casilla del dado eliminada; sin botón "pasar" (solo Continuar) y reglas de saltos en el reglamento; mapa de camino serpenteante con lista de posiciones; nombre "Tablero" por ahora.

**Pendientes del autor:**
1. Contenido del reglamento (consecuencias de saltarse retos, límite de saltos por jugador y otras reglas). No bloquea el desarrollo: se usa texto provisional.
2. Nombre final, logo y dominio (Fase 5).
3. Estilo visual detallado: paleta, tipografía, tono (se define en la Fase 3).

## K. Próximo paso inmediato
Empezar el hito **1.1** (proyecto base). Para retomar en cualquier sesión, indicar el número de hito, por ejemplo "continuemos con el punto 2.2".
