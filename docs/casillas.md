# Casillas del tablero

Fuente de verdad del contenido del juego. Texto copiado tal cual lo entregó el autor (81 casillas originales, en orden; la 47 fue eliminada, quedan 80). Al implementar, este contenido debe vivir en un JSON editable (ver ADR-005), no hardcodeado en componentes.

Todas estas acciones pertenecen al pack `base`. En cada partida se sortean 60 de ellas. Las reglas vigentes están en `reglas-del-juego.md` y tienen prioridad sobre las notas abiertas de abajo.

Juego de fiesta para adultos con alcohol: la app debe mostrar una advertencia de edad (+18) y de consumo responsable.

## Lista (orden del tablero)

1. Beso al mejor vestido
2. DECLÁRATE A ALGUIEN POR MENSAJE
3. TOMAN LOS QUE USAN LENTES
4. VERDAD O RETO
5. BEBE SI BESASTE A ALGUIEN 4 AÑOS MAYOR QUE TU
6. Toma 1 Trago o consigue 1 Beso
7. BEBE EL QUE TENGA UNA PRENDA NEGRA
8. TOMAS TÚ
9. TOMA EL MÁS PERRO
10. BEBEN TODOS MENOS TU
11. ELIJE A 2 PERSONAS PARA QUE SE BESEN
12. DESCANSA BEBE AGUA
13. CASAR FOLLAR MATAR
14. RETROCEDE 5 CASILLAS
15. TOMAN LOS MÁS FRESAS
16. NO PUEDES DECIR QUE "NO" HASTA QUE TERMINE EL JUEGO, SINO TOMAS
17. CUENTA UN SECRETO
18. DI TU POSICIÓN FAVORITA
19. IMITA A ALGUIEN DEL GRUPO Y LOS DEMÁS DEBEN ADIVINAR QUIEN ES
20. TOMA UN SHOT
21. CHAU PANTALÓN
22. PASA UN HIELO DE BOCA EN BOCA CON ALGUIEN DEL GRUPO
23. EL MÁS VIEJO Y EL MÁS JOVEN BEBEN
24. TOMAN LOS DE OJOS OSCUROS
25. UFF TE TOCÓ FONDO
26. BESO SENSUAL EN EL CUELLO A LA PERSONA A TU DERECHA
27. VUELVE A LA SALIDA
28. ADIÓS TOP
29. TODOS TOMAN
30. 3 SEGUNDOS DE SHOT
31. EL GRUPO DECIDE DONDE LE DARÁS UN BESO A...
32. UN MINUTO EN EL PARAISO CON EL/LA DE EN FRENTE
33. EL QUE ESTÁ FRENTE A TI HACE FONDO
34. EL GRUPO TE PONE UN RETO
35. BEBEN LOS QUE HARÍAN UN TRÍO
36. TOMAN LOS DE OJOS CLAROS
37. TOMAN LOS QUE HAYAN SIDO INFIELES
38. YO NUNCA NUNCA
39. TOMA EL DE LA DERECHA
40. TOMA EL MÁS GUAPO
41. DEBES DECIR TU CRUSH
42. BAILE HOT AL DE TU IZQUIERDA
43. TOMAN ELLOS
44. FANTASÍA SEXUAL
45. CUENTA TU 1RA VEZ
46. TOMA EL DE LA IZQUIERDA
47. ~~TIREN EL DADO LOS NUMEROS IMPARES TOMAN~~ (ELIMINADA por decisión del autor; no se usa en el juego)
48. TOMAN ELLAS
49. EL MÁS EBRIO HACE KARAOKE
50. CUENTA TU PEOR EXPERIENCIA SEXUAL
51. RETROCEDE 10 CASILLAS
52. ELIGE QUIEN DEBE HACER FONDO
53. TOMAN L@S QUE LLEVEN E EN SU NOMBRE
54. BEBEN LOS QUE HAYAN BESADO A +15 PERSONAS
55. TOMAN L@S QUE LLEVEN A EN SU NOMBRE
56. BODY SHOT
57. TOMA LA MÁS CHICHONA
58. BEBEN LOS CASTAÑOS
59. DESCRIBE A CADA JUGADOR CON 1 PALABRA
60. MINI BEER PONG
61. TOMAN L@S SOLTER@S
62. TOMA SI BESASTE A ALGUIEN 10+ MAYOR QUE TU
63. BESO DE 3
64. TOMA UN SHOT EL QUE HA DURADO MÁS TIEMPO EN LA CAMA
65. TOMAN LOS QUE ESTÁN ENAMORADOS
66. BEBE SI LE HAS REVISADO EL CEL A UNA PAREJA
67. LA PERSONA A TU DERECHA TE HACE UN CHUPETÓN O 2 SHOTS
68. EL MÁS CODO SE TERMINA SU VASO
69. BESO A LA PERSONA DEL SEXO OPUESTO MÁS LEJANA DE TI
70. CONFIESA QUIEN DEL GRUPO SE TE HACE MÁS ATRACTIV@
71. TOMAN LOS QUE TENGAN TATUAJES
72. SUBE UNA HISTORIA QUE EL GRUPO DECIDA A IG (NO LA PUEDES BORRAR HASTA QUE ACABE EL JUEGO)
73. SIÉNTATE EN LAS PIERNAS DE LA PERSONA FRENTE A TI POR UNA RONDA
74. INTERCAMBIA TOP O PANTALÓN CON LA PERSONA A TU IZQUIERDA
75. BEBE LA ÚLTIMA PERSONA EN LLEGAR
76. ABRAZA POR 30 SEGUNDOS A LA PERSONA QUE LE TENGAS MENOS CONFIANZA DEL GRUPO
77. TOMAN LOS QUE TENGAN PERFORACIONES
78. EL GRUPO TE VA A ACERCAR UNA BEBIDA A CIEGAS, ADIVINA QUE ES O TE LA TERMINAS
79. DILE UN PIROPO AL OIDO A LA PERSONA A TU IZQUIERDA
80. TOMA EL QUE TENGA EL PORCENTAJE DE BATERÍA MÁS BAJO
81. BEBE EL ÚLTIMO QUE HABLÓ CON SU EX

## Notas para el motor de juego

Casillas con efecto mecánico sobre la posición (el resto son retos que se hacen fuera de la app):

| Casilla | Texto | Efecto |
|---|---|---|
| 14 | RETROCEDE 5 CASILLAS | mover -5 |
| 27 | VUELVE A LA SALIDA | mover a casilla 0 |
| 51 | RETROCEDE 10 CASILLAS | mover -10 |
| 47 | ~~TIREN EL DADO LOS NUMEROS IMPARES TOMAN~~ | eliminada |

Las reglas para casillas de movimiento (posiciones mínimas, "VUELVE A LA SALIDA" en las últimas 20) están en `reglas-del-juego.md`.

Preguntas abiertas para decidir en el diseño:
- Si una casilla de retroceso cae antes de la salida o en otra casilla de retroceso: ¿se limita a 0? ¿se aplica el efecto de la nueva casilla?
- Vuelta en curso: ¿"VUELVE A LA SALIDA" regresa a la casilla 1 de la vuelta actual o resta vueltas?
- Texto con `@` (L@S, SOLTER@S, ATRACTIV@): conservar tal cual o normalizar.
- Casillas con jugadores como destino ("a tu derecha", "a tu izquierda", "frente a ti"): la app puede sugerir el jugador concreto según el orden de turnos o dejarlo a la mesa.
- Considerar categorías (beber, reto, verdad, movimiento) para filtros y modos futuros (por ejemplo una versión sin alcohol).
