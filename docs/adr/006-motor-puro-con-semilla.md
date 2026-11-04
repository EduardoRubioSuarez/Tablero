# ADR-006: Motor de juego puro y separado de la interfaz, con azar de semilla

Estado: Aceptado
Fecha: 2026-11-04

## Contexto
Las reglas del tablero tienen validaciones delicadas (retrocesos desde la posición 11, ningún retroceso que termine en otra casilla de movimiento, "VUELVE A LA SALIDA" entre las posiciones 41 y 60) y reglas de vueltas y victoria. Un error de reglas arruina la partida, y el azar dificulta reproducir fallos.

## Opciones consideradas
- **Motor puro en `src/engine/`, sin React ni `localStorage`, con generador de azar con semilla.** Se prueba con miles de semillas, es reproducible y no depende de la interfaz.
- **Lógica dentro de los componentes y del store.** Más rápido al inicio, pero casi imposible de probar a fondo.
- **`Math.random` directo.** Sencillo, pero no reproducible.

## Decisión
Toda la lógica de juego (sorteo y colocación del tablero, dado, turnos, vueltas, movimiento, victoria, gestión de jugadores) vive en `src/engine/` como funciones puras que reciben el estado y devuelven un estado nuevo. El azar entra por un generador con semilla inyectable. La interfaz y el store solo llaman al motor.

## Consecuencias
- Más fácil: pruebas de propiedades con 10 000 semillas, guardado y carga simples, y posibilidad de repetir una partida con la misma semilla.
- Más difícil: hay que mantener la disciplina de no meter lógica en la interfaz.
- Reversible y de bajo riesgo: el motor es independiente del framework de interfaz.
