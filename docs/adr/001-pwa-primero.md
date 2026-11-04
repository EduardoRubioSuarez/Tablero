# ADR-001: PWA primero

Estado: Aceptado
Fecha: 2026-11-04

## Contexto
Tablero es un juego de fiesta que se juega con un solo celular que pasa de mano en mano. Debe funcionar en iOS y Android, y el autor duda entre una app descargable y una aplicación web. Los jugadores suelen decidir jugar en el momento, así que cualquier fricción de instalación reduce el uso. El contenido es para mayores de 18 y menciona alcohol y temas sexuales, lo que puede chocar con las políticas de las tiendas de aplicaciones.

## Opciones consideradas
- **PWA (aplicación web instalable).** Un solo código para todos los dispositivos, se comparte con un enlace o un QR, funciona sin conexión una vez cargada, sin costo de tienda ni revisión, y las actualizaciones son inmediatas. Riesgo: en iOS la instalación es manual y el almacenamiento tiene límites.
- **Apps nativas (Swift y Kotlin).** Mejor acceso al dispositivo, pero dos códigos distintos, 99 USD al año en Apple y 25 USD únicos en Google, y revisión de contenido.
- **Multiplataforma nativa (Flutter o React Native).** Un solo código, pero igual requiere tiendas y revisión, y no aporta nada que el juego necesite.
- **No hacer nada / solo página web sin instalación.** Más simple, pero sin modo sin conexión ni ícono en la pantalla de inicio.

## Decisión
Se construye una **PWA**. Si el juego tiene éxito y las políticas de las tiendas lo permiten, se envuelve el mismo código con **Capacitor** para publicarlo en tiendas sin reescribirlo.

## Consecuencias
- Más fácil: compartir el juego, actualizarlo y probarlo en cualquier dispositivo.
- Más difícil: la guía de instalación en iOS debe ser clara (hito 5.3) y hay que probar en dispositivos reales (hito 5.7).
- Reversible: Capacitor permite llegar a las tiendas con el mismo código. El riesgo de rechazo por contenido se evalúa antes de intentarlo.
