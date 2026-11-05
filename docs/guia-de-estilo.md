# Guía de estilo — Mesa de bar

Hito 4.1 · Decidida por el autor el 2026-11-04. Esta guía manda sobre cualquier decisión visual de los hitos 4.2 a 4.10. Si algo no está aquí, se pregunta al autor antes de inventarlo.

## Logo

Decidido el 2026-11-05: una **T amarilla con canto, de la fuente Titan One, rodeada de confeti de colores**, con el nombre TABLERO debajo en la misma fuente y el mismo canto. El nombre sigue siendo provisional.
- La T ocupa una caja de 56 × 62 sobre 100 (proporción de 0,86 entre ancho y alto): ni larga ni ancha.
- Se usa **solo como ícono de la app y favicon** (`public/icon.svg`; `npm run icons` genera los PNG). Dentro de la app, el inicio y la advertencia conservan el dado flotante y el título TABLERO en Bowlby One.
- Titan One solo se usó para dibujar ese ícono; la app no la carga.

## 1. Idea general

Tablero se ve como un tablero de juego físico sobre una mesa de bar, bajo una lámpara. Parte del diseño original del autor: azul rey oscuro, título amarillo y casillas blancas con una ilustración cada una. La app lo convierte en objetos con grosor, sombra y profundidad, y la interfaz alrededor se mantiene neutra para que las tarjetas sean lo llamativo.

Escena de uso: de noche, con poca luz, un celular que pasa de mano en mano. Por eso el fondo es oscuro, el texto es grande y los botones son enormes.

## 2. Color

| Uso | Valor |
|---|---|
| Fondo de pantalla (degradado de arriba a abajo) | `#3a5fd9` → `#10286f` → `#070f33` |
| Laca del tablero (base) | `#0b1a5a` |
| Contorno de íconos y texto sobre claro | `#0f1f5c` |
| Amarillo (título, botón principal, salida) | `#ffd21f`, claro `#ffe25a`, oscuro `#ffc400`, canto `#a87e00` |
| Casillas y cartas | blanco `#ffffff` a `#dde4ff` |
| Rosa (retos, casillas de movimiento) | `#ff4f8b`, para fondos de movimiento `#e0306e` |
| Cian | `#3ad6ff` |
| Verde | `#6fe07a` |
| Naranja | `#ff9f1c` |

Las fichas de los jugadores usan colores vivos y distintos entre sí (amarillo, rosa, cian, verde, naranja, violeta y más para llegar a 30). La lista exacta de 30 se define en el hito 4.4.

Reglas: texto claro sobre fondo oscuro y texto `#0f1f5c` sobre casillas y cartas claras. Contraste mínimo 4,5 a 1 en texto normal y 3 a 1 en texto grande. El color nunca es el único dato: la ficha siempre se acompaña de nombre en la lista.

## 3. Tipografía

- **Bowlby One** para el título, los números, los botones principales y el texto de las tarjetas.
- **Figtree** (400, 600, 800) para todo el resto de la interfaz.
- Las dos fuentes se guardan dentro de la app (no se piden a Google Fonts), para que funcione sin conexión y sin enviar datos a terceros.
- El texto de la tarjeta usa mayúsculas tal como está en las casillas, con unos 19 px como tamaño base. Si una acción es muy larga la letra puede reducirse un poco, pero la tarjeta no cambia de tamaño.

## 4. Tono de los textos

- La interfaz es neutra y directa: "Tirar dado", "Continuar", "Ver todo", "Reglamento", "Jugadores". Verbos claros, sin bromas.
- El tono sube solo en el texto de las acciones de las tarjetas, que se usa tal como lo escribió el autor.

## 5. Profundidad y movimiento

- Las casillas, la carta y los botones tienen **canto**: una pila de sombras sólidas hacia abajo más una sombra suave. No hay inclinaciones fijas en la carta, porque hacían ver rara la parte de abajo.
- Movimiento permitido: rayos de la medalla que giran muy despacio, confeti que cae poco a poco, animación del dado y de la ficha, cámara del mapa. Todo se detiene o se queda quieto con `prefers-reduced-motion`.
- La carta no flota ni brilla.

## 6. Pantallas clave

### Turno
Título arriba, "Turno de X", vuelta y casilla, un dado en forma de cubo 3D que rueda y el botón "Tirar dado" amarillo. Abajo, tres botones secundarios: Reglamento, Jugadores y Mapa.

### Mapa (hitos 4.3 a 4.5)
- Tablero grueso de laca azul, inclinado unos 54 grados, 6 columnas por 10 filas en camino serpenteante. Casillas con espesor. Salida amarilla. Casillas de movimiento rosas.
- Fichas como peones de pie con sombra. Si hay varios en la misma casilla se colocan lado a lado, y con más de dos aparece un número como "×3".
- **Cámara que sigue al turno:** se centra en quien tira. Al arrastrar con el dedo se recorre el tablero, y la cámara no se mueve sola mientras alguien arrastra.
- **Tira de 60 casillas** arriba, siempre visible, con un punto de color por jugador y un marco amarillo que muestra lo que ve la cámara.
- **Lista de jugadores** debajo, con vuelta y casilla. Al tocar un nombre, la cámara viaja a su ficha.
- **Botón "Ver todo":** aleja la cámara y baja la inclinación a unos 16 grados. Empieza mostrando la parte de arriba del tablero (hasta cerca de la casilla 42) y se desliza para ver el resto hasta la 60. La demo de referencia está en el enlace de la sección 9.

### Tarjeta (hito 3.5 y 4.7)
Versión **A1, "Estallido"**, quieta:
- Ocupa el mismo tamaño siempre, con texto corto o largo; el botón Continuar queda siempre libre y por encima.
- De arriba abajo: medalla con rayos que giran lento y la ilustración de la acción; listón con tres estrellas; texto de la acción; tres estrellas. Borde azul marino con línea punteada dorada por dentro y fondo de puntos suaves.
- **Sin número de casilla y sin etiqueta de tipo** (no dice BEBER, RETO ni VERDAD).
- El color del listón y de los rayos cambia según el tipo de acción (amarillo para beber, rosa para retos y movimiento, cian para verdad). Este punto está propuesto y **falta confirmarlo con el autor**.
- Confeti pequeño que cae despacio por toda la pantalla, por encima de la carta y por debajo del botón.
- En un retroceso se muestran dos tarjetas seguidas, como ya está definido.

## 7. Ilustraciones de las casillas

Las del diseño original no se usan. Se dibuja un set nuevo con el **estilo de contorno grueso**:
- Contorno azul marino `#0f1f5c` de 3,5 unidades sobre 64, colores planos y brillos blancos finos.
- Un solo objeto por casilla que guiñe a la acción. Si la acción lleva cantidad, va en una insignia amarilla (−5, −10, ×3).
- Casillas de movimiento con fondo rosa en el mapa.
- Se dibujan como SVG. Hay 19 de muestra aprobadas como estilo; faltan las demás hasta completar las 80. Se hacen por lotes en los hitos 4.2 a 4.4.
- Los textos de las acciones no se modifican.

## 8. Lo que se descartó

Estilos neón, pinball y etiqueta de disco como mundos completos; íconos de calcomanía, inflables y de línea de neón; las cartas Boleto de feria y Marquesina; las etiquetas de tipo en la tarjeta; la inclinación fija y el flotado de la carta.

## 9. Notas de implementación (bloque 4)

- El mapa tiene una fila de **SALIDA** arriba (amarilla) y una de **META** abajo (a cuadros), además de las 60 casillas en 6 columnas. Los jugadores en la posición 0 están en la fila de salida.
- Las fichas caminan casilla por casilla al avanzar y saltan directo en un retroceso o al volver a la salida. Se ven hasta 2 por casilla (6 en la salida) y el resto se cuenta con un "+n".
- Con "reducir movimiento" se apagan el dado que rueda, los pasos de las fichas, la cámara animada, los rayos y el confeti (queda quieto).
- **Dado:** el número de la cara de arriba es la cantidad de casillas que avanza la ficha.
- **Ayuda y reglamento:** en el inicio hay un botón **Reglas** con el reglamento completo. En la partida el botón se llama **Ayuda** y solo explica qué hacer en ciertas situaciones (`src/content/ayuda.md`); no repite las reglas ni inventa consecuencias.
- **Terminar partida:** en **Jugadores** hay un botón (con confirmación) que muestra la tabla de posiciones como van.
- En la tarjeta de un retroceso, la segunda dice "Retrocediste a esta casilla." sin número.
- Pantallas bajitas (menos de 740 px de alto) y muy bajitas (menos de 620 px) compactan la tarjeta y la pantalla de turno para que no haya scroll.
- El sonido y la vibración están activados por defecto y se apagan desde dos botones en la parte de arriba de la partida (ADR 008). Al encenderlos suena o vibra una muestra. La vibración no existe en iPhone ni en la mayoría de las computadoras, y ahí el botón aparece desactivado.

## 10. Pendientes

1. Confirmar con el autor si el color de la tarjeta va por tipo de acción o es uno solo.
2. Dibujar los íconos que faltan para las 80 acciones.
3. Revisar con el autor los tipos de acción (beber, reto, verdad, movimiento) que asignó el asistente en `base.json`, porque el color de la tarjeta depende de ellos.
