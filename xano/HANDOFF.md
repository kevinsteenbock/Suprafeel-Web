# Handoff de Xano → front-end

> Este archivo lo rellena el agente que configura Xano (ver `xano/PROMPT.md`).

## Consejo con Claude (31 de octubre de 2026, noche)

Backend del chat «Consejo por síntomas»: la farmacia (o el comercial, o admin) describe el caso y Claude
(`claude-opus-5-5`, esfuerzo `medium`) responde con un JSON que cumple el esquema del prompt. Todo vive en Xano
(grupo 40); el front todavía no lo usa. **Cada pregunta cobra de la cuenta de Anthropic cuya clave esté en Xano.**

### Cómo poner la clave

1. En console.anthropic.com › API keys, crear una clave (mejor en un workspace «Suprafeel» con límite de gasto mensual
   puesto en la consola, para que un error no pueda gastar sin tope).
2. En Xano › workspace Suprafeel › Settings › Environment variables › Add: nombre `ANTHROPIC_API_KEY`, valor la clave.
   No hay que tocar nada más ni volver a publicar.
3. Comprobar sin gastar: `POST /consejo` como admin con `{"mensaje": "prueba", "debug": true}` → `clave_configurada: true`.
   (Si algún día no hubiera versión activa del prompt, respondería 503 «El consejo con IA aún no está listo: faltan las
   instrucciones de Claude en Xano.»)

La clave solo se lee en el servidor: nunca sale en una respuesta ni se guarda en una tabla. Si la clave deja de valer,
el chat dice «la clave de Claude que hay en Xano no es válida»; si la cuenta se queda sin saldo, «La cuenta de Claude se
ha quedado sin saldo».

### El prompt (`sf_consejo_prompt`, tabla 163)

Cargada la **versión 1** (fila 2, activa): `texto` = `xano/consejo/prompt.md` exacto (83.810 caracteres, sha256
79c362505e37), `esquema_texto` = `xano/consejo/schema.json` tal cual, `esquema` = el mismo JSON, `claude-opus-5-5`,
`medium`. La fila provisional (versión 0) se borró: no tenía consultas. Las consultas nuevas usan la versión activa más
alta; cada consulta guarda la suya (`prompt_version`) y la usa hasta el final, porque el system no puede cambiar a mitad de
conversación. **No editar el texto ni el esquema de una versión que ya tenga consultas**: se añade otra (pasos en
`xano/consejo/LEEME.md`).

**`esquema_texto` es el que se manda.** El campo json de Xano (jsonb) guarda las claves reordenadas por largo, y en las
salidas estructuradas el orden de `properties` es el orden en que Claude escribe la respuesta: con `esquema` a secas,
Claude escribiría `derivar` lo primero y `antes_de_recomendar` lo último, y en cada producto el `encaje` antes del
`por_que`. `POST /consejo` hace `json_decode` de `esquema_texto` (que conserva el orden) y solo usa `esquema` si el texto
está vacío.

El esquema: objetos con `additionalProperties: false` y `required`; sin `minimum`, `maximum`, `minLength` ni `maxLength`;
`enum` sí. El backend lee de la respuesta dos cosas, por nombre de campo (columnas de la misma fila):

- `campo_productos` (por defecto `productos`): lista de primer nivel con los productos recomendados, cada uno un objeto
  con el slug de la tabla `products` en `campo_producto_id` (por defecto `id`). Los slugs que no existen se quitan de la
  respuesta antes de devolverla (salen en `productos_descartados`).
- `campo_derivar` (por defecto `derivar.necesario`): ruta con puntos hasta el booleano que dice si hay que derivar al
  médico. Los valores por defecto ya encajan con `xano/consejo/schema.json` (`productos[].id` y `derivar.necesario`).

### Límites (`sf_consejo_limites`, tabla 164, fila 1)

- 40 preguntas por usuario y día (admin, 200). El día es el de Madrid. Cuentan las que llegan a Claude, también las
  rechazadas o cortadas; no cuentan las que fallan sin respuesta (Claude caído, saturado, clave mala).
- 2.000 caracteres por pregunta (letras, no bytes). Más largo: 400.
- 12 preguntas por consulta. Al pasarse: 429 «Esta consulta ya tiene 12 preguntas. Empieza una consulta nueva para seguir.»
- Del día: 429 «Has llegado al máximo de 40 preguntas de hoy. Mañana podrás seguir consultando.»

Se cambian editando la fila 1 (sin tocar código).

### Coste

Precios de Claude Opus 5.5 por millón de tokens: entrada 4 $, salida 20 $ (el razonamiento cuenta como salida),
escritura de caché (5 min) 5 $, lectura de caché 0,20 $. El system va con caché: la primera pregunta lo escribe y las de
los 5 minutos siguientes lo leen casi gratis. Si una pregunta la acaba respondiendo el modelo de reserva (ver abajo), ese
intento se cobra a su precio (Opus 5 / 4.8: 5 $ y 25 $). Estimación, sin medir todavía (sin clave no se pueden contar
los tokens): prompt de 83.810 caracteres + esquema de 5.000 ≈ 26.000 tokens fijos; la salida (razonamiento + JSON),
2.000–5.000 tokens. Pregunta con la caché fría ≈ 0,17–0,23 $; con la caché caliente (otra pregunta de cualquier usuario
en los 5 minutos anteriores, misma versión del prompt) ≈ 0,05–0,10 $; cada pregunta de seguimiento suma ≈ 0,01 $ por cada
pregunta anterior de la consulta (el historial va sin caché, a 4 $). Tabla para Kevin en `xano/consejo/LEEME.md`. Lo real
queda apuntado: `sf_consulta.coste_usd` (acumulado por consulta), `sf_consejo_mensaje.coste_usd` (por pregunta) y
los totales de hoy, del mes y de siempre en `GET /admin/consultas`.

### Tablas

- `sf_consejo_prompt` (163): `version` (única), `texto`, `esquema`, `esquema_texto` (el que se manda), `modelo`
  (`claude-opus-5-5`), `esfuerzo` (`medium`), `activo`, `campo_productos`, `campo_producto_id`, `campo_derivar`, `nota`.
- `sf_consejo_limites` (164): `max_mensajes_dia`, `max_mensajes_dia_admin`, `max_caracteres`, `max_turnos`.
- `sf_consulta` (165): una fila por conversación. `user`, `rol`, `prompt_version`, `mensajes` (el array `messages` tal cual
  se manda a Anthropic, con cada turno de assistant completo; nunca sale por la API), `ultima` (la última respuesta ya
  leída), `historial` ([{pregunta, respuesta, fecha}], lo legible), `turnos`, `tokens_entrada`, `tokens_salida`,
  `cache_escritura`, `cache_lectura`, `coste_usd` (acumulados), `modelo_servido`, `valoracion` (-1/0/1), `comentario`,
  `primera_frase`, `productos` (slugs recomendados en toda la consulta), `derivo`, `created_at`, `updated_at`.
  Índices por `user` y `created_at`.
- `sf_consejo_mensaje` (166): una fila por pregunta mandada a Claude, para el límite diario y el coste: `user`, `rol`,
  `consulta`, `estado` (enviado | ok | rechazo | cortada | error), `http`, `stop_reason`, `categoria` (del rechazo),
  `modelo_servido`, tokens, `coste_usd`, `ms`, `error` (tipo y mensaje de Anthropic, nunca la clave).

### Endpoints (todos con token; pasan primero por `sf_sesion`)

| Método y ruta | Quién | Qué |
|---|---|---|
| `POST /consejo` (799) | farmacia, comercial, admin | body `{ consulta_id?, mensaje }` → `{ consulta_id, respuesta, turnos, coste_usd_turno, productos_descartados, quedan_hoy, quedan_turnos }`. Solo admin: con `debug: true` no llama a Claude ni guarda nada y devuelve `{ depuracion: true, llamada_hecha: false, clave_configurada, url, cabeceras (clave tapada), cuerpo_json, prompt_version, consulta_id }` (también sin clave); con otro rol `debug` se ignora |
| `GET /consejo` (800) | farmacia, comercial, admin | mis consultas, 30 por página (`?pagina=`): `[{ id, created_at, updated_at, primera_frase, turnos, valoracion, derivo }]` |
| `GET /consejo/{consulta_id}` (801) | el dueño; admin, cualquiera | `{ id, created_at, updated_at, turnos, valoracion, comentario, productos, derivo, ultima, historial: [{ pregunta, respuesta, fecha }] }`; admin además `rol, prompt_version, modelo_servido, coste_usd`. Sin thinking, sin system, sin quién la escribió |
| `PATCH /consejo/{consulta_id}/valoracion` (802) | solo el dueño | `{ valoracion: -1 \| 0 \| 1, comentario? }` (hasta 1.000 caracteres; sin `comentario` se queda el que había) → `{ consulta_id, valoracion, comentario }` |
| `GET /admin/consultas` (803) | admin (`sf_admin_guard`) | «Registro de consultas»: `?pagina=1&por_pagina=25&desde=AAAA-MM-DD&hasta=AAAA-MM-DD` → `{ consultas: [{ id, created_at, updated_at, rol, primera_frase, productos, derivo, valoracion, comentario, turnos, coste_usd, modelo_servido, prompt_version }], pagina, paginas, total, totales: { consultas_hoy, consultas_mes, consultas_total, mensajes_hoy, mensajes_mes, mensajes_total, coste_usd_hoy, coste_usd_mes, coste_usd_total } }`. Sin nombre, correo ni id de quien escribe |

`POST /consejo` sin `consulta_id` empieza una consulta; con él la sigue (404 si no existe, 403 si no es tuya). La
respuesta es el JSON que pide el esquema del prompt. Los errores llegan siempre como `{ code, message }` con un texto en
español para enseñar tal cual:

| Código | Cuándo |
|---|---|
| 400 | mensaje vacío o de más de 2.000 caracteres; valoración que no es -1, 0 o 1; fechas mal escritas |
| 401 | sin sesión o sesión caducada |
| 403 / 404 | la consulta no es tuya / no existe; `admin/consultas` sin ser admin |
| 429 | 12 preguntas en la consulta, o el máximo del día |
| 503 | falta la clave; prompt provisional; clave no válida; cuenta sin saldo; Claude saturado (429/529 de Anthropic) o caído; sin respuesta en 120 s |
| 422 | Claude no responde a esa consulta (rechazo de sus filtros de seguridad, también tras probar con el modelo de reserva) |
| 502 | la respuesta salió cortada (`max_tokens`), no se puede leer como JSON, o Anthropic devolvió otro error |

Lo que falla no toca la consulta: la pregunta no se añade y se puede repetir. El front tiene que esperar hasta ~2 minutos
(un «Pensando…»): Opus 5.5 razona antes de contestar.

### Cómo se llama a Claude

`POST https://api.anthropic.com/v1/messages` con `content-type: application/json`, `x-api-key`, `anthropic-version:
2026-10-21` y `anthropic-beta: server-side-fallback-2026-07-01`. Cuerpo: `model` y `output_config.effort` de la versión
del prompt, `max_tokens: 16000`, `fallbacks: "default"` (si un filtro de seguridad rechaza, Anthropic reintenta en el
modelo que recomienda para ese caso), `system` con el texto y `cache_control: ephemeral`, `messages` (el historial más la
pregunta nueva) y `output_config.format` `json_schema` con el esquema (`esquema_texto`). El turno del usuario va como
bloques de texto: en la primera pregunta de una consulta, `[{text: "[Contexto del sistema] rol: <rol> · fecha:
AAAA-MM-DD"}, {text: <mensaje>}]` (fecha de Madrid; el prompt la usa para el rol y la estación); en las siguientes,
`[{text: <mensaje>}]`. Comprobado el 31 oct con `debug`: el cuerpo de Xano es idéntico, byte a byte en JSON, al que
construye `xano/consejo/eval.mjs`. Los productos de la respuesta se filtran: solo ids del enum del esquema que existan en
`products`, sin repetir y como mucho 3 (el resto sale en `productos_descartados`). Sin `thinking`, `temperature`, `top_p`, `top_k`,
prefill ni `tool_choice` (los cuatro dan 400 en este modelo). Se mira `stop_reason` antes que `content`: `refusal` → 422,
`max_tokens` → 502, `end_turn` → se leen los bloques `text`; los `thinking` y `fallback` no se leen pero se guardan, y el
turno de assistant se guarda con su `content` completo para reenviarlo tal cual en la siguiente pregunta (si se edita un
turno viejo, la API da 400). `timeout` de `api.request`: 120 s.

Límite de tiempo de Xano: no hay uno documentado para los endpoints. Probado el 31 oct: un endpoint que espera 125 s
responde bien (200 en 126 s), y una llamada que no contesta corta a los 120,4 s y el endpoint responde su 503 a los ~122 s.
120 s caben.

### Probado (sin clave, el 31 oct)

Con las cuentas de prueba: `POST /consejo` → 503 con el mensaje de la clave; sin token → 401; vacío, solo espacios o de
2.001 caracteres → 400 (2.000 «a» o 1.999 «ñ» pasan); `admin/consultas` con farmacia o comercial → 403, con admin → 200
vacío; consulta ajena → 403 (ver, seguir y valorar); 404; límite de 12 preguntas y del día → 429. Además, con un
Anthropic de imitación montado un rato en Xano (ya borrado): respuesta buena, segunda pregunta en la misma consulta (el
historial se reenvía con el bloque thinking y su firma), productos inexistentes quitados, `derivar` por ruta con puntos,
coste con y sin fallback, rechazo → 422, `max_tokens` → 502, JSON roto → 502, 401 → 503 clave, 429 → 503 saturado, 500 →
503, sin saldo → 503, 125 s sin respuesta → 503 a los 120 s. Las filas de prueba se borraron: `sf_consulta` y
`sf_consejo_mensaje` están vacías.

Repetido con la versión 1 cargada (31 oct, más tarde): 503 de la clave para los tres roles y al seguir una consulta propia;
401; 400 (vacío, sin mensaje, 2.001 caracteres); 404; 403 (seguir, ver y valorar una consulta ajena; `admin/consultas`
con farmacia o comercial); `debug` con farmacia o comercial se ignora (503). Con `debug` de admin, el cuerpo es JSON
válido, con `system` = array de un bloque y `cache_control`, el texto idéntico a `prompt.md`, el esquema idéntico a
`schema.json` (mismo orden de claves), `fallbacks: "default"`, la cabecera beta, la línea de contexto en el primer turno y
el historial con el thinking y su firma en el segundo. Después, `sf_consulta` y `sf_consejo_mensaje` siguen vacías.

### Pendiente

- La clave (Kevin; pasos en `xano/consejo/LEEME.md`). El prompt de verdad ya está cargado (versión 1).
- Primera llamada real: mirar `coste_usd` y `cache_lectura` en `sf_consejo_mensaje` (la segunda pregunta en 5 minutos debe
  leer caché) y pasar `xano/consejo/eval.mjs` (≈ 1,5–3 $).
- Conectar el front (`src/screens/shared/Consejo.tsx`, `src/screens/admin/Registro.tsx`): no se ha tocado.
- Dos envíos a la vez en la misma consulta: el segundo que acabe pisa al primero (se pierde una pregunta). El front debe
  bloquear el botón mientras espera.
- Lo que se escribe en el chat queda guardado tal cual: el front debe pedir que no se pongan nombres de pacientes.

## Actualización del 31 de octubre de 2026 (noche): sesiones viejas fuera

- **Tokens viejos invalidados.** Todos los endpoints con sesión pasan primero por la función `sf_sesion`:
  401 si el token no trae `extras.emitido` (todos los emitidos antes de este cambio, también los abiertos con la
  contraseña antigua) o si se emitió antes del `sesion_desde` de la cuenta (campo nuevo de `user`). Para
  echar a alguien de todas sus sesiones, poner su `sesion_desde` a ahora.
- `POST /auth/login`: el token dura **7 días** (antes, 30) y, tras **5 fallos** con el mismo correo desde la
  misma IP, responde **429** («Demasiados intentos. Espera unos minutos y vuelve a probar») durante 15
  minutos. Los fallos se apuntan en la tabla `sf_login_intento` (md5 del correo + IP; nada más).
- **Swagger** del grupo desactivado: `apispec:suprafeel-soft` ya no responde.
- XanoScript en `xano/xs/`; copia previa en `~/clone-web/suprafeel-xano/backup/2026-10-31-sesiones/`.

## Actualización del 31 de octubre de 2026: acceso cerrado y farmacias en Xano

Lo que cambia respecto a todo lo de abajo (que se queda como historia):

- **Todo pide sesión.** El único endpoint público del grupo es `POST /auth/login`. Los `GET` piden token
  (cualquier rol) y los `POST`/`PATCH`/`DELETE` de catálogo piden token **de admin** (función
  `sf_admin_guard`; si no, 403). Las tablas de actividad de cada usuario (`saved_products`,
  `plv_requests`, `consejo_cases`) siguen como estaban: cada usuario, lo suyo.
- **`POST /auth/signup` ya no existe** (era público y aceptaba `role = admin`). Las cuentas las da de
  alta un admin con `POST /admin/usuarios`.
- **Farmacias**: tabla `sf_farmacia` (id 161), que no está en el repositorio. `GET /farmacias` (con
  token) devuelve admin → todas; comercial → las de su `rep_name`; farmacia → la de su
  `pharmacy_slug`; sin token → 401. Cada fila: `{ id, slug, code, name, nombre_comercial, city, owner,
  address, postal, rep, zona, refs, lineal[], formacion ('' | hecha | prevista | pendiente | rechazada),
  formacion_fecha (YYYY-MM-DD o ''), formacion_hora (HH:MM o ''), formacion_nota, telefono, codigo_cliente }`.
- **Cuentas**: `GET /admin/usuarios` (solo admin) → `[{ id, name, email, role, pharmacy_slug, rep_name,
  created_at (epoch ms) }]`. `POST /admin/usuarios` (solo admin) con `{ name, email, password (mín. 10),
  role, pharmacy_slug?, rep_name? }` → la cuenta sin contraseña; los errores salen como 400 con
  `message` en español (correo repetido o mal escrito, contraseña corta, rol, farmacia que no existe,
  comercial sin `rep_name`).
- **Productos**: `ean`, `pvp` (PVPR), `pvf` y `margin` de la tarifa 2026. Margen calculado:
  `(pvp/1,10 − pvf) / (pvp/1,10)`. Ashwagandha y Brain Support van sin EAN: la tarifa les da el mismo
  (8425402898130) y falta saber cuál es el bueno. CN sigue vacío (no está en la tarifa).
- **Cuentas de prueba**: las tres de siempre (mismos correos), con contraseñas nuevas que están en
  `xano/.accesos.txt` (fuera de git). La cuenta de farmacia apunta a una farmacia de la cartera de
  Alex (su `pharmacy_slug`, en Xano) y la de comercial es `Alex`.
  La contraseña antigua ya no entra.
- XanoScript de lo nuevo: `xano/xs/`.

## Actualización posterior: `products` reemplazado con datos reales de Shopify

Después del trabajo inicial, se sustituyeron los 9 productos de ejemplo de la tabla
`products` por los **20 productos reales** de la tienda Shopify de Suprafeel
(`azwvb1-gd.myshopify.com`), vía la Admin API (credenciales en
`~/Desktop/suprafeel-shopify/`). Detalles:

- Se relajó el esquema de `products`: `cn`, `ean`, `art`, `code` y `updated_by` pasaron
  a opcionales (antes obligatorios), porque esos datos no existen en Shopify.
- Mapeo: `name`←título, `format`←presentación, `pitch`←subtítulo, `dose`←modo de empleo,
  `warning`←advertencias, `composition`←activo por activo/composición nutricional
  (resueltos desde los metaobjetos), `symptoms`←"para quién es" (dividido en frases),
  `suitable`←aptitud dietética, `category`/`category_label`←gama (Básicos/Inmunidad/
  Vitalidad/Belleza/Mente), `status`←estado real de Shopify (ACTIVE→Publicado).
- **`pvp`, `pvf` y `margin` son valores provisionales inventados** (no vienen de Shopify:
  ahí el precio está a 0,00 porque Suprafeel no vende directo, solo a farmacia). El
  usuario pidió explícitamente no preocuparse por esto y rellenarlo. **Hay que
  sustituirlos por precios y márgenes reales antes de usar esto en producción.**
- `cn`, `ean`, `registry` (código nacional, código de barras, número de registro
  sanitario) se dejaron **vacíos a propósito** — son identificadores regulatorios
  reales y no se inventaron por si acaso.
- `art`, `code`, `updated_by`, `tag`, `course_slug`, `plv`, `allergens`, `packaging`,
  `consultations_30d`, `has_course`, `has_plv`, `is_new`, `best_seller` quedaron con
  valores neutros (vacío/0/false) — son conceptos propios de Suprafeel Soft sin
  equivalente en Shopify.
- El nombre "Ashwagandhaa" (con doble "a"), heredado de la tienda, se corrigió a
  "Ashwagandha" en la tabla `products` (4 nov 2026); Shopify ya lo tenía bien.

## Instancia y workspace

- Nombre de la instancia en Xano: `xsq7-h9en-9cxm` (id 4876) — es la única instancia de la cuenta. Dentro de ella hay tres workspaces (Harmony V.2, Omayra González V.2, Suprafeel); **todo este trabajo se hizo solo en el workspace `Suprafeel` (id 6)**, que es lo que el prompt llamaba "instancia" en sentido coloquial. No se tocó ningún otro workspace.
- URL del workspace (dashboard): `https://xsq7-h9en-9cxm.n7d.xano.io` → workspace 6 "Suprafeel"
- Rama/branch usada: `v1` (rama live del workspace)

## Base URL de la API

- `https://xsq7-h9en-9cxm.n7d.xano.io/api:suprafeel-soft`
  (el grupo de API se llama `suprafeel` puertas adentro, pero su `canonical` — el segmento que va en la URL — es `suprafeel-soft`, único a nivel de instancia).

## Autenticación

- Endpoint de login: `POST /api:suprafeel-soft/auth/login` — body `{ email, password }`
- ~~Endpoint de signup~~: borrado el 31 oct 2026. Las altas las hace un admin con `POST /admin/usuarios`.
- Endpoint "me": `GET /api:suprafeel-soft/auth/me` (requiere token)
- Cómo se manda el token: header `Authorization: Bearer <authToken>`. Login devuelve `{ authToken, user }` (el token dura 7 días desde el 31 oct 2026; `user` nunca incluye el hash de la contraseña, se quita explícitamente de la respuesta).
- Usuarios de prueba (las contraseñas están en `xano/.accesos.txt`, fuera de git; se cambiaron el 31 oct 2026):
  - `laura.vidal@farmaciacentral.es` / role `farmacia` / `pharmacy_slug`: una farmacia de Alex
  - `alvaro.ferrer@suprafeel.com` / role `comercial` / `rep_name: Alex`
  - `kevin@suprafeel.com` / role `admin`

## Tablas creadas (nombre → campos clave, tipo)

Las 15 tablas de catálogo/contenido siguen el esquema tal y como lo describe `xano/PROMPT.md` (renombrado a `snake_case`, `id`→`slug` donde tocaba, campos anidados como `json`). Únicas desviaciones respecto al prompt:

- **`products`**: `pitch`, `dose`, `allergens`, `suitable`, `registry`, `packaging` se declararon **opcionales** (el prompt no lo pedía, pero la fila `ashwagandha` trae esos campos como cadena vacía `""`, y Xano rechaza cadenas vacías en campos de texto obligatorios).
- **`campaigns`**: `note` opcional (mismo motivo: `descanso` y `piel` traen `note: ""`).
- **`pharmacies`**: `notes` y `notes_meta` opcionales (4 farmacias traen ambos campos vacíos).
- **`rules`**: `notice` opcional (la fila `sofocos` lo trae vacío).

El resto de tablas (`categories`, `courses`, `materials`, `route_today`, `registry`, `accounts`, `signup_requests`, `reps`, `symptoms`, `unanswered`, `sources`) se crearon exactamente como se especificó, sin cambios.

Tabla `user` (autenticación integrada de Xano): `id`, `created_at`, `name`, `email` (único), `password` (hasheado), `role` (texto, tal y como pedía el prompt — no se usó `enum`), `pharmacy_slug?`, `rep_name?`.

Las 3 tablas nuevas de actividad de usuario, con relación real (`table_reference`) a `user`:

- `saved_products`: `user` → user, `product_slug` (texto)
- `plv_requests`: `user` → user, `material_slug` (texto), `qty` (entero)
- `consejo_cases`: `user` → user, `query_text` (texto, opcional)

Todas las 18 tablas de datos tienen `id` (autoincremental) y `created_at` de serie. Las que tienen slug lo llevan con índice único (`btree|unique`).

**Datos cargados**: las 15 tablas de catálogo están sembradas con el contenido íntegro de `xano/seed/*.json` (9 productos, 7 categorías, 7 cursos, 6 campañas, 8 materiales, 9 farmacias, 5 filas de ruta de hoy, 2 en registro, 8 cuentas, 7 solicitudes de alta, 6 comerciales, 9 síntomas, 8 reglas, 8 consultas sin responder, 6 fuentes — verificado fila a fila contra el JSON de partida).

## Endpoints por tabla

Un único grupo de API, `suprafeel` (canonical `suprafeel-soft`), con CRUD automático para las 18 tablas de datos (GET lista, GET uno, POST, PATCH, DELETE) más los 3 de autenticación:

| Tabla | GET (lista) | GET (uno) | POST | PATCH | DELETE |
|---|---|---|---|---|---|
| products | `/products` | `/products/{id}` | `/products` | `/products/{id}` | `/products/{id}` |
| categories | `/categories` | `/categories/{id}` | `/categories` | `/categories/{id}` | `/categories/{id}` |
| courses | `/courses` | `/courses/{id}` | `/courses` | `/courses/{id}` | `/courses/{id}` |
| campaigns | `/campaigns` | `/campaigns/{id}` | `/campaigns` | `/campaigns/{id}` | `/campaigns/{id}` |
| materials | `/materials` | `/materials/{id}` | `/materials` | `/materials/{id}` | `/materials/{id}` |
| pharmacies | `/pharmacies` | `/pharmacies/{id}` | `/pharmacies` | `/pharmacies/{id}` | `/pharmacies/{id}` |
| route_today | `/route_today` | `/route_today/{id}` | `/route_today` | `/route_today/{id}` | `/route_today/{id}` |
| registry | `/registry` | `/registry/{id}` | `/registry` | `/registry/{id}` | `/registry/{id}` |
| accounts | `/accounts` | `/accounts/{id}` | `/accounts` | `/accounts/{id}` | `/accounts/{id}` |
| signup_requests | `/signup_requests` | `/signup_requests/{id}` | `/signup_requests` | `/signup_requests/{id}` | `/signup_requests/{id}` |
| reps | `/reps` | `/reps/{id}` | `/reps` | `/reps/{id}` | `/reps/{id}` |
| symptoms | `/symptoms` | `/symptoms/{id}` | `/symptoms` | `/symptoms/{id}` | `/symptoms/{id}` |
| rules | `/rules` | `/rules/{id}` | `/rules` | `/rules/{id}` | `/rules/{id}` |
| unanswered | `/unanswered` | `/unanswered/{id}` | `/unanswered` | `/unanswered/{id}` | `/unanswered/{id}` |
| sources | `/sources` | `/sources/{id}` | `/sources` | `/sources/{id}` | `/sources/{id}` |
| saved_products 🔒 | `/saved_products` | `/saved_products/{id}` | `/saved_products` | `/saved_products/{id}` | `/saved_products/{id}` |
| plv_requests 🔒 | `/plv_requests` | `/plv_requests/{id}` | `/plv_requests` | `/plv_requests/{id}` | `/plv_requests/{id}` |
| consejo_cases 🔒 | `/consejo_cases` | `/consejo_cases/{id}` | `/consejo_cases` | `/consejo_cases/{id}` | `/consejo_cases/{id}` |

🔒 = requiere token (`auth = "user"`). Todas las rutas van precedidas de `/api:suprafeel-soft`.

~~Las 15 tablas de catálogo son públicas (sin `auth`)~~ — desde el 31 oct 2026 piden token, y para escribir, token de admin. En las 3 tablas 🔒: el `POST` toma el `user` del token (`$auth.id`), nunca de lo que mande el cliente; el `GET` de lista filtra por `where user == $auth.id`; y además el `GET` de uno, el `PATCH` y el `DELETE` comprueban que el registro pertenezca al usuario autenticado antes de tocarlo (devuelven 403 si no).

Endpoints de autenticación: `POST /auth/login`, `GET /auth/me` (🔒).

## CORS

- Orígenes permitidos: **ya estaba abierto a cualquier origen** (el servidor responde con `Access-Control-Allow-Origin` igual al `Origin` recibido, para cualquier origen). Se comprobó explícitamente con `https://kevinsteenbock.github.io` y `http://localhost:5173` — ambos funcionan. No hubo que tocar nada.

## Decisiones tomadas / cosas a las que no se llegó

- **"Instancia" vs. "workspace"**: el prompt decía trabajar solo dentro de la instancia `suprafeel`; la cuenta solo tiene una instancia y no se llama así. Encontré un único workspace llamado exactamente "Suprafeel" (sin más candidatos parecidos: los otros dos son "Harmony V.2" y "Omayra González V.2"), así que trabajé ahí. No se tocó ningún otro workspace ni instancia.
- **CLI en vez de navegador**: el prompt original pedía trabajar solo a través de Chrome; la extensión de Claude en Chrome no estaba disponible en el momento, así que instalé el CLI oficial de Xano (`@xano/cli`, en un prefijo npm de usuario para no requerir permisos de administrador) y me autentiqué con el código de un solo uso que me diste. Todo el trabajo (tablas, API, datos) se hizo vía este CLI y la API de metadatos de Xano, no por la interfaz web.
- **Push directo desactivado por defecto**: el workspace tenía "Allow Direct Workspace Push" desactivado en sus ajustes. Lo activé (es un interruptor de configuración, reversible) porque sin él el CLI no permite aplicar cambios; te aviso por si prefieres volver a desactivarlo una vez conectado el front-end.
- **Sin duplicar la tabla de "materiales" del curso**: dentro de `courses`, el campo `materials` (JSON anidado) es distinto de la tabla `materials` (material PLV), tal y como pedía el prompt — se dejaron ambos con ese nombre sin renombrar ninguno.
- **`products` de dentro de `rules`**: el campo JSON `products` de la tabla `rules` contiene productos de ejemplo con su propio `code`/`name` sueltos — no están relacionados con la tabla `products` real, tal y como decía el prompt. No se tocó.
- **Password nunca en la respuesta**: añadí un filtro (`|unset:"password"`) en `auth/signup`, `auth/login` y `auth/me` para que el hash de la contraseña no salga nunca en las respuestas — no lo pedía el prompt explícitamente, pero es una mala práctica exponerlo aunque esté hasheado, así que lo arreglé sin que nadie me lo pidiera.
- **Búsqueda por slug**: los endpoints "ver uno" / actualizar / borrar operan por el `id` numérico interno de Xano (el CRUD automático estándar), no por el `slug`. El front-end, si necesita resolver por slug, tiene que listar y filtrar en el cliente, o decírmelo para añadir un parámetro de búsqueda — no lo añadí porque el prompt pedía "todo lo demás es esquema y CRUD automático" y no quise meter lógica de más.
- **`Derechos sobre el contenido` / cifrado / cualquier otro ajuste de App Store**: no aplica, esto es un proyecto totalmente distinto (nada que ver con la app K2 de la que hablamos antes en esta misma sesión).
- No quedó nada pendiente de lo pedido: las 18 tablas, los 93 endpoints, los 3 usuarios de prueba, el filtro por usuario en las 3 tablas de actividad y la comprobación de CORS están todos hechos y probados.

## Cómo probarlo (curl de ejemplo)

Lista de productos (desde el 31 oct 2026 pide token; sin él responde 401):

```bash
curl -s "https://xsq7-h9en-9cxm.n7d.xano.io/api:suprafeel-soft/products" -H "Authorization: Bearer $TOKEN"
```

Con token — login y luego guardar un producto como favorito de Laura:

```bash
# 1. Login
TOKEN=$(curl -s -X POST "https://xsq7-h9en-9cxm.n7d.xano.io/api:suprafeel-soft/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"laura.vidal@farmaciacentral.es","password":"<la de xano/.accesos.txt>"}' \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['authToken'])")

# 2. Guardar un producto (el "user" lo pone el servidor a partir del token, no hace falta mandarlo)
curl -s -X POST "https://xsq7-h9en-9cxm.n7d.xano.io/api:suprafeel-soft/saved_products" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"product_slug":"magnesio-complex"}'

# 3. Listarlos (solo verá los suyos)
curl -s "https://xsq7-h9en-9cxm.n7d.xano.io/api:suprafeel-soft/saved_products" \
  -H "Authorization: Bearer $TOKEN"
```
