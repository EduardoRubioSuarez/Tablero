# ADR-002: Stack con React, Vite, TypeScript y Tailwind

Estado: Aceptado
Fecha: 2026-11-04

## Contexto
La PWA necesita una interfaz de pantallas con estado compartido (turnos, jugadores, tarjetas), animaciones y buen rendimiento en celulares de gama baja. El proyecto se desarrollará por hitos pequeños con ayuda de agentes de IA, así que conviene un stack muy documentado y con tipado fuerte para detectar errores temprano.

## Opciones consideradas
- **React + Vite + TypeScript + Tailwind.** Ecosistema enorme, tipado estático, compilación rápida, estilos sin hojas CSS grandes. Compatible con `vite-plugin-pwa` y con Capacitor.
- **Svelte.** Paquete más ligero, pero menos recursos y menos soporte de herramientas y skills disponibles.
- **Flutter.** Buena opción nativa, pero su versión web pesa más y encaja peor como PWA ligera.
- **JavaScript sin framework.** Muy ligero, pero el estado y las pantallas se vuelven difíciles de mantener.

## Decisión
**React 19 + Vite 8 + TypeScript + Tailwind 4**. Linter **oxlint** (el que trae la plantilla de Vite) y **Prettier** para el formato.

## Consecuencias
- Más fácil: componentes reutilizables, tipos compartidos con el motor del juego, muchas bibliotecas disponibles.
- Más difícil: el tamaño de la primera carga debe vigilarse (meta menor a 300 KB comprimidos, hito 5.6).
- Reversible con costo medio: cambiar de framework implicaría reescribir la capa de interfaz, pero no el motor, que es independiente (ADR-006).
