# ADR-003: Estado con Zustand y guardado en localStorage

Estado: Aceptado
Fecha: 2026-11-04

## Contexto
La partida vive en un solo dispositivo. Debe poder retomarse si se cierra el navegador o se recarga la página. No hay cuentas ni servidor. Por privacidad, los nombres de los jugadores no deben salir del dispositivo.

## Opciones consideradas
- **Zustand + `localStorage`.** Estado global pequeño y simple, guardado síncrono del estado serializado. Límite de almacenamiento de unos pocos MB, más que suficiente.
- **Redux Toolkit.** Más estructura de la necesaria para este tamaño de app.
- **IndexedDB.** Más capacidad, pero más complejo; no hace falta para guardar una partida.
- **Backend con base de datos.** Permitiría multijugador y respaldo, pero añade costo, cuentas y privacidad; no es necesario en la versión 1.
- **No hacer nada (estado solo en memoria).** Se perdería la partida al recargar.

## Decisión
Estado de interfaz con **Zustand**. La partida se guarda en **`localStorage`** tras cada turno, serializada por el motor con un campo de **versión del formato** para poder migrar partidas guardadas en el futuro. El motor nunca toca `localStorage`; solo la capa `store/`.

## Consecuencias
- Más fácil: retomar partidas, probar el guardado como función pura (hito 2.8).
- Más difícil: si el formato cambia, hay que migrar o descartar partidas viejas (por eso la versión del formato).
- En navegadores con almacenamiento bloqueado o en modo privado, el guardado puede fallar: la app debe seguir jugando sin guardar y avisar.
- Reversible: se puede pasar a IndexedDB o a un backend cambiando solo la capa `store/`.
