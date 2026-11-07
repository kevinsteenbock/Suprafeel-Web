# XanoScript de Suprafeel Soft

Lo que se añadió en Xano el 31 de octubre de 2026 (workspace 6 «Suprafeel», grupo de API 40,
`api:suprafeel-soft`). Aquí solo está el código: ni filas ni contraseñas.

| Archivo | En Xano |
|---|---|
| `table/sf_farmacia.xs` | tabla `sf_farmacia` (id 161), slug único |
| `function/sf_admin_guard.xs` | función `sf_admin_guard` (id 123): corta con 401 sin sesión y 403 si el rol no es admin |
| `api/farmacias_get.xs` | `GET /farmacias` (id 795) |
| `api/admin_usuarios_get.xs` | `GET /admin/usuarios` (id 796) |
| `api/admin_usuarios_post.xs` | `POST /admin/usuarios` (id 797) |
| `api/auth_login_post.xs` | `POST /auth/login` (id 374): token de 7 días con `emitido`, freno de 5 fallos por correo e IP |
| `api/auth_me_get.xs` | `GET /auth/me` (id 375) |
| `function/sf_sesion.xs` | función `sf_sesion` (id 124): 401 si el token no trae `emitido` o es anterior a `sesion_desde` |
| `table/user.xs` | tabla `user` (id 64), con `sesion_desde` |
| `table/sf_login_intento.xs` | tabla `sf_login_intento` (id 162): intentos fallidos (md5 del correo + IP, sin contraseña) |
| `table/sf_consejo_prompt.xs` | tabla `sf_consejo_prompt` (id 163): prompt (system) y esquema JSON del consejo con Claude, por versiones |
| `table/sf_consejo_limites.xs` | tabla `sf_consejo_limites` (id 164): límites del consejo (fila 1) |
| `table/sf_consulta.xs` | tabla `sf_consulta` (id 165): una fila por conversación con Claude |
| `table/sf_consejo_mensaje.xs` | tabla `sf_consejo_mensaje` (id 166): registro de cada pregunta mandada a Claude (límite diario y coste) |
| `function/sf_consejo_coste.xs` | función `sf_consejo_coste` (id 125): tokens y dólares de una respuesta, con o sin fallback |
| `api/consejo_post.xs` | `POST /consejo` (id 799): pregunta a Claude |
| `api/consejo_get.xs` | `GET /consejo` (id 800): mis consultas |
| `api/consejo_id_get.xs` | `GET /consejo/{consulta_id}` (id 801): una consulta, legible |
| `api/consejo_valoracion_patch.xs` | `PATCH /consejo/{consulta_id}/valoracion` (id 802) |
| `api/admin_consultas_get.xs` | `GET /admin/consultas` (id 803): «Registro de consultas», solo admin |
| `table/sf_contenido.xs` | tabla `sf_contenido`: fichas, recomendador, campañas y documentos (nov 2026). Sus datos no viven en el repo |
| `table/sf_solicitud_material.xs` | tabla `sf_solicitud_material`: solicitudes de material publicitario |
| `api/contenido_get.xs` | `GET /contenido`: contenido con sesión, sin rutas de archivo |
| `api/documentos_slug_get.xs` | `GET /documentos/{slug}`: páginas y PDF con enlaces firmados de 1 hora |
| `api/material_solicitudes_post.xs` | `POST /material/solicitudes`: farmacia o comercial pide material; correo solo con `RESEND_API_KEY` en Xano |
| `api/material_solicitudes_get.xs` | `GET /material/solicitudes`: admin, todas; el resto, las suyas |
| `api/material_solicitudes_id_patch.xs` | `PATCH /material/solicitudes/{solicitud_id}`: admin cambia el estado |
| `table/sf_mensaje.xs` | tabla `sf_mensaje`: «Escribir», peticiones de formación y dudas de las farmacias |
| `function/sf_zona_abierta.xs` | función `sf_zona_abierta`: ¿entra esta farmacia en la zona de la semana? |
| `api/contacto_get.xs` | `GET /contacto`: teléfono y si la farmacia puede agendar esta semana |
| `api/mensajes_post.xs` · `mensajes_get.xs` · `mensajes_id_patch.xs` | Mensajes: la farmacia manda y lee los suyos; admin los lee todos y contesta |
| `api/admin_ajustes_get.xs` · `admin_ajustes_patch.xs` | Zona de la semana y contacto, solo admin |
| `api/admin_farmacias_post.xs` · `admin_farmacias_slug_patch.xs` | Alta y edición de farmacias y su formación, solo admin |
| `api/argumentarios_get.xs` | `GET /argumentarios`: solo comercial y admin |

Además, ese día:

- se borró `POST /auth/signup` (id 376);
- los demás endpoints de catálogo del grupo pasaron a pedir token (`auth = "user"`), y los que escriben
  llaman a `sf_admin_guard` al empezar. `POST /auth/login` es el único público;
- `products` recibió EAN, PVPR, PVF y margen de la tarifa 2026. Pendiente: la tarifa repite
  8425402898130 para Ashwagandha y Brain Support, así que esos dos van sin EAN hasta que se aclare.

Para validar antes de subir: herramienta `xano_validate_xanoscript` del MCP de Xano sobre esta carpeta.

Más tarde, el mismo 31 de octubre (las sesiones abiertas con la contraseña antigua seguían valiendo):

- `auth/login` emite el token con `extras = {role, emitido: ahora}` y dura 7 días (antes, 30). Tras 5 fallos
  con el mismo correo desde la misma IP responde 429 durante 15 minutos (tabla `sf_login_intento`; Redis no
  está en este plan de Xano).
- Los 94 endpoints con `auth = "user"` del grupo llaman primero a `sf_sesion` con `{user_id: $auth.id, extras:
  $auth.extras}` (`$auth.extras.emitido` directo da 500 con los tokens viejos, que no lo traen). Rechaza con
  401 los tokens sin `emitido` (todos los emitidos antes del cambio) y los anteriores al `sesion_desde` de la
  cuenta. `POST /admin/usuarios` pone `sesion_desde = ahora` en las cuentas nuevas.
- Swagger del grupo 40 desactivado (`apispec:suprafeel-soft` → 404).
- Copia previa de todo lo tocado: `~/clone-web/suprafeel-xano/backup/2026-10-31-sesiones/`.

## Consejo con Claude (31 oct 2026, noche)

El chat de consejo por síntomas llama a Claude (`claude-opus-5-5`) desde Xano con `api.request` y cobra de la cuenta de
Anthropic cuya clave esté en **Xano › Settings › Environment variables › `ANTHROPIC_API_KEY`**. Sin clave, `POST /consejo`
responde 503 «El consejo con IA aún no está activado: falta la clave de Claude en Xano.» y no llama a nadie.
El detalle (cómo poner la clave, límites, coste, tablas, endpoints, errores) está en `xano/HANDOFF.md`, sección
«Consejo con Claude». Lo esencial para tocar el código:

- La conversación solo se alarga. `sf_consulta.mensajes` es el array `messages` tal cual se manda: cada turno de assistant
  lleva el `content` completo que devolvió la API (thinking con firma, fallback, text). No editar ni recortar turnos viejos:
  la API rechaza (400) un historial editado.
- Cada consulta usa siempre la versión del prompt con la que empezó (`prompt_version`). Un prompt nuevo es una fila nueva
  en `sf_consejo_prompt`, nunca una edición de una versión con consultas. Cargada la versión 1 (`xano/consejo/`).
- Los campos `json` de Xano (jsonb) guardan las claves reordenadas. El esquema se manda desde `esquema_texto` (texto,
  `json_decode` conserva el orden), porque el orden de `properties` es el orden en que Claude escribe la respuesta.
- La primera pregunta de una consulta lleva delante el bloque `[Contexto del sistema] rol: … · fecha: AAAA-MM-DD` que
  espera el prompt. Con `debug: true` (solo admin) `POST /consejo` devuelve el cuerpo exacto sin llamar ni guardar nada.
- Respuestas con código propio: `util.set_header` con `"HTTP/1.1 503 Service Unavailable"` (y 502, 422) cambia el
  estado de la respuesta; el cuerpo va como `{code, message}`, igual que los errores de Xano.
- Trampas de XanoScript que salieron aquí: con `paging`, `output` lleva el prefijo `items.` (si no, la lista sale vacía);
  `0 != null` es falso (comparación floja), así que para nulos se usa `|is_null`; `\d` en un regex entre comillas no
  funciona (usar `[0-9]`); un filtro dentro de un objeto de varias líneas se come las líneas siguientes si no va entre
  paréntesis; `now - $x` da «Not numeric» (usar `"now"|to_ms`).
- Copia previa de lo que había: `~/clone-web/suprafeel-xano/backup/2026-10-31-consejo/` (aquí no se cambió nada existente:
  todo es nuevo). Antes de cargar la versión 1 y tocar `POST /consejo` y `sf_consejo_prompt`, en la misma carpeta:
  `api_799_antes_contexto_y_depuracion.json`, `table_163_antes_esquema_texto.json` y `table_163_content_antes_v1.json`.
