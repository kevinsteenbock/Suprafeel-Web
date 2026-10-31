const img = (n: string) => `${import.meta.env.BASE_URL}img/plv/${n}.jpg`

/* Fechas de los datos de muestra contadas desde hoy: ninguna fecha escrita a mano */
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
/** «3 sep» de dentro de n días (n negativo: hace n días), con el año si no es el de hoy */
const dia = (n: number) => {
  const d = new Date(Date.now() + n * 864e5)
  return `${d.getDate()} ${MESES[d.getMonth()]}${d.getFullYear() !== new Date().getFullYear() ? ` ${d.getFullYear()}` : ''}`
}
const MES_DE: Record<string, number> = Object.fromEntries(MESES.map((m, i) => [m, i + 1]))
/** «1 sep» → 901 (mes × 100 + día), para comparar fechas del año sin el año. */
const md = (t: string) => {
  const m = /^(\d{1,2}) ([a-z]{3})/.exec(t.trim().toLowerCase())
  return m && MES_DE[m[2]!] ? MES_DE[m[2]!]! * 100 + Number(m[1]) : null
}

/**
 * Estado de una campaña según su periodo («1 sep – 30 nov») y la fecha de hoy: en curso dentro del
 * periodo, próxima antes de que empiece y finalizada cuando ha pasado. Un periodo que cruza el año
 * («1 dic – 6 ene») está en curso desde el inicio hasta el fin del año siguiente. Sin fechas: permanente
 * («Siempre disponible») o en curso («Todo el año»).
 */
export function estadoDe(period: string, hoy: Date = new Date()): Campaign['status'] {
  const [a, b] = period.split('–')
  const ini = a ? md(a) : null
  const fin = b ? md(b) : null
  if (ini == null || fin == null) return /siempre/i.test(period) ? 'PERMANENTE' : 'EN CURSO'
  const h = (hoy.getMonth() + 1) * 100 + hoy.getDate()
  if (ini <= fin) return h < ini ? 'PRÓXIMA' : h <= fin ? 'EN CURSO' : 'FINALIZADA'
  return h >= ini || h <= fin ? 'EN CURSO' : 'PRÓXIMA'
}
const ESTADO_ADMIN: Record<Campaign['status'], Campaign['adminState']> = { 'EN CURSO': 'Activa', PERMANENTE: 'Activa', 'PRÓXIMA': 'Programada', FINALIZADA: 'Cerrada' }
/** Lo que se dice debajo de una campaña que no se puede pedir (o nada si se puede). */
const notaDe = (st: Campaign['status']) => (st === 'PRÓXIMA' ? 'aún no disponible' : st === 'FINALIZADA' ? 'ya terminó' : '')

/** Las campañas van a todas las farmacias: la pantalla pone la cifra real (ver `alcance`). */
export const TODAS = 'todas'
/** Cuántas farmacias tiene la campaña: con TODAS, las que hay en Xano (`total`). */
export const alcance = (v: string, total: number) => (v === TODAS ? total.toLocaleString('es-ES') : v)

export interface Campaign {
  id: string
  name: string
  word: string // palabra grande de la portada
  cover?: string
  dark?: 'deep' | 'mid' | 'light'
  status: 'EN CURSO' | 'PERMANENTE' | 'PRÓXIMA' | 'FINALIZADA'
  period: string
  theme: string
  materials: number
  note: string
  description: string
  code: string
  adminState: 'Activa' | 'Programada' | 'Cerrada' | 'Borrador'
  /** TODAS (todas las farmacias de Xano) o '—' si todavía no ha salido */
  pharmacies: string
  /** Solicitudes de material: '—' mientras Xano no las registre */
  requests: string
  updated: string
}

/** Estado, nota y estado de admin se calculan con la fecha de hoy (ver estadoDe); nada escrito a mano. */
type Base = Omit<Campaign, 'status' | 'note' | 'adminState'>
const conEstado = (c: Base): Campaign => {
  const status = estadoDe(c.period)
  return { ...c, status, note: notaDe(status), adminState: ESTADO_ADMIN[status] }
}

export const campaigns: Campaign[] = ([
  { id: 'otono', name: 'Campaña de otoño', word: 'Otoño', cover: img('otono'), period: '1 sep – 30 nov', theme: 'defensas y descanso', materials: 8, description: 'Defensas, descanso y vuelta a la rutina. 8 materiales disponibles para tu farmacia.', code: 'OT', pharmacies: TODAS, requests: '—', updated: 'hace 2 h' },
  { id: 'descanso', name: 'Dormir mejor', word: 'Descanso', dark: 'mid', period: 'Todo el año', theme: 'melatonina y magnesio', materials: 5, description: 'Material permanente de la gama de descanso.', code: 'DM', pharmacies: TODAS, requests: '—', updated: dia(-59) },
  { id: 'marca', name: 'Imagen de marca', word: 'Marca', dark: 'deep', period: 'Siempre disponible', theme: 'bolsas, batas y rótulos', materials: 9, description: 'Identidad de mostrador: bolsas, batas y rótulos.', code: 'MS', pharmacies: TODAS, requests: '—', updated: dia(-170) },
  { id: 'navidad', name: 'Campaña de Navidad', word: 'Navidad', cover: img('navidad'), period: '1 dic – 6 ene', theme: 'packs regalo y escaparate', materials: 6, description: 'Packs regalo y escaparate de invierno.', code: 'NV', pharmacies: TODAS, requests: '—', updated: 'hace 1 d' },
  { id: 'cole', name: 'Vuelta al cole', word: 'Cole', dark: 'light', period: '15 ago – 15 sep', theme: 'defensas infantiles', materials: 4, description: 'Defensas infantiles para la vuelta al colegio.', code: 'VC', pharmacies: TODAS, requests: '—', updated: dia(-45) },
  { id: 'piel', name: 'Colágeno y piel', word: 'Piel', cover: img('piel'), period: '1 sep – 31 dic', theme: 'con muestras para probar', materials: 7, description: 'Colágeno y cuidado de la piel, con muestras.', code: 'CL', pharmacies: TODAS, requests: '—', updated: dia(-212) },
] as Base[]).map(conEstado)

export const campaignById = (id?: string) => campaigns.find((c) => c.id === id)

export type MaterialKind = 'expositor' | 'cartel' | 'folleto' | 'digital' | 'merch'

export interface Material {
  id: string
  campaignId: string
  name: string
  meta: string
  kind: MaterialKind
  limit: string
  action: 'Añadir' | 'Añadido' | 'Descargar' | 'En camino'
  art: 'shelf' | 'poster' | 'leaflet' | 'stopper' | 'bag' | 'phone' | 'shirt'
  description: string
  specs: { k: string; v: string }[]
  tip: string
  // admin
  supply: string
  supplyMeta: string
  supplyLow?: boolean
  delivery: string
  state: 'Publicado' | 'Borrador'
  requests: string
}

export const materials: Material[] = [
  { id: 'expositor', campaignId: 'otono', name: 'Expositor de mostrador', meta: 'Cartón · 3 baldas · 28 × 40 cm', kind: 'expositor', limit: 'Máx. 1 por farmacia', action: 'Añadir', art: 'shelf',
    description: 'Tres baldas para colocar junto a la caja. Cabe la gama de descanso completa y deja hueco para los folletos en la balda inferior.',
    specs: [{ k: 'Material', v: 'Cartón microcanal reciclado' }, { k: 'Medidas', v: '28 × 40 × 22 cm · 3 baldas' }, { k: 'Capacidad', v: 'Hasta 18 unidades y 50 folletos' }, { k: 'Límite', v: '1 por farmacia y campaña' }],
    tip: 'Junto a la caja, a la derecha del cliente. Las farmacias que lo colocan ahí venden un 30 % más de la gama de descanso.',
    supply: '1.200 uds', supplyMeta: `repone el ${dia(12)}`, delivery: 'Máx. 1 por farmacia', state: 'Publicado', requests: '—' },
  { id: 'cartel', campaignId: 'otono', name: 'Cartel de escaparate', meta: 'Vinilo estático · A2 · campaña de otoño', kind: 'cartel', limit: 'Hasta 2 unidades', action: 'Añadir', art: 'poster',
    description: 'Vinilo electrostático para cristal, se quita sin dejar marca.', specs: [{ k: 'Material', v: 'Vinilo estático' }, { k: 'Medidas', v: 'A2 · 42 × 59 cm' }, { k: 'Límite', v: '2 por farmacia' }],
    tip: 'A la altura de los ojos, en el cristal más cercano a la puerta.', supply: '80 uds', supplyMeta: `repone el ${dia(20)}`, supplyLow: true, delivery: 'Hasta 2 unidades', state: 'Publicado', requests: '—' },
  { id: 'folleto-magnesio', campaignId: 'otono', name: 'Folleto Magnesio', meta: 'Díptico A5 · paquete de 50', kind: 'folleto', limit: 'Paquetes de 50', action: 'Añadir', art: 'leaflet',
    description: 'Díptico con las tres formas de magnesio explicadas para el cliente.', specs: [{ k: 'Formato', v: 'Díptico A5' }, { k: 'Unidad', v: 'Paquete de 50' }],
    tip: 'En la balda inferior del expositor o junto a la caja.', supply: '12.500 uds', supplyMeta: `repone el ${dia(33)}`, delivery: 'Paquetes de 50', state: 'Publicado', requests: '—' },
  { id: 'guia', campaignId: 'otono', name: 'Guía rápida de mostrador', meta: 'Plastificada A5 · para el equipo', kind: 'folleto', limit: 'Hasta 5 unidades', action: 'Añadir', art: 'shelf',
    description: 'Chuleta plastificada para el equipo: qué recomendar según lo que cuenta el cliente.', specs: [{ k: 'Formato', v: 'A5 plastificada' }, { k: 'Límite', v: '5 por farmacia' }],
    tip: 'Detrás del mostrador, no a la vista del cliente.', supply: '2.400 uds', supplyMeta: `repone el ${dia(18)}`, delivery: 'Hasta 5 unidades', state: 'Publicado', requests: '—' },
  { id: 'stopper', campaignId: 'otono', name: 'Stopper de lineal', meta: 'PVC · 10 × 7 cm · juego de 4', kind: 'expositor', limit: 'Hasta 2 juegos', action: 'Añadir', art: 'stopper',
    description: 'Señalizador perpendicular al lineal para destacar la gama.', specs: [{ k: 'Material', v: 'PVC' }, { k: 'Medidas', v: '10 × 7 cm' }, { k: 'Unidad', v: 'Juego de 4' }],
    tip: 'A la altura de la referencia que más rota.', supply: '640 juegos', supplyMeta: `repone el ${dia(25)}`, delivery: 'Hasta 2 juegos', state: 'Publicado', requests: '—' },
  { id: 'bolsas', campaignId: 'otono', name: 'Bolsas de farmacia', meta: 'Papel kraft · caja de 250', kind: 'merch', limit: '1 caja por trimestre', action: 'Añadir', art: 'bag',
    description: 'Bolsa kraft con el mensaje de campaña.', specs: [{ k: 'Material', v: 'Papel kraft' }, { k: 'Unidad', v: 'Caja de 250' }],
    tip: 'Sustituye a la bolsa neutra durante la campaña.', supply: '310 cajas', supplyMeta: `repone el ${dia(31)}`, delivery: '1 caja por trimestre', state: 'Publicado', requests: '—' },
  { id: 'redes', campaignId: 'otono', name: 'Pack para redes sociales', meta: '12 imágenes + textos · descarga', kind: 'digital', limit: 'Descarga inmediata', action: 'Descargar', art: 'phone',
    description: '12 imágenes cuadradas y verticales con sus textos listos para publicar.', specs: [{ k: 'Formato', v: 'ZIP · 86 MB' }, { k: 'Contenido', v: '12 imágenes + textos' }],
    tip: 'Dos publicaciones por semana durante la campaña.', supply: 'ZIP · 86 MB', supplyMeta: `v1 · ${dia(-60)}`, delivery: 'Descarga inmediata', state: 'Publicado', requests: '—' },
  { id: 'bata', campaignId: 'otono', name: 'Bata bordada Suprafeel', meta: 'Tallas S a XL · 1 por persona', kind: 'merch', limit: '1 por persona', action: 'Añadir', art: 'shirt',
    description: 'Bata blanca con el bordado Suprafeel en el pecho.', specs: [{ k: 'Tallas', v: 'S, M, L, XL' }, { k: 'Límite', v: '1 por persona' }],
    tip: 'Para el equipo que ha hecho la formación.', supply: 'MP4 · 142 MB', supplyMeta: 'v1 · hace 2 h', delivery: 'Descarga inmediata', state: 'Borrador', requests: '—' },
]

export const materialsOf = (campaignId: string) => materials.filter((m) => m.campaignId === campaignId)

export const materialFilters = [
  { key: 'all', label: 'Todo' },
  { key: 'expositor', label: 'Expositores' },
  { key: 'folleto', label: 'Folletos y cartelería' },
  { key: 'digital', label: 'Digital' },
]
export function filterMaterials(list: Material[], key: string) {
  if (key === 'all') return list
  if (key === 'folleto') return list.filter((m) => m.kind === 'folleto' || m.kind === 'cartel')
  return list.filter((m) => m.kind === key)
}

/** Campañas creadas durante la sesión (sin backend todavía) */
export function addCampaign(c: Omit<Campaign, 'word'> & { word?: string }) {
  const full: Campaign = { word: c.name.split(' ')[0], ...c } as Campaign
  campaigns.unshift(full)
  return full
}
export const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'campana'
