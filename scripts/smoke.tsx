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
// Contenido INVENTADO: el de verdad no vive en el repositorio (lo sirve GET /contenido con sesión).
const fichaDePrueba = {
  funcion: 'Prueba', subtitulo: 'Subtítulo de prueba', que_es: 'Texto de prueba de para qué sirve', para_quien: ['Público de prueba'], presentacion: '1 cápsula de prueba', duracion: '1 día',
  posologia: 'Pauta de prueba', funciones: ['Función de prueba'], sellos: ['Sello de prueba'], como_actua: [{ t: 'Activo de prueba', d: 'Actúa de prueba' }], tomas: ['1 cápsula'],
  filas: [['Ingrediente de prueba', '1 mg', '—']], perfil: ['Perfil de prueba'], argumentos: ['Argumento de prueba'], advertencias: ['Advertencia de prueba'],
}
const contenidoDePrueba = {
  fichas: { magnesio: fichaDePrueba },
  recomendador: {
    tomas: { magnesio: { toma: 'Toma de prueba' } },
    basicos: [{ id: 'magnesio', nombre: 'Básico de prueba', si: 'Sí de prueba', no: 'No de prueba' }],
    ramas: [{ id: 'prueba', titulo: 'Rama de prueba', gama: 'Básicos', inicio: { tipo: 'pregunta' as const, texto: 'Pregunta de prueba', si: { tipo: 'producto' as const, producto: 'magnesio' }, no: { tipo: 'base' as const, producto: 'magnesio', texto: 'Base de prueba' } } }],
    basicos_con_zinc: [], generales: ['General de prueba'],
  },
  campanas: [{ id: 'c1', titulo: 'Campaña de prueba', imagen: 'campana-prueba', oferta: '1+1', condiciones: ['Condición de prueba'] }],
  documentos: [{ slug: 'campana-prueba', titulo: 'Cartel de prueba', tipo: 'campana', paginas: 1, portada: '' }, { slug: 'catalogo-suprafeel-2026', titulo: 'Catálogo de prueba', tipo: 'catalogo', paginas: 1, portada: '' }, { slug: 'magnesio', titulo: 'Presentación de prueba', tipo: 'presentacion', paginas: 3, portada: '' }],
}
const datosDePrueba: DatosFijos = {
  contenido: contenidoDePrueba,
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
  ['/farmacia/novedades', 'Pronto tendremos novedades'],
  ['/farmacia/recomendador', 'Básico de prueba'],
  ['/comercial/novedades', 'Pronto tendremos novedades'],
  ['/farmacia/formacion/magnesio', 'Texto de prueba de para qué sirve'],
  ['/farmacia/formacion/magnesio', 'Presentación de prueba'],
  ['/farmacia/formacion/magnesio', '227731.1'],
  ['/farmacia/formacion/levadura-de-arroz-rojo', 'No hemos podido cargar esta ficha'],
  ['/farmacia/promociones', 'Margen básico por producto'],
  ['/farmacia/promociones', 'Campaña de prueba'],
  ['/farmacia/material', 'Vinilo a medida'],
  ['/farmacia/material/solicitar/vinilo-medida', 'Ancho (cm)'],
  ['/comercial/material/solicitar/lineal', 'Elige una farmacia'],
  ['/admin/promociones', 'Margen básico por producto'],
  ['/farmacia/formacion', 'Catálogo de prueba'],
  ['/farmacia/formacion', 'Vitamina D3 + K2'],
  ['/farmacia/mi-lista', 'Mi lista'],
  ['/farmacia/mi-comercial', 'Tu comercial de Suprafeel'],
  ['/farmacia/mi-comercial', 'Preguntas y dudas'],
  ['/farmacia/mi-comercial', 'Pedir formación'],
  ['/farmacia/pedir-formacion', 'Pedir formación'],
  ['/comercial/argumentarios', 'Argumentarios de venta'],
  ['/admin/argumentarios', 'Argumentarios de venta'],
  ['/admin/bandeja', 'Bandeja'],
  ['/admin/zona', 'Zona de la semana'],
  ['/admin/cuentas/farmacia/nueva', 'Nueva farmacia'],
  ['/admin/cuentas/prueba-uno/editar', 'Editar farmacia'],
  ['/admin/cuentas/prueba-uno/editar', 'Información relevante'],
  ['/farmacia/ajustes/perfil', 'Datos personales'],
  ['/farmacia/ajustes/farmacia', 'Datos fiscales'],
  ['/farmacia/ajustes/equipo', 'Quién entra en Suprafeel Soft'],
  ['/farmacia/ajustes/privacidad', 'Aquí no hay datos de pacientes'],
  ['/comercial/hoy', 'Formación agendada'],
  ['/comercial/farmacias', 'Mis farmacias'],
  ['/comercial/farmacias/prueba-uno', 'Lo que tiene en el lineal'],
  ['/comercial/catalogo', 'Catálogo Suprafeel'],
  ['/comercial/recomendador', 'Básico de prueba'],
  ['/comercial/formacion', 'Catálogo de prueba'],
  ['/comercial/ajustes', 'Nombre en el reparto'],
  ['/admin/resumen', 'Pendiente de ti'],
  ['/admin/cuentas', 'Cuentas y accesos'],
  ['/admin/cuentas/solicitudes', 'Solicitudes de alta'],
  ['/admin/cuentas/nueva', 'Dar de alta una cuenta'],
  ['/admin/cuentas/prueba-uno', 'Personas con acceso'],
  ['/admin/cuentas/no-existe', 'No encontramos esta farmacia'],
  ['/admin/comerciales', 'Comerciales'],
  ['/admin/catalogo', 'Precios de la tarifa'],
  ['/admin/catalogo/nuevo', 'Nuevo producto'],
  ['/admin/catalogo/magnesio', 'Estado de la ficha'],
  ['/admin/catalogo/magnesio/editar', 'Editar producto'],
  ['/admin/cuentas', 'Sin cerrar'],
  ['/admin/formacion', 'Catálogo de prueba'],
  ['/farmacia/catalogo/magnesio', 'Vídeo explicativo'],
]

// Lo que no puede volver a salir: avisos de «guardado» sin guardar nada y cifras sin origen.
const ausentes: [string, string][] = [
  ['/farmacia/ajustes/farmacia', 'Guardar cambios'],
  ['/farmacia/ajustes/perfil', 'Guardar cambios'],
  ['/comercial/ajustes', 'Guardar cambios'],
  ['/admin/formacion', 'certificados emitidos'],
  ['/farmacia/formacion', '% completado'],
  ['/farmacia/formacion', 'Dra. Elena Sanz'],
  ['/farmacia/novedades', 'Magnesio'],
  // Los datos de ejemplo que se quitaron el 3 nov 2026: no pueden volver.
  ['/farmacia/catalogo/magnesio', 'En almacén central'],
  ['/farmacia/catalogo/magnesio', 'Evidencia'],
  ['/farmacia/catalogo/magnesio', 'DORSAL'],
  ['/farmacia/catalogo/magnesio', '4 semanas y revisar'],
  ['/farmacia/recomendador', 'Caso de ejemplo'],
  ['/farmacia/recomendador', 'levotiroxina'],
  ['/farmacia/catalogo/magnesio', 'Se recomienda cuando'],
  ['/farmacia/catalogo', 'Consejo por síntomas'],
  ['/farmacia/catalogo', 'Materiales PLV'],
  ['/farmacia/mi-comercial', 'Pedir una visita'],
  ['/farmacia/mi-comercial', 'Solicitar cambio de comercial'],
  ['/farmacia/ajustes/farmacia', 'Solicitar cambio de comercial'],
  ['/farmacia/catalogo', 'Argumentarios'],
  ['/farmacia/mi-comercial', 'Formación de prueba ya hecha'],
  ['/comercial/hoy', 'Requieren atención'],
  ['/comercial/hoy', 'Formación sin fecha todavía'],
  ['/comercial/farmacias', 'pendiente de formación'],
  ['/comercial/farmacias', 'Formación pendiente'],
  ['/admin/catalogo/magnesio', 'suprafeel.com/producto'],
  ['/admin/catalogo/magnesio', '94 completados'],
  ['/admin/catalogo/nuevo', 'Cúrcuma Fitosomada'],
  ['/admin/catalogo/magnesio/editar', 'plan Básico'],
  ['/farmacia/ajustes/privacidad', 'se almacena sin identificar'],
  ['/comercial/ajustes', 'Ruta del día'],
]

// Las guardas: sin sesión o con el rol equivocado, la pantalla protegida no llega a pintarse.
// (En renderToString <Navigate> no redirige — actúa en un efecto —, así que se comprueba la ausencia.)
const guards: [string, Role | null, string][] = [
  ['/admin/cuentas', null, 'Cuentas y accesos'],
  ['/farmacia/catalogo', null, 'Catálogo Suprafeel'],
  ['/comercial/hoy', null, 'Formación agendada'],
  ['/admin/cuentas', 'farmacia', 'Cuentas y accesos'],
  ['/admin/catalogo/magnesio/editar', 'comercial', 'Editar producto'],
  ['/comercial/argumentarios', 'farmacia', 'Argumentarios de venta'],
  ['/comercial/argumentarios', null, 'Argumentarios de venta'],
  ['/admin/argumentarios', 'farmacia', 'Argumentarios de venta'],
  ['/admin/bandeja', 'comercial', 'Bandeja'],
  ['/admin/zona', 'farmacia', 'Zona de la semana'],
  ['/admin/cuentas/prueba-uno/editar', 'farmacia', 'Editar farmacia'],
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
