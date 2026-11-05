# Rendimiento y tamaño (hito 5.6)

Medido el 2026-11-04 sobre la versión compilada (`npm run build`), con Lighthouse 12 en modo celular con la red y el procesador limitados.

| Categoría | Resultado | Meta |
|---|---|---|
| Rendimiento | 96 | 90 o más |
| Accesibilidad | 100 | 90 o más |
| Mejores prácticas | 100 | 90 o más |
| SEO | 91 (sin `robots.txt` válido; se agregó después de la medición) | 90 o más |

| Métrica | Valor |
|---|---|
| Primer contenido visible | 2,1 s |
| Contenido principal | 2,4 s |
| Tiempo de bloqueo | 40 ms |
| Desplazamiento de diseño | 0 |
| Peso total de la primera carga | 192 KiB |

## Tamaño de la primera carga
`npm run build && npm run size` comprime cada archivo y suma lo que descarga un celular la primera vez. Está en la integración continua con un límite de 300 KB.

| Archivo | Tamaño comprimido |
|---|---|
| JavaScript | 118 KB |
| CSS | 8 KB |
| Fuentes (Bowlby One y Figtree, latín) | 41 KB |
| HTML | 0,4 KB |
| **Total** | **167 KB** (meta: menos de 300 KB) |

El service worker guarda aparte todo lo demás (íconos, página) en segundo plano para el modo sin conexión; eso no retrasa la primera carga.

## Ajustes hechos
- Solo se cargan las fuentes del subconjunto latino y solo el formato woff2.
- Sin imágenes de contenido: las 80 ilustraciones son SVG dentro del código.
- Sin librerías de animación ni de sonido: se usan CSS y Web Audio.
- Se quitó `background-attachment: fixed` y se apaga el confeti con "reducir movimiento" (en WebKit hacían la app varias veces más lenta).

## Pendiente a futuro
- Lighthouse marca JavaScript sin usar al inicio (el mapa y los textos de ayuda podrían cargarse solo al abrirlos). No hace falta para la meta; se puede hacer si el JavaScript crece.
- Medir en celulares de gama baja reales (hito 5.7).
