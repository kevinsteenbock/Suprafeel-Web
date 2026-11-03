# Suprafeel Soft — front

Front de la aplicación de escritorio de Suprafeel para **farmacias**, **comerciales** y **superadmin**,
portado desde el archivo Paper «Suprafeel Soft». El login, las farmacias y las cuentas vienen de
**Xano** (ver `xano/HANDOFF.md`); el catálogo, los cursos, el PLV y el chat todavía viven en `src/data`.

**En línea:** https://suprafeel-profesional.com/

## Arrancar

```bash
npm install
npm run dev      # http://localhost:5173/
npm run build    # genera dist/ (+ 404.html para el enrutado del SPA)
npm run smoke    # renderiza las 54 rutas, comprueba las 8 guardas y que no vuelvan textos sin origen, sin red y con datos inventados
npm run deploy   # build + publica dist/ en la rama gh-pages
```

## Cómo entrar

El login va contra Xano (`POST /auth/login`). **El área la decide el `role` del usuario en Xano**,
no el correo: `farmacia` → `/farmacia/catalogo`, `comercial` → `/comercial/hoy`, `admin` → `/admin/cuentas`.

- No hay registro público: las cuentas las crea un admin en **Cuentas y accesos › Dar acceso**
  (`/admin/cuentas/nueva`, que llama a `POST /admin/usuarios`).
- Sin sesión, cualquier ruta de área manda al login; con sesión de otro rol, a su propia área.
- Al arrancar, el token guardado se valida con `GET /auth/me`; si Xano lo rechaza, se cierra la sesión.
- El token dura **7 días**. Xano rechaza (401) los tokens emitidos antes del 31 oct 2026 y los anteriores al
  `sesion_desde` de la cuenta: poner ese campo a ahora cierra todas las sesiones abiertas de esa cuenta.
- Tras 5 intentos fallidos con el mismo correo desde la misma IP, el login responde 429 durante 15 minutos.
- «Mantener la sesión iniciada» guarda el token en `localStorage`; si no, en `sessionStorage`
  (muere al cerrar el navegador).
- Pulsar el nombre de la cuenta (arriba a la izquierda) o «Cerrar sesión» en Ajustes cierra la sesión.
- `VITE_XANO_API` cambia la base de la API (por defecto, el grupo `api:suprafeel-soft` del workspace Suprafeel).
- **Cuentas de prueba**: los correos están en `xano/HANDOFF.md`. Las contraseñas están en
  `xano/.accesos.txt`, que git ignora: no las copies a ningún archivo del repositorio.

## De dónde salen los datos

El repositorio es **público**: ninguna farmacia real, titular, dirección, teléfono ni contraseña
puede estar en el código ni en el bundle. Por eso las farmacias solo llegan después del login:

1. `src/app/datos.tsx` (`DatosProvider`, dentro de `AuthProvider`) pide `GET /farmacias` con el token
   y, si la cuenta es admin, después `GET /admin/usuarios`. Van en serie: Xano lleva mal las ráfagas.
2. **Xano filtra por rol**: el admin recibe todas; el comercial, las de su `rep_name`; la farmacia,
   la de su `pharmacy_slug`. El front no enseña nada que Xano no haya dejado pasar.
3. Mientras cargan, el área no se pinta (`DatosListos`). Si fallan, sale una pantalla con
   «Reintentar»; si Xano dice 401, se cierra la sesión. Al cerrar sesión se borra todo.
4. Las pantallas leen `useDatos()` → `{ estado, farmacias, usuarios, recargar, crearUsuario }`.
   `src/data/pharmacies.ts` ya no trae filas: solo el tipo `Pharmacy` y helpers puros
   (`comercialesDe`, `proximasFormaciones`, `formacionLabel`…). Cifras como «lo verán N farmacias»
   salen de `useCifras()`, nunca de un número escrito a mano.
5. Las fechas «de hoy» se calculan siempre (saludo, fecha de Hoy, formaciones de hoy en adelante).

El catálogo (`src/data/products.ts`) son los 20 productos reales de Shopify con PVPR, PVF y EAN de la
tarifa 2026; el margen se calcula. Ashwagandha y Brain Support van sin EAN hasta confirmar cuál es
el bueno (la tarifa les da el mismo).

## Backend (Xano)

Instancia `xsq7-h9en-9cxm`, workspace **Suprafeel** (id 6), grupo `api:suprafeel-soft`. Todo el grupo
pide sesión: el único endpoint público es `POST /auth/login`.

| Endpoint | Quién | Qué hace |
| --- | --- | --- |
| `POST /auth/login` | público | `{ email, password }` → `{ authToken, user }` (token de 7 días; 5 fallos por correo e IP → 429 durante 15 min) |
| `GET /auth/me` | con sesión | la cuenta de la sesión, con su `role` |
| `GET /farmacias` | con sesión | las farmacias que le tocan a ese rol (tabla `sf_farmacia`) |
| `GET /admin/usuarios` | admin | las cuentas, sin contraseña |
| `POST /admin/usuarios` | admin | crea una cuenta (contraseña de 10 o más; errores 400 en español) |

- `POST /auth/signup` **ya no existe** (era público y dejaba crear admins).
- Los `GET` de catálogo piden sesión y los `POST`/`PATCH`/`DELETE` de catálogo piden rol admin.
- Todos los endpoints con sesión empiezan por la función `sf_sesion`, que rechaza los tokens viejos (ver arriba).
- La documentación Swagger del grupo está desactivada (no se publica el mapa de la API).
- El XanoScript de lo nuevo está en `xano/xs/`; el detalle, en `xano/HANDOFF.md`.

## Mapa de pantallas

**Farmacia** (`/farmacia`) — catálogo · ficha de producto · novedades · consejo por síntomas ·
consejo › producto · formación · cursos · curso · clase · materiales PLV · campaña · mi lista ·
mi comercial · ajustes (perfil, farmacia, equipo, notificaciones, privacidad, apariencia).

**Comercial** (`/comercial`) — hoy (formación agendada, farmacias que requieren atención) ·
mis farmacias (+ panel de alta y alta manual, exportar a CSV) · ficha de farmacia (+ registrar
visita) · ajustes, y todo lo de farmacia (catálogo, consejo, formación, PLV).

**Superadmin** (`/admin`) — resumen · cuentas y accesos · solicitudes de alta · alta de cuenta ·
ficha de farmacia · comerciales · catálogo (+ ficha, editar, nuevo) · cursos (+ crear curso,
editar lección, biblioteca de vídeos) · materiales PLV (+ campaña, nueva campaña, nuevo material) ·
chat inteligente (síntomas, reglas, fuentes, pruébalo, sin respuesta) · registro de consultas.

Al pulsar un producto en cualquier lista (catálogo, consejo por síntomas…) se abre primero una
ventana con lo esencial; su botón **Ampliar** lleva a la ficha completa.

## Estructura

```
src/
  app/       Shell (barra lateral + pantalla), nav, auth (login con Xano), datos (farmacias y cuentas
             de Xano), store (Mi lista, solicitud de PLV y avisos)
  data/      Catálogo real (productos + tarifa 2026); cursos, PLV y chat de muestra; tipos y helpers
             de farmacias (sin filas)
  screens/   Una pantalla por archivo: shared/ farmacia/ comercial/ admin/
  ui/        Kit: Button, Badge, Toggle, Card, Field, Table, Drawer, Vista, FilterMenu…
  index.css  Tokens del Paper como @theme de Tailwind v4
xano/        HANDOFF.md (lo vigente de Xano), PROMPT.md (encargo original, histórico), xs/, seed/
```

### Reglas de diseño que vienen del Paper

- Los paneles (`src/ui/Drawer.tsx`) se abren como **ventana centrada** sobre la página, con velo oscuro.
  Nada se abre como cajón lateral: solo el menú de navegación del móvil sale de lado.
- Cualquier vista de producto lleva su imagen o su zona de subida.
- Pestañas para organizar la información dentro de las fichas y de los paneles.
- El control **Vista** (lista / tarjetas por fila / qué columnas se ven y en qué orden) va a la
  altura de los chips en todas las listas, con «volver a como venía».

## Lo que aún no hay

- **Catálogo, cursos, PLV y chat** se leen de `src/data`, no de Xano. Cursos, PLV y chat son contenido de
  muestra del Paper. Lo que no tiene origen no se enseña: ni certificados, ni solicitudes, ni consultas,
  ni porcentajes de acierto o de finalización (las columnas salen con «—»). El progreso de los cursos sale
  a cero para todos, y el estado de cada campaña de PLV se calcula con su periodo y la fecha de hoy.
- **Consejo por síntomas** no tiene motor: solo enseña el caso de ejemplo del Paper (marcado como tal). Con
  cualquier otro texto, dice que todavía no está disponible.
- **No se guarda nada que no tenga dónde guardarse.** Ajustes de la farmacia y del comercial son de solo
  lectura (los cambios se piden por correo a info@suprafeel.es); «Registrar visita» avisa de que aún no se
  guarda; el alta de farmacias, la solicitud de PLV y «Enviar Mi lista» abren el correo con los datos. En la
  consola de admin, lo que todavía no está conectado responde con un aviso (`PENDIENTE_ADMIN`), nunca con
  un «guardado».
- Mi lista, la solicitud de PLV y los casos guardados viven en `localStorage` **por cuenta**
  (`sf.lista.<id>`…) y se borran al cerrar sesión (`src/app/store.tsx`).
- La portada del curso de hierro reutiliza la de magnesio hasta exportar la suya del Paper.
- Los buscadores de la barra superior de algunas pantallas todavía no filtran.
