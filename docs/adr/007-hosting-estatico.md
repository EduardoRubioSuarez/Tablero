# ADR-007: Hosting estático

Estado: Aceptado
Fecha: 2026-11-04

## Contexto
La app compilada es solo archivos estáticos: no hay servidor, base de datos ni cuentas. Debe servirse por HTTPS (requisito de los service workers) con carga rápida y costo mínimo.

## Opciones consideradas
- **Hosting estático (Vercel, Netlify o Cloudflare Pages).** Gratis para este tamaño, HTTPS automático, despliegue desde git, vistas previas por cambio.
- **GitHub Pages.** Gratis y simple, pero con menos control de cabeceras de caché.
- **Servidor propio (VPS).** Más control, pero mantenimiento y costo innecesarios.

## Decisión
Hosting estático. El proveedor concreto (Vercel, Netlify o Cloudflare Pages) se decide en el hito 1.9, según la cuenta que el autor tenga o prefiera crear. Mientras tanto la integración continua solo compila y corre pruebas.

## Consecuencias
- Más fácil: desplegar, revertir una versión y compartir el enlace.
- Más difícil: no hay servidor para analítica o lógica; cualquier medición se hace en el cliente y sin datos personales.
- Reversible: cambiar de proveedor es mover la carpeta compilada.
