# Suprafeel Soft — front

Front de la aplicación de escritorio de Suprafeel para **farmacias**, **comerciales** y **superadmin**,
portado desde el archivo Paper «Suprafeel Soft». Solo front: los datos son de ejemplo y viven en `src/data`.

**En línea:** https://kevinsteenbock.github.io/Suprafeel-Web/

## Arrancar

```bash
npm install
npm run dev      # http://localhost:5173/Suprafeel-Web/
npm run build    # genera dist/ (+ 404.html para el enrutado del SPA)
npm run smoke    # renderiza las 52 rutas y avisa si alguna se rompe
npm run deploy   # build + publica dist/ en la rama gh-pages
```

## Cómo entrar

La pantalla de login lleva a un sitio u otro según el correo. Abajo hay tres accesos de demostración:

| Área | Correo | Entra en |
| --- | --- | --- |
| Farmacia | `laura.vidal@farmaciacentral.es` | `/farmacia/catalogo` |
| Comercial | `alvaro.ferrer@suprafeel.com` | `/comercial/hoy` |
| Superadmin | `kevin@suprafeel.com` | `/admin/cuentas` |

Pulsar el nombre de la cuenta (arriba a la izquierda) cierra la sesión y vuelve al login.

## Mapa de pantallas

**Farmacia** (`/farmacia`) — catálogo · ficha de producto · novedades · consejo por síntomas ·
consejo › producto · formación · cursos · curso · clase · materiales PLV · campaña · mi lista ·
mi comercial · ajustes (perfil, farmacia, equipo, notificaciones, privacidad, apariencia).

**Comercial** (`/comercial`) — hoy · mis farmacias (+ panel de alta y alta manual) · ficha de farmacia
(+ registrar visita) · ajustes, y todo lo de farmacia (catálogo, consejo, formación, PLV).

**Superadmin** (`/admin`) — resumen · cuentas y accesos · solicitudes de alta · alta de cuenta ·
ficha de cuenta · comerciales (+ alta de comercial) · catálogo (+ ficha, editar, nuevo) · cursos
(+ crear curso, editar lección, biblioteca de vídeos) · materiales PLV (+ campaña, nueva campaña,
nuevo material) · chat inteligente (síntomas, reglas, fuentes, pruébalo, sin respuesta) ·
registro de consultas.

Al pulsar un producto en cualquier lista (catálogo, consejo por síntomas…) se abre primero un
panel lateral con lo esencial; su botón **Ampliar** lleva a la ficha completa.

## Estructura

```
src/
  app/       Shell (barra lateral + pantalla), rutas de navegación, estado global
  data/      Datos de ejemplo: productos, cursos, PLV, farmacias, cuentas, chat
  screens/   Una pantalla por archivo: shared/ farmacia/ comercial/ admin/
  ui/        Kit: Button, Chip, Badge, Toggle, Card, Field, Table, Drawer, Vista…
  index.css  Tokens del Paper como @theme de Tailwind v4
```

### Reglas de diseño que vienen del Paper

- Los paneles **flotan** sobre la página: no recolocan lo que hay debajo, van a todo el alto pegados
  al borde derecho y llevan velo oscuro.
- Cualquier vista de producto lleva su imagen o su zona de subida.
- Pestañas para organizar la información dentro de las fichas y de los paneles.
- El control **Vista** (lista / tarjetas por fila / qué columnas se ven y en qué orden) va a la
  altura de los chips en todas las listas, con «volver a como venía».

## Lo que aún no hay

Backend. Los formularios y los botones cambian el estado local y avisan con un *toast*. Persisten en
`localStorage` Mi lista y la solicitud de PLV (`src/app/store.tsx`); el resto de altas (cuentas,
comerciales, campañas, categorías del catálogo…) vive en memoria y se pierde al recargar — son
mutaciones directas sobre los arrays de `src/data/*.ts`, pensadas para sustituirse una a una por
llamadas a Xano.
