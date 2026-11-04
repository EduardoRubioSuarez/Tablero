# ADR-005: Contenido en JSON con esquema validado

Estado: Aceptado
Fecha: 2026-11-04

## Contexto
Las 80 acciones del juego (y el reglamento) son el contenido propio del autor y cambiarán con frecuencia. En el futuro habrá packs temáticos (alberca, Halloween, cumpleaños). El texto debe conservarse tal como lo escribió el autor, y quien edite el contenido no debería tocar componentes.

## Opciones consideradas
- **JSON en `src/content/` con esquema validado (Zod).** Editable sin tocar la interfaz; el validador detecta ids duplicados, packs desconocidos o efectos mal formados.
- **Textos dentro de los componentes.** Rápido al inicio, pero mezcla contenido con código y complica los packs.
- **Base de datos o CMS remoto.** Permite editar sin desplegar, pero exige backend y contradice el modo sin conexión.

## Decisión
El contenido vive en `src/content/base.json` (80 acciones, pack `base`) y el reglamento en `src/content/reglamento.md`. Cada acción tiene `id`, `text`, `pack`, `kind` y un `effect` opcional. El esquema se valida en las pruebas y al compilar. El texto de las acciones se conserva tal cual lo escribió el autor.

## Consecuencias
- Más fácil: agregar packs, cambiar un texto, filtrar por pack o por tipo (por ejemplo, una versión sin alcohol en el futuro).
- Más difícil: hay que mantener el esquema y las pruebas del contenido (80 acciones, 3 de movimiento, ids únicos).
- Reversible: el contenido podría servirse desde un backend cambiando solo el origen de datos.
