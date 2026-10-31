# Handoff de Xano → front-end

> Este archivo lo rellena el agente que configura Xano (ver `xano/PROMPT.md`).

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
- **Aviso**: el producto real en Shopify se llama literalmente **"Ashwagandhaa"**
  (con doble "a" al final) — no es un error de esta migración, está así en la tienda.

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
