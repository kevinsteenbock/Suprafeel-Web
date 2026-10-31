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
