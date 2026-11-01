# Consejo por síntomas con Claude

## Qué hace

La farmacia (o el comercial) escribe en el chat de Suprafeel Soft qué le pasa a su cliente. Xano manda la consulta a
Claude (modelo `claude-opus-5-5`) junto con las instrucciones de `prompt.md`, que incluyen el catálogo de los 20
productos y las reglas de seguridad. Claude contesta con un JSON fijo (`schema.json`) que trae:

- de 0 a 3 productos, cada uno con su encaje, el motivo y cómo tomarlo;
- los avisos para antes de venderlo;
- si hay que mandar al cliente al médico y con qué urgencia;
- preguntas para afinar el consejo.

Se puede seguir preguntando dentro de la misma consulta, con un máximo de 12 preguntas.

Cada pregunta se paga con los créditos de **tu cuenta de la API de Anthropic** (console.anthropic.com). Esos créditos son
aparte de la suscripción de claude.ai: un plan Pro o Max no cubre la API.

Ya está todo en Xano: el prompt cargado como versión 1 y los endpoints probados. Solo falta la clave. Hasta que la pongas,
el chat responde «El consejo con IA aún no está activado: falta la clave de Claude en Xano.» y no gasta nada.

## Cómo poner la clave

1. Entra en **console.anthropic.com** con la cuenta que vaya a pagar. En *Settings › Billing* comprueba que hay créditos.
2. Recomendado: en *Settings › Workspaces* crea un workspace «Suprafeel» y ponle un **límite de gasto mensual**, por
   ejemplo 50 $ para empezar. Así, aunque algo falle, no se puede gastar más de esa cifra.
3. En *API keys › Create key*, dentro de ese workspace, crea una clave llamada **«Suprafeel Soft»**. Cópiala: solo se
   enseña una vez.
4. En **Xano**, workspace Suprafeel, ve a *Settings › Environment variables › Add*. Nombre: `ANTHROPIC_API_KEY`.
   Valor: la clave. Guarda. No hay que publicar nada más.
5. Para comprobarlo sin gastar nada: con la cuenta de admin, haz `POST /consejo` con `{"mensaje": "prueba", "debug": true}`.
   La respuesta trae `clave_configurada: true` y el cuerpo que se mandaría, sin llamar a Claude.

No pegues la clave en el repositorio ni en ningún chat. Si se filtra, bórrala en la consola y crea otra.

## Cuánto cuesta

Precios de Claude Opus 5.5 por millón de tokens: entrada 4 $, salida 20 $ (el razonamiento cuenta como salida),
escritura de caché 5 $ y lectura de caché 0,20 $.

Cada pregunta manda el prompt y el esquema enteros. Son 83.810 caracteres más 5.000, unos **26.000 tokens**. La cifra
está calculada por caracteres: sin clave no se pueden contar exactos. Ese bloque va en caché:

- la primera pregunta lo escribe en la caché;
- las preguntas de los 5 minutos siguientes lo leen casi gratis, sean del usuario que sean.

La respuesta (razonamiento y JSON) ocupará entre 2.000 y 5.000 tokens.

| Caso | Coste aproximado |
|---|---|
| Pregunta con la caché fría (nadie ha preguntado en 5 min) | 0,17–0,23 $ |
| Pregunta con la caché caliente | 0,05–0,10 $ |
| Cada pregunta de seguimiento en la misma consulta | + 0,01 $ por cada pregunta anterior (el historial se reenvía) |
| Una consulta típica de 2 preguntas | 0,11–0,34 $ |
| 100 preguntas al mes | 5–23 $, según cuántas lleguen con la caché caliente |

Si un filtro de seguridad de Claude rechaza una pregunta, Anthropic la reintenta sola con otro modelo. Ese intento se
cobra a su precio, unos 0,15 $ más. Solo debería pasar en casos raros.

El gasto real queda apuntado en Xano:

- `sf_consejo_mensaje`: cada pregunta, con sus tokens, `coste_usd` y `cache_lectura`;
- `sf_consulta`: el acumulado de cada consulta;
- `GET /admin/consultas`: los totales de hoy, del mes y de siempre.

Tras la primera pregunta real, mira que `cache_lectura` salga por encima de 0 en la segunda. Si es así, la caché funciona.

## Límites

Están en la tabla `sf_consejo_limites`, fila 1. Se cambian ahí, sin tocar código.

- 40 preguntas por persona y día (admin, 200). El día es el de Madrid.
- 2.000 caracteres por pregunta.
- 12 preguntas por consulta. Después hay que empezar una consulta nueva.
- Como mucho 3 productos por respuesta. Xano quita los que no están en el catálogo o salen repetidos.

Con 40 preguntas, lo más que puede gastar una persona en un día es unos 10 $, si todas llegan con la caché fría.

## Probar el prompt con eval.mjs

`eval.mjs` manda a Claude los 25 casos de `casos.json` (27 preguntas), uno detrás de otro, con el mismo cuerpo que manda
Xano. Puntúa cada respuesta y suma el coste. Los 25 casos cuestan **entre 1,5 y 3 $**. Necesitas Node 18 o posterior.

```sh
cd ~/Suprafeel-Web
read -s ANTHROPIC_API_KEY && export ANTHROPIC_API_KEY   # pega la clave y pulsa Intro; no se ve ni queda en el historial
node xano/consejo/eval.mjs                               # todos los casos
node xano/consejo/eval.mjs --solo=resaca,nino-7-anos     # solo algunos
```

En pantalla sale ✓ o ✗ por caso, con lo que falla, y al final el total de casos aprobados, los tokens y el coste en
dólares. Las respuestas completas se guardan en `xano/consejo/eval-out/`, que no se sube a git.

Otras opciones:

- `--pausa=3000`: milisegundos entre llamadas;
- `--fecha=2026-10-31`: la fecha que ve Claude;
- `--reintentos=2`.

## Cambiar el prompt más adelante

1. Edita `prompt.md` o `schema.json` y pasa `eval.mjs`.
2. Cuando esté bien, añade en Xano una fila nueva en `sf_consejo_prompt`, con la versión siguiente y `activo = true`.
   Rellena `texto` con `prompt.md`, `esquema_texto` con `schema.json` tal cual y `esquema` con el mismo JSON.
3. Pon `activo = false` en la versión anterior.

No edites una versión que ya tenga consultas: cada consulta sigue hasta el final con la versión con la que empezó.
El esquema va en `esquema_texto` porque el campo json de Xano cambia el orden de las claves, y ese orden es el orden en
que Claude escribe la respuesta.

El detalle técnico (endpoints, errores y cómo se llama a Claude) está en `xano/HANDOFF.md`, sección «Consejo con Claude».
