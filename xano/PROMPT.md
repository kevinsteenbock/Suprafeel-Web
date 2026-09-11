# Prompt: conectar Xano al front-end de Suprafeel Soft

Copia todo lo que hay debajo de la línea `---` y pégalo como primer mensaje a la sesión de
Claude Code que tiene control de Chrome. Este archivo en sí no se ejecuta; es el texto a pegar.

---

Vas a configurar **solo la base de datos y la API** en Xano para que el front-end de
"Suprafeel Soft" (una app de escritorio-web para farmacias, comerciales y superadmin de un
laboratorio de suplementos) deje de usar datos de ejemplo en memoria y hable con un backend real.
No vas a escribir ni tocar código de la aplicación — solo Xano, a través de Chrome.

## Límite no negociable

Kevin tiene varias instancias en su cuenta de Xano. **Trabaja únicamente dentro de la instancia
que se llama exactamente `suprafeel`.** No crees, borres ni modifiques nada en ninguna otra
instancia, workspace, equipo o ajuste de cuenta. Si al entrar en Xano no ves una instancia con
ese nombre exacto, o hay más de una que podría serlo, **para y pregunta** — no adivines.

Tampoco toques archivos del repositorio salvo uno: al terminar, escribe tu informe en
`xano/HANDOFF.md` (ya existe con las secciones vacías; rellénalas). No hagas `git commit`, no
edites nada en `src/`, no ejecutes `npm run build` ni `npm run deploy`. Tu trabajo vive dentro
de Xano; lo único que tocas en disco es ese único archivo markdown.

## Qué tienes a mano

En este mismo repo, carpeta `xano/seed/`, hay 15 archivos JSON con el contenido **exacto** que
hoy vive hard-codeado en `src/data/*.ts` (los volqué con un script, no están transcritos a mano,
así que confía en ellos letra por letra): `products.json`, `categories.json`, `courses.json`,
`campaigns.json`, `materials.json`, `pharmacies.json`, `route_today.json`, `registry.json`,
`accounts.json`, `signup_requests.json`, `reps.json`, `symptoms.json`, `rules.json`,
`unanswered.json`, `sources.json`.

Vas a crear una tabla en Xano por cada uno de esos archivos (con dos añadidos de autenticación
que explico abajo), importando el JSON directamente — Xano permite crear una tabla a partir de
un JSON/CSV e infiere los campos solo. Después ajustas tipos y nombres según la tabla de abajo.

## Decisión de diseño (no la reabras, ya está tomada)

Cada JSON tiene un campo `"id"` que en realidad es un **slug** de texto (`"magnesio-complex"`,
`"otono"`, `"central"`...) — así es como hoy el front-end arma las URLs y cruza referencias
(`courseId`, `campaignId`...). Xano reserva su propio `id` numérico autoincremental en cada
tabla y no se puede sustituir. Así que:

- Al importar, **renombra el campo `id` del JSON a `slug`** (texto, único) en cada tabla.
- Cualquier campo que en el JSON apunte a otra entidad por string (`courseId`, `campaignId`)
  se queda como **texto plano** (`course_slug`, `campaign_slug`...), NO como relación
  (`table_reference`) de Xano. Nada de resolver a mano el id numérico de cada fila para
  enlazarlas — eso es más frágil que útil en esta primera pasada y no aporta nada todavía.
  La única excepción son las 3 tablas nuevas de actividad de usuario (más abajo), que sí usan
  `table_reference` hacia `user` porque no arrastran datos de partida con los que chocar.
- Los campos que en TypeScript son array u objeto anidado (`composition`, `symptoms`,
  `expressions`, `pending`, `team`, `activity`, `people`, `usage`, `specs`, `products`,
  `lessons`, `materials` dentro de un curso) se quedan **tal cual, como campo tipo `json`** en
  Xano. No los normalices en tablas hijas — el front-end de hoy los lee y escribe siempre como
  un bloque entero por fila padre, así que partirlos ahora mismo solo añade trabajo sin ningún
  beneficio inmediato.
- Nombres de campo en `snake_case` (aunque el JSON venga en camelCase): `categoryLabel` →
  `category_label`, `hasCourse` → `has_course`, etc. Están todos listados abajo.

## Las tablas, una por una

Para cada tabla: nombre exacto, y qué cambiar respecto al JSON tal cual viene.

**`products`** (de `products.json`, 9 filas) — `id`→`slug` (texto, único). `categoryLabel`→
`category_label`. `updatedBy`→`updated_by`. `courseId`→`course_slug` (texto, puede ir vacío).
`consultations30d`→`consultations_30d` (entero). `hasCourse`→`has_course` (bool). `hasPLV`→
`has_plv` (bool). `isNew`→`is_new` (bool). `bestSeller`→`best_seller` (bool). `pvp`/`pvf`
decimales. `composition` y `symptoms` tipo `json`. El resto, texto tal cual.

**`categories`** (de `categories.json`) — ojo, este JSON es un array de *strings sueltos*, no
de objetos. Crea la tabla con un único campo `name` (texto, único) y da de alta una fila por
cada string de la lista (7 filas). No hace falta importador aquí, son 7 filas a mano.

**`courses`** (de `courses.json`, 7 filas, ya incluye "Hierro" que antes faltaba) — `id`→`slug`.
`stateLabel`→`state_label`. `lessons` tipo `json` (queda anidado con sus `files` dentro, tal
cual). `materials` (el array de materiales del curso, no confundir con la tabla `materials` de
PLV) también tipo `json`. `cover` es ya una URL completa y pública (apunta al GitHub Pages en
producción) — déjala como texto, no hace falta subir la imagen a Xano.

**`campaigns`** (de `campaigns.json`, 6 filas) — `id`→`slug`. El campo `materials` aquí es un
**número** (cuenta de materiales), no una lista — renómbralo `materials_count` para que no se
confunda con la tabla `materials`. `adminState`→`admin_state`. `pharmacies` y `requests` son
strings tal cual vienen ("412", "—", "1.204") — no los conviertas a número, mantenlos como
texto. `cover` puede venir vacío (null) en varias filas, es correcto.

**`materials`** (de `materials.json`, 8 filas) — `id`→`slug`. `campaignId`→`campaign_slug`
(texto: todas estas 8 filas son de la campaña `otono`). `supplyMeta`→`supply_meta`. `supplyLow`→
`supply_low` (bool, puede ir vacío). `specs` tipo `json`.

**`pharmacies`** (de `pharmacies.json`, 9 filas) — `id`→`slug`. `lastVisit`→`last_visit`.
`nextVisit`→`next_visit`. `nextToday`→`next_today` (bool, puede ir vacío). `visitsYear`→
`visits_year`. `team` y `activity` tipo `json`. `notes` como texto largo. `notesMeta`→
`notes_meta`.

**`route_today`** (de `route_today.json`, 5 filas) — es la ruta de ejemplo del comercial para
la pantalla "Hoy"; contenido de demo tal cual, no se deriva de nada más. `id`→`pharmacy_slug`
(texto, referencia a `pharmacies.slug`). Resto tal cual: `time`, `name`, `meta`, `state`.

**`registry`** (de `registry.json`, 2 filas) — el buscador de "farmacia ya registrada" del panel
de alta del comercial. `code`, `name`, `meta`, `client` (bool) tal cual.

**`accounts`** (de `accounts.json`, 8 filas) — el CRM del superadmin. `id`→`slug`. `seatsUsed`→
`seats_used`. `people`, `usage` y `activity` tipo `json` (`usage` es un objeto, no un array —
Xano acepta ambos en un campo `json`, no pasa nada).

**`signup_requests`** (de `signup_requests.json`, 7 filas) — `id`→`slug`. `planLabel`→
`plan_label`. `blocked` (bool, puede ir vacío) y `warn` (texto, puede ir vacío).

**`reps`** (de `reps.json`, 6 filas) — sin slug propio hoy: el `name` hace de clave (así lo usa
el front-end). Añade de todas formas un campo único sobre `name` para evitar duplicados.
`pharmacies`, `coverage`, `visits` enteros.

**`symptoms`** (de `symptoms.json`, 9 filas) — `id`→`slug`. `expressions` y `pending` tipo
`json`. `accuracy` entero, puede ir vacío (el síntoma "niebla mental" no tiene todavía).
`detected` bool, puede ir vacío.

**`rules`** (de `rules.json`, 8 filas) — `id`→`slug`. `products` tipo `json` (son productos de
ejemplo con su propio `code`/`name` de texto libre dentro del JSON, no relacionados con la tabla
`products` real — así está hoy en el front-end, no lo arregles en esta pasada). `derive`,
`used`, `useful`, `extra`, `warn` pueden ir vacíos.

**`unanswered`** (de `unanswered.json`, 8 filas) — `id`→`slug`. `hot` bool, puede ir vacío.

**`sources`** (de `sources.json`, 6 filas) — no tiene id/slug propio y nada lo referencia por
string en el resto de la app; deja que Xano use su id numérico normal, sin campo extra.

## Autenticación

Usa la autenticación integrada de Xano ("Add Authentication"), que crea su propia tabla `user`
más los endpoints de signup/login/me. Añade a esa tabla `user` estos campos extra:

- `name` (texto)
- `role` (texto: `farmacia`, `comercial` o `admin`)
- `pharmacy_slug` (texto, vacío salvo que `role = farmacia`; referencia a `pharmacies.slug`)
- `rep_name` (texto, vacío salvo que `role = comercial`; referencia a `reps.name`)

Da de alta estos 3 usuarios de prueba **a través del endpoint de signup** (no metiendo filas a
mano en la tabla, para que la contraseña quede bien hasheada):

```json
{ "email": "laura.vidal@farmaciacentral.es", "password": "Suprafeel2025!", "name": "Laura Vidal", "role": "farmacia", "pharmacy_slug": "central" }
{ "email": "alvaro.ferrer@suprafeel.com", "password": "Suprafeel2025!", "name": "Álvaro Ferrer", "role": "comercial", "rep_name": "Álvaro Ferrer" }
{ "email": "kevin@suprafeel.com", "password": "Suprafeel2025!", "name": "Kevin Steenbock", "role": "admin" }
```

Es una contraseña temporal de desarrollo — dilo así de claro en tu informe para que se cambie
antes de que esto sea público de verdad.

## Tres tablas nuevas, sin JSON de partida (aquí sí hay relación de verdad)

Estas reemplazan estado que hoy vive en `localStorage` del navegador
(`src/app/store.tsx`). Aquí sí usa `table_reference` hacia `user`, porque no hay datos previos
con los que pueda chocar:

- **`saved_products`** — `user` (table_reference → user), `product_slug` (texto). Sustituye a
  "Mi lista".
- **`plv_requests`** — `user` (table_reference → user), `material_slug` (texto), `qty` (entero).
  Sustituye a la solicitud de material PLV.
- **`consejo_cases`** — `user` (table_reference → user), `query_text` (texto, puede ir vacío).
  Sustituye al contador de "casos guardados" del consejo por síntomas — aquí cada fila es un
  caso, así que el número que hoy se muestra sale de contar filas, no de un contador suelto.

Para estas 3, en el endpoint de listar y de crear, añade un filtro/paso en el function stack que
las limite al usuario autenticado (`where user_id == auth.id`) — es el único retoque de lógica
que te pido en toda esta tarea; todo lo demás es esquema y CRUD automático.

## Endpoints

Para cada una de las 18 tablas (15 del seed + las 3 nuevas), genera el CRUD automático de Xano
(listar, ver uno, crear, actualizar, borrar) dentro de un único grupo de API — llámalo
`suprafeel` si no existe ya uno con ese nombre, o reutiliza el que haya si la instancia ya tenía
uno pensado para esto. Deja el CRUD de las 15 tablas de catálogo/contenido sin exigir
autenticación (son datos de producto, no datos personales) y el de las 3 tablas de actividad de
usuario exigiéndola.

## CORS

Revisa los ajustes de la instancia (o del grupo de API) y confirma que se puede llamar desde:

- `https://kevinsteenbock.github.io` (el sitio en producción)
- `http://localhost:5173` (desarrollo local)

Si ya está abierto a cualquier origen, no toques nada, solo dilo en el informe. Si hay una lista
cerrada, añade esos dos orígenes.

## Antes de dar nada por bueno

Prueba con una llamada real (puedes usar el propio "Run" de Xano o `curl` desde la terminal si
tienes acceso a ella, lo que te resulte más rápido):

1. Un `GET` a la lista de `products` — que devuelva las 9 filas.
2. El signup de los 3 usuarios de prueba, y luego login con cada uno — que devuelva un token.
3. Con el token de Laura, un `POST` a `saved_products` y luego un `GET` — que la fila salga
   ligada a su usuario y no a los otros dos.

## Qué me tienes que dejar (en `xano/HANDOFF.md`, ya tiene las secciones — rellénalas)

- Nombre exacto de la instancia y del workspace, y la URL base de la API (algo del tipo
  `https://x8xx-xxxx-xxxx.n7.xano.io/api:xxxxxxxx`).
- Los endpoints de auth (login/signup/me) con su método y cómo se manda el token (qué header,
  qué prefijo si lleva `Bearer`).
- Tabla por tabla: nombre final en Xano, y solo los campos donde el nombre o el tipo cambió
  respecto a lo que puse arriba (si seguiste todo tal cual, dilo y ya está).
- La lista de los 18 endpoints CRUD con su método y ruta.
- Qué encontraste en CORS y qué tocaste, si tocaste algo.
- Cualquier cosa que no pudiste hacer igual que aquí pone, o que decidiste distinto, y por qué.
- Un par de `curl` de ejemplo que ya probaste y funcionan (uno de lectura pública, uno con
  token), para que pueda verificarlo yo también sin repetir tu trabajo.

Con eso me basta para conectar el front-end. No hace falta que toques nada de React ni del
repositorio más allá de ese archivo.
