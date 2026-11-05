# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Grupos de 2 a 30 personas mayores de 18 años, en una fiesta o reunión con alcohol, casi siempre de noche y con poca luz. Un solo celular pasa de mano en mano. El anfitrión abre la app; los demás solo juegan. (Inferido de CONTEXT.md; el usuario no lo ha corregido.)

## Product Purpose

Juego de tablero por turnos para fiestas. Se tira un dado, se avanza por un camino de 60 casillas y cada casilla nueva muestra una tarjeta con una acción (beber, reto, verdad, beso) que el grupo cumple fuera de la app. Gana quien completa primero las vueltas acordadas. Éxito: un grupo nuevo termina una partida sin explicación.

## Positioning

Ritmo y retos puestos por la app, sin cuentas ni conexión. Instalable como PWA, funciona offline, ningún dato personal sale del dispositivo.

## Operating Context

Pantalla vertical, botones y texto grandes, legible a distancia y con poca luz, tema oscuro. La pantalla se mantiene encendida. Respeta `prefers-reduced-motion`.

## Capabilities and Constraints

Stack ya decidido: React, Vite, TypeScript, Tailwind 4 (ver PLAN1.MD). Tablero de 60 casillas en camino serpenteante, 3 casillas de movimiento, tarjeta con único botón Continuar, reglamento consultable, lista de posiciones. Solo contenido `base` en la v1. Sin backend.

## Brand Commitments

- Nombre provisional: "Tablero". Logo decidido el 2026-11-05: T amarilla con canto y confeti (ver docs/guia-de-estilo.md).
- El autor tuvo un diseño previo (la imagen ya se quitó del proyecto): fondo azul rey oscuro, título amarillo, casillas blancas con ilustraciones coloridas por casilla. Colores oscuros, pero abierto a otras opciones. Si se reutilizan sus ilustraciones está sin confirmar.
- Tono de la interfaz: neutro en instrucciones. El tono sube y pierde la neutralidad solo en las tarjetas.
- El autor quiere una app muy llamativa, con el mejor diseño posible, y le interesa que el tablero tenga profundidad y más detalle.
- El contenido sexual y de alcohol es legítimo; no se suaviza.

## Evidence on Hand

`docs/casillas.md` (80 acciones), el logo (T amarilla con confeti) y las 80 ilustraciones dibujadas en SVG. Las pruebas unitarias y e2e cubren la partida, el mapa, la PWA y la accesibilidad. Falta el reglamento final.

## Product Principles

1. La pantalla se entiende de un vistazo con una mano y con poca luz.
2. La tarjeta es el momento estrella; la interfaz alrededor es neutra y clara.
3. El tablero es el escenario compartido: debe verse espectacular y mostrar dónde está cada quien.
4. Nada obliga a nadie a nada en la app; las consecuencias van en el reglamento.

## Accessibility & Inclusion

Contraste suficiente y animaciones reducibles. Advertencia +18 en cada apertura.
