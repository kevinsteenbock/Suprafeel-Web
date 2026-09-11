import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import App from '../src/App'
import { StoreProvider } from '../src/app/store'

const routes: [string, string][] = [
  ['/', 'Inicia sesión'],
  ['/farmacia/catalogo', 'Catálogo Suprafeel'],
  ['/farmacia/catalogo/magnesio-complex', 'Magnesio Complex'],
  ['/farmacia/novedades', 'Novedades del catálogo'],
  ['/farmacia/consejo', '¿Qué le pasa a tu cliente?'],
  ['/farmacia/consejo/melatonina-noche', 'Qué decirle en el mostrador'],
  ['/farmacia/formacion', 'Continúa donde lo dejaste'],
  ['/farmacia/formacion/cursos', 'Formación breve para el mostrador'],
  ['/farmacia/formacion/cursos/magnesio', 'Temario'],
  ['/farmacia/formacion/cursos/magnesio/leccion/3', 'Archivos de esta clase'],
  ['/farmacia/plv', 'Materiales PLV'],
  ['/farmacia/plv/otono', 'Campaña de otoño'],
  ['/farmacia/mi-lista', 'Mi lista'],
  ['/farmacia/mi-comercial', 'Álvaro Ferrer'],
  ['/farmacia/ajustes/perfil', 'Datos personales'],
  ['/farmacia/ajustes/farmacia', 'Datos fiscales'],
  ['/farmacia/ajustes/equipo', 'Quién entra en Suprafeel Soft'],
  ['/farmacia/ajustes/notificaciones', 'Qué te avisamos'],
  ['/farmacia/ajustes/privacidad', 'Aquí no hay datos de pacientes'],
  ['/farmacia/ajustes/apariencia', 'Cómo se ve en tu Mac'],
  ['/comercial/hoy', 'Ruta de hoy'],
  ['/comercial/farmacias', 'Mis farmacias'],
  ['/comercial/farmacias/central', 'Actividad de la cuenta'],
  ['/comercial/catalogo', 'Catálogo Suprafeel'],
  ['/comercial/consejo', '¿Qué le pasa a tu cliente?'],
  ['/comercial/formacion', 'Itinerarios'],
  ['/comercial/plv', 'Materiales PLV'],
  ['/comercial/mensajes', 'Mensajes'],
  ['/comercial/ajustes', 'Zona Levante'],
  ['/admin/resumen', 'Pendiente de ti'],
  ['/admin/cuentas', 'Cuentas y accesos'],
  ['/admin/cuentas/solicitudes', 'Solicitudes de alta'],
  ['/admin/cuentas/nueva', 'Dar de alta una cuenta'],
  ['/admin/cuentas/central', 'Uso de la cuenta'],
  ['/admin/comerciales', 'Comerciales'],
  ['/admin/registro', 'Registro de consultas'],
  ['/admin/catalogo', 'Tarifa vigente'],
  ['/admin/catalogo/nuevo', 'Nuevo producto'],
  ['/admin/catalogo/magnesio-complex', 'Estado de la ficha'],
  ['/admin/catalogo/magnesio-complex/editar', 'Editar producto'],
  ['/admin/cursos', 'certificados emitidos'],
  ['/admin/cursos/nuevo', 'Antes de publicar'],
  ['/admin/cursos/magnesio', 'Lecciones'],
  ['/admin/cursos/magnesio/leccion/1', 'Archivos de la lección'],
  ['/admin/plv', 'campañas'],
  ['/admin/plv/nueva', 'Nueva campaña'],
  ['/admin/plv/otono', 'Añadir material'],
  ['/admin/plv/otono/nuevo-material', 'Foto del material'],
  ['/admin/chat/sintomas', 'Cómo lo dicen'],
  ['/admin/chat/reglas', 'Cuándo se activa'],
  ['/admin/chat/fuentes', 'Usada en reglas'],
  ['/admin/chat/pruebalo', 'Por qué ha salido esto'],
  ['/admin/chat/sin-respuesta', 'Lo que escribieron'],
]

let fail = 0
for (const [path, expect] of routes) {
  try {
    const html = renderToString(
      <MemoryRouter initialEntries={[path]}>
        <StoreProvider>
          <App />
        </StoreProvider>
      </MemoryRouter>,
    )
    if (!html.includes(expect)) {
      console.log(`✗ ${path} — no encuentra «${expect}»`)
      fail++
    } else {
      console.log(`✓ ${path}`)
    }
  } catch (e) {
    console.log(`✗ ${path} — ${(e as Error).message}`)
    fail++
  }
}
console.log(fail ? `\n${fail} de ${routes.length} rutas con problemas` : `\nLas ${routes.length} rutas renderizan`)
process.exit(fail ? 1 : 0)
