import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import App from '../src/App'
import { StoreProvider } from '../src/app/store'
import { AuthProvider, type Role, type User } from '../src/app/auth'
import { DatosProvider, type DatosFijos } from '../src/app/datos'
import { farmaciaDeFila, hoyISO, type FilaFarmacia } from '../src/data/pharmacies'

// Datos de prueba INVENTADOS: ninguna farmacia, persona ni dirección real. Las fechas se calculan
// desde hoy para que siempre haya una formación por delante y otra ya pasada.
const enDias = (n: number) => hoyISO(new Date(Date.now() + n * 86_400_000))
const fila = (id: number, slug: string, name: string, rep: string, extra: Partial<FilaFarmacia> = {}): FilaFarmacia => ({
  id, slug, code: '', name, nombre_comercial: '', city: 'Villaprueba', owner: `Titular de ${name}`, address: `Calle Inventada, ${id}`,
  postal: `0000${id}`, rep, zona: 'Zona de Prueba', refs: 0, lineal: [], formacion: '', formacion_fecha: '', formacion_hora: '',
  formacion_nota: '', telefono: '', codigo_cliente: '', ...extra,
})
const datosDePrueba: DatosFijos = {
  farmacias: [
    fila(1, 'prueba-uno', 'Farmacia de Prueba Uno', 'Comercial Prueba', { refs: 12, lineal: ['magnesio', 'omega', 'vitamin-c'], formacion: 'hecha', formacion_fecha: enDias(-12), formacion_nota: 'Formación de prueba ya hecha' }),
    fila(2, 'prueba-dos', 'Farmacia de Prueba Dos', 'Comercial Prueba', { refs: 4, lineal: ['magnesio', 'zinc'], formacion: 'prevista', formacion_fecha: enDias(7), formacion_hora: '10:30', formacion_nota: 'Formación de prueba agendada' }),
    fila(3, 'prueba-tres', 'Farmacia de Prueba Tres', 'Comercial Prueba', { refs: 2, lineal: ['omega'], formacion: 'pendiente' }),
    fila(4, 'prueba-cuatro', 'Farmacia de Prueba Cuatro', 'Otro Comercial', { refs: 1, lineal: ['biotina'], formacion: 'rechazada', zona: 'Otra Zona de Prueba' }),
    fila(5, 'prueba-cinco', 'Farmacia de Prueba Cinco', 'Otro Comercial', { refs: 6, formacion: 'prevista', formacion_fecha: enDias(-3), formacion_hora: '17:00', zona: 'Otra Zona de Prueba' }),
    fila(6, 'prueba-seis', 'Farmacia de Prueba Seis', 'Tercer Comercial', { refs: 0 }),
  ].map(farmaciaDeFila),
  usuarios: [
    { id: 1, name: 'Admin de Prueba', email: 'admin@prueba.test', role: 'admin', pharmacy_slug: '', rep_name: '', created_at: Date.now() - 30 * 86_400_000 },
    { id: 2, name: 'Comercial de Prueba', email: 'comercial@prueba.test', role: 'comercial', pharmacy_slug: '', rep_name: 'Comercial Prueba', created_at: Date.now() - 20 * 86_400_000 },
    { id: 3, name: 'Farmacia de Prueba', email: 'farmacia@prueba.test', role: 'farmacia', pharmacy_slug: 'prueba-uno', rep_name: '', created_at: Date.now() - 10 * 86_400_000 },
  ],
}

const as = (role: Role): User => ({
  id: 1,
  name: 'Prueba Humo',
  email: `${role}@prueba.test`,
  role,
  pharmacy_slug: role === 'farmacia' ? 'prueba-uno' : null,
  rep_name: role === 'comercial' ? 'Comercial Prueba' : null,
})
const roleOf = (path: string): Role | null => {
  const seg = path.split('/')[1]
  return seg === 'farmacia' || seg === 'comercial' || seg === 'admin' ? seg : null
}

const routes: [string, string][] = [
  ['/', 'Inicia sesión'],
  ['/farmacia/catalogo', 'Catálogo Suprafeel'],
  ['/farmacia/catalogo/magnesio', 'Magnesio'],
  ['/farmacia/novedades', 'Novedades del catálogo'],
  ['/farmacia/consejo', '¿Qué le pasa a tu cliente?'],
  ['/farmacia/consejo/magnesio', 'Qué decirle en el mostrador'],
  ['/farmacia/formacion', 'Formación breve para el mostrador'],
  ['/farmacia/formacion/cursos', 'Formación breve para el mostrador'],
  ['/farmacia/formacion/cursos/magnesio', 'Temario'],
  ['/farmacia/formacion/cursos/magnesio/leccion/3', 'Archivos de esta clase'],
  ['/farmacia/plv', 'Materiales PLV'],
  ['/farmacia/plv/otono', 'Campaña de otoño'],
  ['/farmacia/mi-lista', 'Mi lista'],
  ['/farmacia/mi-comercial', 'Tu comercial de Suprafeel'],
  ['/farmacia/ajustes/perfil', 'Datos personales'],
  ['/farmacia/ajustes/farmacia', 'Datos fiscales'],
  ['/farmacia/ajustes/equipo', 'Quién entra en Suprafeel Soft'],
  ['/farmacia/ajustes/notificaciones', 'Qué te avisamos'],
  ['/farmacia/ajustes/privacidad', 'Aquí no hay datos de pacientes'],
  ['/farmacia/ajustes/apariencia', 'Cómo se ve en tu Mac'],
  ['/comercial/hoy', 'Formación agendada'],
  ['/comercial/farmacias', 'Mis farmacias'],
  ['/comercial/farmacias/prueba-uno', 'Lo que tiene en el lineal'],
  ['/comercial/catalogo', 'Catálogo Suprafeel'],
  ['/comercial/consejo', '¿Qué le pasa a tu cliente?'],
  ['/comercial/formacion', 'Formación breve para el mostrador'],
  ['/comercial/plv', 'Materiales PLV'],
  ['/comercial/ajustes', 'Nombre en el reparto'],
  ['/admin/resumen', 'Pendiente de ti'],
  ['/admin/cuentas', 'Cuentas y accesos'],
  ['/admin/cuentas/solicitudes', 'Solicitudes de alta'],
  ['/admin/cuentas/nueva', 'Dar de alta una cuenta'],
  ['/admin/cuentas/prueba-uno', 'Personas con acceso'],
  ['/admin/cuentas/no-existe', 'No encontramos esta farmacia'],
  ['/admin/comerciales', 'Comerciales'],
  ['/admin/registro', 'Registro de consultas'],
  ['/admin/catalogo', 'Precios de la tarifa'],
  ['/admin/catalogo/nuevo', 'Nuevo producto'],
  ['/admin/catalogo/magnesio', 'Estado de la ficha'],
  ['/admin/catalogo/magnesio/editar', 'Editar producto'],
  ['/admin/cursos', 'Completados'],
  ['/admin/cuentas', 'Sin cerrar'],
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

// Lo que no puede volver a salir: avisos de «guardado» sin guardar nada y cifras sin origen.
const ausentes: [string, string][] = [
  ['/farmacia/ajustes/farmacia', 'Guardar cambios'],
  ['/farmacia/ajustes/perfil', 'Guardar cambios'],
  ['/comercial/ajustes', 'Guardar cambios'],
  ['/admin/cursos', 'certificados emitidos'],
  ['/admin/cursos', 'finalización media'],
  ['/admin/plv', 'solicitudes abiertas'],
  ['/admin/chat/sintomas', 'consultas este mes'],
  ['/admin/chat/sintomas', 'consultas resueltas'],
  ['/farmacia/formacion', '% completado'],
  ['/farmacia/plv', 'en tu solicitud'],
]

// Las guardas: sin sesión o con el rol equivocado, la pantalla protegida no llega a pintarse.
// (En renderToString <Navigate> no redirige — actúa en un efecto —, así que se comprueba la ausencia.)
const guards: [string, Role | null, string][] = [
  ['/admin/cuentas', null, 'Cuentas y accesos'],
  ['/farmacia/catalogo', null, 'Catálogo Suprafeel'],
  ['/comercial/hoy', null, 'Formación agendada'],
  ['/admin/cuentas', 'farmacia', 'Cuentas y accesos'],
  ['/admin/catalogo/magnesio/editar', 'comercial', 'Editar producto'],
  ['/farmacia/ajustes/perfil', 'comercial', 'Datos personales'],
  ['/comercial/farmacias', 'farmacia', 'Mis farmacias'],
  ['/', 'admin', 'Inicia sesión'],
]

const render = (path: string, role: Role | null) =>
  renderToString(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider session={{ user: role ? as(role) : null }}>
        <DatosProvider datos={datosDePrueba}>
          <StoreProvider>
            <App />
          </StoreProvider>
        </DatosProvider>
      </AuthProvider>
    </MemoryRouter>,
  )

let fail = 0
for (const [path, role, forbidden] of guards) {
  const label = `${path} como ${role ?? 'anónimo'}`
  // Control: con el rol bueno el texto tiene que salir; si no sale nunca, la guarda no estaría comprobando nada.
  const propio = render(path, roleOf(path))
  if (!propio.includes(forbidden)) { console.log(`✗ ${label} — «${forbidden}» no sale ni con el rol bueno: la guarda no comprueba nada`); fail++; continue }
  const html = render(path, role)
  if (html.includes(forbidden)) { console.log(`✗ ${label} — deja ver «${forbidden}»`); fail++ }
  else console.log(`✓ ${label} — bloqueada`)
}

for (const [path, expect] of routes) {
  try {
    const html = render(path, roleOf(path))
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
for (const [path, texto] of ausentes) {
  const html = render(path, roleOf(path))
  if (html.includes(texto)) { console.log(`✗ ${path} — vuelve a salir «${texto}»`); fail++ }
  else console.log(`✓ ${path} — sin «${texto}»`)
}
const total = routes.length + guards.length + ausentes.length
console.log(fail ? `\n${fail} de ${total} comprobaciones con problemas` : `\nLas ${routes.length} rutas renderizan, las ${guards.length} guardas aguantan y no vuelve ninguno de los ${ausentes.length} textos sin origen`)
process.exit(fail ? 1 : 0)
