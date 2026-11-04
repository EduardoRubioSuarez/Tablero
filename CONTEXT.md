# CONTEXT — Tablero

Documento de contexto para cualquier agente de IA que trabaje en este proyecto, aunque no tenga memoria de sesiones anteriores. **Léelo completo antes de hacer nada.** Después lee `PLAN1.MD` y los documentos de `docs/`.

Última actualización: 2026-11-04.

---

## 1. Qué es el proyecto

**Tablero** es un juego de fiesta por turnos, para mayores de 18 años y reuniones con alcohol. Un solo celular pasa de mano en mano. Los jugadores tiran un dado, avanzan por un tablero de 60 casillas y, al caer en una casilla nueva, la pantalla muestra una **tarjeta** con una acción (beber, reto, verdad, beso, etc.). Las acciones se cumplen fuera de la app, en la vida real. Gana quien primero completa todas las vueltas acordadas.

Se construye como **PWA** (app web instalable y que funciona sin conexión), para que se juegue en iOS y Android sin descargar nada de una tienda. No hay backend, ni cuentas, ni base de datos remota.

El autor del juego (el usuario) trabaja en el proyecto por sesiones separadas, a largo plazo. Habla español. No es necesariamente desarrollador experto: explícale las decisiones con claridad.

### Contenido sensible (importante)
El contenido del juego incluye alcohol y actividades de índole sexual, es para adultos y es legítimo. **No lo suavices, no lo censures y no lo reescribas.** Las 80 acciones se usan tal cual las escribió el autor, incluidas las faltas de ortografía y las abreviaturas (`L@S`, `SOLTER@S`). La app sí debe mostrar advertencias de edad y de consumo responsable (ver `docs/reglas-del-juego.md`, sección 4).

---

## 2. Dónde está cada cosa

| Archivo | Para qué sirve |
|---|---|
| `CONTEXT.md` | Este documento. Contexto general y procedimiento del agente. |
| `PLAN1.MD` | Plan maestro: producto, ADRs, diseño técnico, **hitos numerados**, tabla de progreso, riesgos. |
| `docs/reglas-del-juego.md` | Reglas del juego decididas por el autor. **Tiene prioridad** sobre cualquier otra nota. |
| `docs/casillas.md` | Las acciones originales del juego (81 escritas, la 47 está eliminada, quedan 80). Fuente de verdad del contenido. |
| `docs/adr/` | Registros de decisiones de arquitectura (ADR 001 a 007 escritos). |
| `src/` | Código: `content/` (esquema, base.json, reglamento.md) y la app base. `engine/`, `store/` y `ui/` se crean en los bloques 2 y 3. |
| `.claude/skills/pwa-development/` | Skill instalado: PWA, service workers, manifest, iOS. |
| `.claude/skills/playwright-skill/` | Skill instalado: pruebas e2e, móvil y accesibilidad con Playwright. |

Si dos documentos se contradicen, el orden de prioridad es: instrucciones del usuario en la sesión, `docs/reglas-del-juego.md`, `PLAN1.MD`, `docs/casillas.md`, este documento.

---

## 3. Reglas del juego (resumen; el detalle está en `docs/reglas-del-juego.md`)

- El tablero tiene **60 casillas por vuelta**. La posición 0 es la **salida** y no tiene tarjeta. Las posiciones 1 a 60 son casillas con tarjeta.
- Hay **80 acciones** en el pack `base`. Al iniciar cada partida se **sortean 60** al azar, sin repetir, y el orden queda **fijo** durante toda la partida.
- El grupo elige el número de **vueltas** (mínimo 1, sin máximo del autor) y los **jugadores** (de **2 a 30**) al crear la partida. Los jugadores se agregan **en el orden en que están sentados**. Las tarjetas dicen "izquierda", "derecha" y "frente a ti"; la app no calcula quién es, lo resuelve la mesa.
- **Empieza un jugador elegido al azar** y después el orden sigue la lista.
- Durante la partida se pueden **sacar y agregar jugadores**. Un jugador nuevo empieza en la posición 0 de la vuelta donde esté la mayoría de los jugadores activos.
- La advertencia +18 se muestra **cada vez que se abre la app**. La versión 1 **no tiene deshacer**.
- Un jugador por turno tira **un dado de 6 caras (sin tiros extra)**, avanza y se muestra la tarjeta de la casilla donde cae. La tarjeta tiene un único botón **Continuar**, que pasa al siguiente turno. **No hay botón de "pasar" y la app no registra retos saltados.**
- **Ganar:** gana quien primero **llega o pasa la meta de la última vuelta**. No hace falta caer en la casilla exacta.
- Hay un **reglamento** consultable en cualquier momento de la partida. Su contenido lo escribe el autor más adelante (ahí irán las consecuencias de saltarse retos y el límite de saltos). Mientras tanto se usa texto provisional.
- El mapa se ve como un **camino serpenteante**, más una **lista con la posición de cada jugador**.

### Casillas de movimiento (solo 3 de las 80)
| Acción | Efecto |
|---|---|
| RETROCEDE 5 CASILLAS | el jugador retrocede 5 posiciones y se muestra la tarjeta de la casilla de llegada |
| RETROCEDE 10 CASILLAS | igual, 10 posiciones |
| VUELVE A LA SALIDA | el jugador vuelve a la posición 0 **de la vuelta actual** (no pierde vueltas) |

Validaciones obligatorias al generar el tablero:
1. Los retrocesos (5 y 10) solo pueden estar en la **posición 11 o superior**.
2. El destino de un retroceso (posición menos N) **no puede ser otra casilla de movimiento** (ni "VUELVE A LA SALIDA").
3. "VUELVE A LA SALIDA" **siempre está en el tablero**, entre las **posiciones 41 y 60**.
4. Los retrocesos de 5 y 10 son del sorteo normal: pueden salir ambos, uno o ninguno.

La casilla del dado ("TIREN EL DADO LOS NUMEROS IMPARES TOMAN") está **eliminada**.

### Posición, vueltas y casilla 60 (decidido)
- Cada jugador lleva `lap` (vuelta en curso, empieza en 1) y `position` (0 a 60).
- La casilla 60 es una casilla normal: si el jugador cae exactamente ahí, se muestra su tarjeta y se queda en la 60. La vuelta se completa en su siguiente tiro, cuando **rebasa** la 60: pasa a la vuelta siguiente y el sobrante se cuenta desde la salida (de la posición 58 con un 5: vuelta siguiente, posición 3).
- En la **última vuelta**, llegar a la 60 o pasarla **gana**. Propuesta: al ganar se va directo a la pantalla final, sin tarjeta.
- Retroceso: se muestran dos tarjetas seguidas (la del retroceso y luego la de la casilla de llegada).
- No hay empates de victoria: gana el primero que cumple la condición en su turno.

### Puntos menores a confirmar al implementar el hito 3.9 (agregar y sacar jugadores)
Propuestas: con empate de vueltas se usa la menor; el jugador nuevo se agrega al final de la lista de turnos; no se puede dejar la partida con menos de 2 jugadores; si se saca al jugador al que le toca, el turno pasa al siguiente. Confirmar con el usuario antes de implementarlas.

---

## 4. Stack y decisiones de arquitectura

Decididas en `PLAN1.MD` (sección C). Resumen:

- **PWA primero**; Capacitor y tiendas quedan para después, solo si el contenido y las políticas lo permiten.
- **React + Vite + TypeScript + Tailwind** (Vite 8, React 19, Tailwind 4). Linter: **oxlint** (el de la plantilla de Vite) y **Prettier**. Scripts: `npm run dev | build | lint | typecheck | format`.
- **Zustand** para el estado y **`localStorage`** para guardar la partida (sin backend).
- **`vite-plugin-pwa`** (Workbox) para offline e instalación.
- **Contenido en JSON** con esquema validado (`src/content/base.json`), nunca escrito dentro de componentes.
- **Motor de juego puro** en `src/engine/`, separado de la interfaz, con **generador de azar con semilla** para poder probarlo.
- **Hosting estático** (Vercel, Netlify o Cloudflare Pages).
- Pruebas: **Vitest** (unitarias y de propiedades) y **Playwright** (e2e en viewports móviles).

### Estructura de carpetas prevista
```
Tablero/
  CONTEXT.md  PLAN1.MD  CLAUDE.md
  docs/            casillas.md, reglas-del-juego.md, adr/
  src/
    engine/        lógica pura: tablero, turnos, movimiento, victoria
    content/       base.json, schema.ts, reglamento.md
    store/         Zustand + persistencia
    ui/            pantallas y componentes
    pwa/           service worker y aviso de actualización
  tests/           unitarias y e2e
  .claude/skills/  pwa-development, playwright-skill
```

### Modelo de datos (referencia)
```ts
type Action = {
  id: string;             // "base-014"
  text: string;           // texto de la tarjeta, tal cual docs/casillas.md
  pack: "base" | string;  // "base" hoy; "alberca", "halloween"... en el futuro
  kind: "drink" | "dare" | "truth" | "movement";
  effect?: { type: "back"; steps: number } | { type: "toLapStart" };
};
type Player = { id: string; name: string; lap: number; position: number };
type Game = { board: Action[]; players: Player[]; laps: number; turn: number; rngSeed: number; status: "playing" | "finished" };
```
Cada acción lleva `pack` desde el principio para poder añadir packs temáticos después (alberca, Halloween, cumpleaños). La versión 1 solo usa `base`.

### Requisitos no funcionales
Funciona sin conexión tras la primera carga; pantalla vertical primero; botones grandes; texto grande y legible con poca luz (tema oscuro por defecto); respeta `prefers-reduced-motion`; la pantalla se mantiene encendida durante la partida (Wake Lock con alternativa); **ningún dato personal sale del dispositivo**; primera carga menor a 300 KB comprimidos como meta.

---

## 5. Cómo funcionan los hitos

`PLAN1.MD`, sección E, divide el trabajo en **7 bloques** y **hitos numerados** (`1.1`, `1.2`, `2.1`...). Cada hito es una unidad de trabajo pequeña, con:
- una **Entrega** concreta,
- una lista **Depende de** (hitos que deben estar terminados antes),
- y se considera terminado solo cuando la entrega existe y sus pruebas pasan.

Al final de la sección E hay una **tabla de progreso** (⬜ pendiente, 🔄 en curso, ✅ terminado, con fecha y notas).

Las secciones de `PLAN1.MD` usan **letras** (A a K) y los hitos usan **números**. Si el usuario dice "punto 2.2", se refiere al hito 2.2.

Bloques:
1. Fundamentos (proyecto, pruebas, ADRs, contenido, despliegue)
2. Motor del juego (lógica pura)
3. Partida jugable (interfaz mínima)
4. Mapa y experiencia de fiesta (diseño, animaciones)
5. PWA y calidad (offline, accesibilidad, dispositivos reales)
6. Lanzamiento
7. Expansión (sin hitos detallados)

---

## 6. Qué debe hacer el agente cuando el usuario pide uno o varios hitos

El usuario dirá algo como "continuemos con el punto 2.2" o "haz los puntos 2.3 y 2.4". Sigue este procedimiento.

### Antes de empezar
1. Lee `CONTEXT.md` (este archivo), `PLAN1.MD`, `docs/reglas-del-juego.md` y `docs/casillas.md`.
2. Busca el hito pedido en la sección E y en la **tabla de progreso**.
3. **Verifica las dependencias:** todos los hitos de "Depende de" deben estar ✅. Si no lo están, avisa al usuario y pregunta si quieres hacerlos primero. No avances sin avisar.
4. **Revisa el estado real del repositorio** (archivos, `package.json`, pruebas). La tabla puede estar desactualizada o el código puede haber cambiado. Si hay diferencias, dilo.
5. Si el hito está marcado "**Requiere decisión del autor**" (4.1, 6.1, 6.3) o la decisión que necesitas no está escrita en los documentos, **pregunta al usuario antes** de empezar. No inventes reglas de juego, textos del reglamento, nombres ni estilo visual.
6. Marca el hito como 🔄 en la tabla de progreso.

### Durante el hito
- Haz **solo** lo que dice el hito. No adelantes trabajo de hitos posteriores ni agregues funciones que no se pidieron.
- Si pidieron **varios hitos**, hazlos **en orden numérico** y completa cada uno (con sus pruebas) antes de pasar al siguiente. Si un hito intermedio se bloquea, detente y repórtalo.
- Escribe el código para que el motor siga siendo **puro** (sin React, sin `localStorage`, sin `Math.random` directo: usa el generador con semilla).
- Escribe **pruebas** con el código. Para el motor, las reglas del tablero se prueban con miles de semillas.
- Usa los skills instalados cuando apliquen: `pwa-development` (hitos del bloque 5), `playwright-skill` (hitos 1.3, 3.10, 5.5, 5.7, 5.8) y, para diseño, `frontend-design`, `design-taste-frontend` o `impeccable` (bloque 4). Lee el `SKILL.md` correspondiente antes de usarlo.
- Si descubres que una decisión del plan es mala o está incompleta, **no la cambies en silencio**: explícaselo al usuario y propón la corrección.
- Si el hito toca reglas del juego que quedaron abiertas (ver sección 3, "Puntos de regla que se cierran al implementar"), pregunta y registra la respuesta en `docs/reglas-del-juego.md`.

### Al terminar
1. Ejecuta las pruebas y el linter y **comprueba que pasan**. Si algo falla, dilo con el resultado; no marques el hito como terminado.
2. Verifica la **Entrega** del hito contra lo escrito en `PLAN1.MD`.
3. Actualiza la **tabla de progreso**: ✅, fecha (formato `AAAA-MM-DD`) y una nota breve si hubo desvíos o decisiones.
4. Si tomaste una decisión de arquitectura nueva, crea o actualiza un ADR en `docs/adr/`. Si fue una decisión de reglas del juego, actualiza `docs/reglas-del-juego.md`.
5. Responde al usuario con un resumen corto: qué se hizo, cómo se probó, qué decisiones quedaron registradas y cuál es el siguiente hito sugerido. Si algo no se pudo verificar (por ejemplo, un dispositivo real), dilo.

### Formato de un ADR (`docs/adr/NNN-titulo.md`)
```
# ADR-NNN: Título
Estado: Propuesto | Aceptado | Reemplazado por ADR-XXX
Fecha: AAAA-MM-DD
## Contexto
## Opciones consideradas   (con ventajas y riesgos; incluir "no hacer nada" o "comprar" cuando aplique)
## Decisión
## Consecuencias           (qué se vuelve más fácil, qué más difícil, cómo se revierte)
```
Los ADR 001 a 007 y sus temas están listados en `PLAN1.MD`, sección C.

---

## 7. Qué NO hacer

- No hagas `git commit`, `git push` ni publiques nada (despliegues, paquetes) sin que el usuario lo pida. Hacer `git init` en el hito 1.1 sí está permitido.
- No agregues backend, cuentas, anuncios, analítica con datos personales ni servicios externos que reciban nombres de jugadores.
- No cambies el texto de las acciones de `docs/casillas.md` ni las reordenes por tu cuenta.
- No agregues un botón de "pasar" a las tarjetas ni registres retos saltados: es una decisión del autor.
- No incluyas la casilla 47 (dado).
- No instales skills ni dependencias raras sin revisarlas. Los skills ya instalados fueron revisados; cualquier otro hay que revisarlo antes (descargar a una carpeta temporal, leer, y luego copiar).
- No marques un hito como terminado si las pruebas no pasan o si no verificaste la entrega.
- No escribas código de lanzamiento (dominio, QR, aviso legal definitivo) antes de llegar al bloque 6.

---

## 8. Entorno y detalles prácticos

- Sistema: **Windows 10**. Carpeta del proyecto: `C:\Users\rubie\Desktop\Tablero`. El shell principal es PowerShell; también hay Git Bash.
- Es un repositorio git (iniciado en el hito 1.1), todavía sin commits.
- Hay un wrapper de Bash que a veces falla con caracteres Unicode (emoji) en la salida de comandos. Si pasa, usa las herramientas de lectura y búsqueda de archivos en vez de `grep` o `cat` por Bash, o evita imprimir emoji.
- Idioma: el usuario escribe en **español**. Responde en español. El código, los nombres de variables y los commits pueden ir en inglés; los textos que ve el jugador van en español.
- Los documentos del proyecto se escriben en prosa normal y clara (no en estilo comprimido), aunque la sesión use otro estilo de respuesta.
- Usa rutas absolutas al mover o leer archivos.
- Los archivos temporales y las descargas de terceros van en una carpeta temporal, nunca dentro del proyecto.

---

## 9. Glosario

- **Casilla / acción / tarjeta:** una casilla del tablero tiene una acción; la tarjeta es cómo se muestra en pantalla.
- **Pack:** conjunto de acciones por temática. El actual es `base`.
- **Hito:** unidad de trabajo numerada del plan (por ejemplo, 2.2).
- **Bloque:** grupo de hitos (por ejemplo, el bloque 2 es el motor del juego).
- **Semilla (seed):** número que fija el azar para poder repetir un sorteo en las pruebas.
- **Posición 0:** la salida; no tiene tarjeta.

---

## 10. Decisiones pendientes del autor (no bloquean hasta llegar a su hito)

1. **Estilo visual** (paleta, tipografía, tono): se necesita en el hito 4.1.
2. **Contenido del reglamento** (consecuencias de saltarse retos, límite de saltos por jugador y otras reglas): se necesita en el hito 6.1. Antes se usa texto provisional.
3. **Nombre final, logo y dominio:** se necesitan en el hito 6.3. Mientras tanto el nombre es "Tablero".
4. **Detalles de agregar y sacar jugadores en partida:** confirmar en el hito 3.9 (ver sección 3).

Resueltas el 2026-11-04: casilla 60 normal con vuelta al rebasar; un dado de 6 sin extras; empieza un jugador al azar; de 2 a 30 jugadores y mínimo 1 vuelta; advertencia +18 cada vez que se abre la app; sin deshacer en la v1; se pueden sacar y agregar jugadores en partida; retroceso con dos tarjetas seguidas; meta al pasar; "VUELVE A LA SALIDA" siempre presente entre las posiciones 41 y 60; casilla del dado eliminada; sin botón "pasar"; mapa serpenteante con lista de posiciones; nombre provisional "Tablero".

---

## 11. Mantener este documento

Si cambia una regla, una decisión de arquitectura, la estructura de archivos o el procedimiento, **actualiza este documento y `PLAN1.MD` en la misma sesión**. Un agente sin memoria depende de que esto esté al día.
