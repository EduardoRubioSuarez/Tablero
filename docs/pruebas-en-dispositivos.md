# Pruebas en dispositivos reales (hito 5.7)

Este hito solo lo puede hacer el autor, con celulares de verdad. Lo ya automatizado (manifest, sin conexión, accesibilidad, rendimiento) está probado en navegadores de escritorio que imitan un iPhone y un Pixel, pero eso no reemplaza un celular.

Dirección para probar: la de Vercel del proyecto (la misma que se abre con el QR en el hito 6.4).

## Antes de empezar
- Usa una partida nueva en cada dispositivo.
- Anota el modelo, la versión del sistema y el navegador.
- Si algo falla, escribe qué pasó, en qué pantalla y si se repite.

## En iPhone (Safari)
1. Abre la dirección. Debe aparecer la advertencia +18 y, en el inicio, la guía "Instala Tablero en tu iPhone".
2. Toca Compartir, "Agregar a inicio" y abre Tablero desde el ícono. Debe abrir sin la barra de Safari y con el ícono de la "T" amarilla.
3. Apaga el wifi y los datos, cierra la app del todo y vuelve a abrirla. Debe abrir y poder jugar.
4. Juega 5 turnos. Revisa que el dado ruede, que las fichas caminen y que la tarjeta se vea completa sin scroll.
5. Abre **Mapa**: arrastra con el dedo, toca **Ver todo** y toca un nombre de la lista.
6. Con el sonido activado, ¿se oye? (Si el celular está en silencio no sonará.) La vibración no existe en iPhone: el botón debe verse apagado.
7. Deja la pantalla quieta unos 2 minutos durante una partida. ¿Se apaga? Debería mantenerse encendida.
8. Cierra la app a mitad de una partida, ábrela y revisa que aparezca **Continuar partida**.
9. Gira el celular a horizontal: no debe romperse nada importante.

## En Android (Chrome)
1. Abre la dirección. Debe aparecer el botón **Instalar** en el inicio (o el cuadro de instalación de Chrome).
2. Instala y abre desde el ícono. El ícono debe verse bien dentro del círculo o cuadrado que use tu celular.
3. Repite los pasos 3 a 9 de iPhone.
4. Vibración: al tirar el dado y al salir una tarjeta debe vibrar si está activada.

## En ambos
- Letra legible a distancia y con poca luz. ¿Algún texto muy chico?
- Botones cómodos de tocar con el pulgar.
- ¿Algo tapado por la barra del navegador o por la muesca?
- Si hay una versión nueva publicada, ¿aparece el aviso **Hay una versión nueva** y la partida se conserva al actualizar?

## Cuando termines
Dime qué encontraste y lo corrijo. Después se marca el hito 5.7 como terminado y se sigue con la revisión de seguridad y privacidad (5.9).
