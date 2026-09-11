const img = (n: string) => `${import.meta.env.BASE_URL}img/plv/${n}.jpg`

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
  pharmacies: string
  requests: string
  updated: string
}

export const campaigns: Campaign[] = [
  { id: 'otono', name: 'Campaña de otoño', word: 'Otoño', cover: img('otono'), status: 'EN CURSO', period: '1 sep – 30 nov', theme: 'defensas y descanso', materials: 8, note: '3 en tu solicitud', description: 'Defensas, descanso y vuelta a la rutina. 8 materiales disponibles para tu farmacia.', code: 'OT', adminState: 'Activa', pharmacies: '412', requests: '644', updated: 'hace 2 h' },
  { id: 'descanso', name: 'Dormir mejor', word: 'Descanso', dark: 'mid', status: 'EN CURSO', period: 'Todo el año', theme: 'melatonina y magnesio', materials: 5, note: '', description: 'Material permanente de la gama de descanso.', code: 'DM', adminState: 'Activa', pharmacies: '412', requests: '318', updated: '2 sep' },
  { id: 'marca', name: 'Imagen de marca', word: 'Marca', dark: 'deep', status: 'PERMANENTE', period: 'Siempre disponible', theme: 'bolsas, batas y rótulos', materials: 9, note: '1 en camino', description: 'Identidad de mostrador: bolsas, batas y rótulos.', code: 'MS', adminState: 'Activa', pharmacies: '412', requests: '1.204', updated: '14 may' },
  { id: 'navidad', name: 'Campaña de Navidad', word: 'Navidad', cover: img('navidad'), status: 'PRÓXIMA', period: '1 dic – 6 ene', theme: 'packs regalo y escaparate', materials: 6, note: 'aún no disponible', description: 'Packs regalo y escaparate de invierno.', code: 'NV', adminState: 'Programada', pharmacies: '—', requests: '—', updated: 'hace 1 d' },
  { id: 'cole', name: 'Vuelta al cole', word: 'Cole', dark: 'light', status: 'FINALIZADA', period: '15 ago – 15 sep', theme: 'defensas infantiles', materials: 4, note: 'recogidos', description: 'Defensas infantiles para la vuelta al colegio.', code: 'VC', adminState: 'Cerrada', pharmacies: '412', requests: '208', updated: '16 sep' },
  { id: 'piel', name: 'Colágeno y piel', word: 'Piel', cover: img('piel'), status: 'EN CURSO', period: '1 sep – 31 dic', theme: 'con muestras para probar', materials: 7, note: '', description: 'Colágeno y cuidado de la piel, con muestras.', code: 'CL', adminState: 'Activa', pharmacies: '412', requests: '512', updated: '2 abr' },
]

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
  { id: 'expositor', campaignId: 'otono', name: 'Expositor de mostrador', meta: 'Cartón · 3 baldas · 28 × 40 cm', kind: 'expositor', limit: 'Máx. 1 por farmacia', action: 'Añadido', art: 'shelf',
    description: 'Tres baldas para colocar junto a la caja. Cabe la gama de descanso completa y deja hueco para los folletos en la balda inferior.',
    specs: [{ k: 'Material', v: 'Cartón microcanal reciclado' }, { k: 'Medidas', v: '28 × 40 × 22 cm · 3 baldas' }, { k: 'Capacidad', v: 'Hasta 18 unidades y 50 folletos' }, { k: 'Límite', v: '1 por farmacia y campaña' }],
    tip: 'Junto a la caja, a la derecha del cliente. Las farmacias que lo colocan ahí venden un 30 % más de la gama de descanso.',
    supply: '1.200 uds', supplyMeta: 'repone el 12 sep', delivery: 'Máx. 1 por farmacia', state: 'Publicado', requests: '128' },
  { id: 'cartel', campaignId: 'otono', name: 'Cartel de escaparate', meta: 'Vinilo estático · A2 · campaña de otoño', kind: 'cartel', limit: 'Hasta 2 unidades', action: 'Añadido', art: 'poster',
    description: 'Vinilo electrostático para cristal, se quita sin dejar marca.', specs: [{ k: 'Material', v: 'Vinilo estático' }, { k: 'Medidas', v: 'A2 · 42 × 59 cm' }, { k: 'Límite', v: '2 por farmacia' }],
    tip: 'A la altura de los ojos, en el cristal más cercano a la puerta.', supply: '80 uds', supplyMeta: 'repone el 20 sep', supplyLow: true, delivery: 'Hasta 2 unidades', state: 'Publicado', requests: '96' },
  { id: 'folleto-magnesio', campaignId: 'otono', name: 'Folleto Magnesio Complex', meta: 'Díptico A5 · paquete de 50', kind: 'folleto', limit: 'Paquetes de 50', action: 'Añadido', art: 'leaflet',
    description: 'Díptico con las tres formas de magnesio explicadas para el cliente.', specs: [{ k: 'Formato', v: 'Díptico A5' }, { k: 'Unidad', v: 'Paquete de 50' }],
    tip: 'En la balda inferior del expositor o junto a la caja.', supply: '12.500 uds', supplyMeta: 'repone el 3 oct', delivery: 'Paquetes de 50', state: 'Publicado', requests: '156' },
  { id: 'guia', campaignId: 'otono', name: 'Guía rápida de mostrador', meta: 'Plastificada A5 · para el equipo', kind: 'folleto', limit: 'Hasta 5 unidades', action: 'Añadir', art: 'shelf',
    description: 'Chuleta plastificada para el equipo: qué recomendar según lo que cuenta el cliente.', specs: [{ k: 'Formato', v: 'A5 plastificada' }, { k: 'Límite', v: '5 por farmacia' }],
    tip: 'Detrás del mostrador, no a la vista del cliente.', supply: '2.400 uds', supplyMeta: 'repone el 18 sep', delivery: 'Hasta 5 unidades', state: 'Publicado', requests: '204' },
  { id: 'stopper', campaignId: 'otono', name: 'Stopper de lineal', meta: 'PVC · 10 × 7 cm · juego de 4', kind: 'expositor', limit: 'Hasta 2 juegos', action: 'Añadir', art: 'stopper',
    description: 'Señalizador perpendicular al lineal para destacar la gama.', specs: [{ k: 'Material', v: 'PVC' }, { k: 'Medidas', v: '10 × 7 cm' }, { k: 'Unidad', v: 'Juego de 4' }],
    tip: 'A la altura de la referencia que más rota.', supply: '640 juegos', supplyMeta: 'repone el 25 sep', delivery: 'Hasta 2 juegos', state: 'Publicado', requests: '88' },
  { id: 'bolsas', campaignId: 'otono', name: 'Bolsas de farmacia', meta: 'Papel kraft · caja de 250', kind: 'merch', limit: '1 caja por trimestre', action: 'Añadir', art: 'bag',
    description: 'Bolsa kraft con el mensaje de campaña.', specs: [{ k: 'Material', v: 'Papel kraft' }, { k: 'Unidad', v: 'Caja de 250' }],
    tip: 'Sustituye a la bolsa neutra durante la campaña.', supply: '310 cajas', supplyMeta: 'repone el 1 oct', delivery: '1 caja por trimestre', state: 'Publicado', requests: '187' },
  { id: 'redes', campaignId: 'otono', name: 'Pack para redes sociales', meta: '12 imágenes + textos · descarga', kind: 'digital', limit: 'Descarga inmediata', action: 'Descargar', art: 'phone',
    description: '12 imágenes cuadradas y verticales con sus textos listos para publicar.', specs: [{ k: 'Formato', v: 'ZIP · 86 MB' }, { k: 'Contenido', v: '12 imágenes + textos' }],
    tip: 'Dos publicaciones por semana durante la campaña.', supply: 'ZIP · 86 MB', supplyMeta: 'v1 · 1 sep', delivery: 'Descarga inmediata', state: 'Publicado', requests: '312' },
  { id: 'bata', campaignId: 'otono', name: 'Bata bordada Suprafeel', meta: 'Tallas S a XL · 1 por persona', kind: 'merch', limit: 'Solicitado el 4 sep', action: 'En camino', art: 'shirt',
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
