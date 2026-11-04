# Reglas y decisiones de diseño

Decisiones tomadas por el autor del juego. Tienen prioridad sobre las notas abiertas de `casillas.md`.

## 1. Tablero y selección de casillas

- Cada vuelta del tablero tiene **60 casillas**.
- Hay 80 acciones en la base de datos de contenido (la casilla del dado se eliminó), todas etiquetadas `base`.
- Al **iniciar una partida nueva** se eligen **60 acciones al azar, sin repetir**, y se arma el tablero de esa partida.
- El tablero queda fijo durante toda la partida (todas las vueltas usan las mismas 60 casillas, en el mismo orden).
- El número de vueltas lo define el grupo al crear la partida. Gana quien primero completa todas las vueltas.

## 2. Casillas de movimiento

| Acción | Efecto |
|---|---|
| RETROCEDE 5 CASILLAS | mueve al jugador 5 casillas atrás y **se muestra la tarjeta de la casilla nueva** |
| RETROCEDE 10 CASILLAS | igual, 10 casillas atrás |
| VUELVE A LA SALIDA | regresa al **inicio de la vuelta actual** (no quita vueltas) |

Al llegar a la casilla nueva se muestra su tarjeta normalmente.

### Validaciones al generar el tablero

1. Una casilla de retroceso **no puede dejar al jugador en otra casilla de retroceso** (ni en "vuelve a la salida"). Es decir, la casilla de destino de cada retroceso debe ser una casilla sin movimiento.
2. Toda casilla de movimiento debe estar **al menos a 11 posiciones de la salida**, para que ningún retroceso lleve a una vuelta anterior ni antes del inicio de la vuelta.
3. Si el sorteo no cumple las reglas, se vuelve a ordenar hasta cumplirlas (o se recoloca la casilla de movimiento).
4. **"VUELVE A LA SALIDA" siempre está en el tablero** y se coloca en una de las **últimas 20 casillas** (posiciones 41 a 60). Los retrocesos de 5 y 10 se sortean con el resto (pueden salir ambos, uno o ninguno). La regla de 11 posiciones aplica solo a los retrocesos.

Casilla eliminada: "TIREN EL DADO LOS NUMEROS IMPARES TOMAN" ya no se usa.

## 2b. Meta, tarjetas y reglamento (decidido 2026-11-04)

- **Ganar:** se gana al pasar o llegar a la meta de la última vuelta; no hace falta caer en la casilla exacta.
- **Tarjetas:** solo tienen el botón **Continuar**, que pasa al siguiente turno. No hay botón "pasar" y la app no registra si alguien se saltó un reto.
- **Reglamento:** habrá un reglamento consultable en cualquier momento de la partida. Ahí se especificará, entre otras reglas por definir, que saltarse retos tiene consecuencias y que hay un límite de saltos por jugador. El contenido lo escribe el autor más adelante.
- **Mapa:** camino serpenteante con las fichas, más una lista con la posición de cada jugador.
- **Nombre:** "Tablero" por ahora.

## 2c. Dado, turnos, límites y casilla 60 (decidido 2026-11-04)

- **Dado:** un solo dado de 6 caras, un tiro por turno, sin tiros extra.
- **Quién empieza:** la app elige **al azar** al primer jugador. Después el orden sigue la lista de jugadores (el orden de asientos).
- **Límites al crear la partida:** de **2 a 30 jugadores**; vueltas **mínimo 1**, sin máximo definido por el autor (en la interfaz se pondrá un tope técnico alto, por ejemplo 99, solo para evitar errores).
- **Posición y vueltas:** cada jugador tiene `lap` (vuelta en curso, empieza en 1) y `position` (0 a 60).
- **Casilla 60:** es una casilla normal. Si el jugador cae exactamente en la 60, se muestra su tarjeta y se queda ahí; la vuelta se completa en su siguiente tiro, cuando **rebasa** la 60: pasa a la vuelta siguiente y el sobrante se cuenta desde la salida (por ejemplo, de la posición 58 con un 5: vuelta siguiente, posición 3).
- **Última vuelta:** si el jugador **llega a la 60 o la pasa**, gana. Propuesta: al ganar se va directo a la pantalla final, sin mostrar tarjeta.
- **Advertencia +18:** se muestra **cada vez que se abre la app**.
- **Deshacer:** la versión 1 no tiene deshacer; la mesa corrige de palabra.
- **Retroceso:** se muestran **dos tarjetas seguidas**: primero la del retroceso (Continuar), luego la ficha se mueve y aparece la de la casilla de llegada (Continuar), y sigue el siguiente turno.
- **Jugadores durante la partida:** se pueden **sacar y agregar**.
  - Un jugador nuevo empieza en la **posición 0 (primera casilla) de la vuelta donde esté la mayoría de los jugadores activos**.
  - Propuestas a confirmar en el hito 3.9: si hay empate de vueltas se usa la menor; el jugador nuevo se agrega al final de la lista de turnos; no se puede dejar la partida con menos de 2 jugadores; si se saca al jugador al que le toca, el turno pasa al siguiente.

## 3. Jugadores y casillas que dependen de otro jugador

- Al agregar jugadores, la pantalla debe indicar que **se agreguen en el orden en que están sentados** (de preferencia).
- Las tarjetas seguirán diciendo "izquierda", "derecha" o "frente a ti". La app **no** calcula quién es; lo resuelve la mesa.
- El orden de turnos sigue el orden en que se agregaron.

## 4. Advertencias (+18)

El juego es solo para fiestas con alcohol o con personas mayores de 18 años. La app debe avisar claramente, antes de jugar, que incluye:

- retos o actividades relacionadas con **alcohol**;
- actividades de **índole sexual**.

Requisitos mínimos: pantalla de advertencia al abrir (o antes de crear la partida) con confirmación explícita de mayoría de edad, y mensaje de consumo responsable. Los textos finales se definen en la fase de diseño.

## 5. Etiquetas y expansión futura

Las 80 acciones actuales son el pack **`base`**. Cada acción debe tener etiqueta de tema para poder agregar packs más adelante y filtrarlos al crear la partida.

Packs previstos (ejemplos del autor, no entran en la primera versión):
- Alberca / agua (si hay alberca o agua cerca).
- Festividades: Halloween, cumpleaños.
- Otras temáticas.

Implicación para el diseño:
- Cada acción lleva `id`, `texto`, `pack` (`base`, `alberca`, `halloween`...), `tipo` (reto, beber, movimiento...) y `efecto` opcional.
- La pantalla de crear partida tendrá, en el futuro, un selector de packs. La versión 1 usa solo `base`.
- Si un pack activo tiene menos de 60 acciones, se completa con `base` o se bloquea la opción (decidir al diseñarlo).
