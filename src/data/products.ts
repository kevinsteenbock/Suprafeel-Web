import type { Art } from '@/ui/ProductArt'

export interface Product {
  id: string
  name: string
  format: string
  cn: string
  ean: string
  pvp: number
  pvf: number
  margin: number
  category: string
  categoryLabel: string
  tag?: 'NOVEDAD' | 'MÁS VENDIDO' | 'CON FORMACIÓN' | 'CON PLV' | 'MÁS CONSULTADO'
  art: Art
  code: string
  status: 'Publicado' | 'Borrador'
  updated: string
  updatedBy: string
  pitch: string
  composition: { name: string; qty: string; vrn: string }[]
  dose: string
  symptoms: string[]
  warning?: string
  allergens: string
  suitable: string
  registry: string
  packaging: string
  courseId?: string
  plv?: string
  consultations30d: number
  hasCourse?: boolean
  hasPLV?: boolean
  isNew?: boolean
  bestSeller?: boolean
}

export const products: Product[] = [
  {
    id: 'magnesio-complex', name: 'Magnesio Complex', format: '60 cápsulas', cn: '218 442', ean: '8436017 332118', pvp: 18.9, pvf: 12.85, margin: 32,
    category: 'minerales', categoryLabel: 'Vitaminas y minerales', tag: 'NOVEDAD', art: 'bottle', code: 'MG', status: 'Publicado', updated: '3 sep', updatedBy: 'Kevin S.',
    pitch: 'Indicado para calambres nocturnos, fatiga muscular y estrés sostenido. El bisglicinato tolera mejor a nivel digestivo que el óxido: es la recomendación cuando otros magnesios han sentado mal.',
    composition: [
      { name: 'Magnesio bisglicinato', qty: '300 mg', vrn: '80 %' },
      { name: 'Magnesio citrato', qty: '100 mg', vrn: '27 %' },
      { name: 'Vitamina B6 (P-5-P)', qty: '1,4 mg', vrn: '100 %' },
      { name: 'Taurina', qty: '50 mg', vrn: '—' },
    ],
    dose: '2 cápsulas con la cena', symptoms: ['Calambres nocturnos', 'Cansancio y fatiga', 'Insomnio de mantenimiento', 'Estrés sostenido', 'Migraña episódica'],
    warning: 'Separar 4 horas de la levotiroxina y de los antibióticos de tipo quinolona o tetraciclina. En insuficiencia renal, derivar al médico.',
    allergens: 'Sin gluten, sin lactosa', suitable: 'Dieta vegana', registry: '26.017 118 / V', packaging: 'Caja de 6 unidades', courseId: 'magnesio', plv: 'Expositor de mostrador y 2 folletos',
    consultations30d: 64, hasCourse: true, hasPLV: true, isNew: true,
  },
  {
    id: 'colageno-hialuronico', name: 'Colágeno + Ácido Hialurónico', format: 'Bote 300 g', cn: '218 517', ean: '8436017 332125', pvp: 32.5, pvf: 21.1, margin: 35,
    category: 'belleza', categoryLabel: 'Belleza y piel', tag: 'NOVEDAD', art: 'jar', code: 'CO', status: 'Publicado', updated: '3 sep', updatedBy: 'Kevin S.',
    pitch: 'Colágeno hidrolizado tipo I y II con hialurónico y vitamina C. Para piel y articulaciones a partir de los 40; los resultados tardan 8–12 semanas y hay que decirlo.',
    composition: [
      { name: 'Colágeno hidrolizado', qty: '10 g', vrn: '—' },
      { name: 'Ácido hialurónico', qty: '120 mg', vrn: '—' },
      { name: 'Vitamina C', qty: '80 mg', vrn: '100 %' },
    ],
    dose: '1 cacito en agua o zumo por la mañana', symptoms: ['Piel apagada', 'Dolor articular', 'Caída del pelo'],
    allergens: 'Contiene pescado', suitable: 'Sin azúcares añadidos', registry: '26.017 231 / V', packaging: 'Caja de 6 botes',
    consultations30d: 41, isNew: true, hasCourse: true, courseId: 'colageno', hasPLV: true,
  },
  {
    id: 'omega-3', name: 'Omega 3 TG Alta Pureza', format: '90 perlas', cn: '214 003', ean: '8436017 331005', pvp: 27.9, pvf: 19.5, margin: 30,
    category: 'cardio', categoryLabel: 'Cardiovascular', tag: 'MÁS VENDIDO', art: 'bottle', code: 'OM', status: 'Publicado', updated: '12 ago', updatedBy: 'Kevin S.',
    pitch: 'EPA y DHA en forma de triglicérido, la que mejor se absorbe. Para colesterol, ojo seco y concentración. No prometer efectos cardiovasculares concretos.',
    composition: [
      { name: 'EPA', qty: '400 mg', vrn: '—' },
      { name: 'DHA', qty: '300 mg', vrn: '—' },
      { name: 'Vitamina E', qty: '10 mg', vrn: '83 %' },
    ],
    dose: '1 perla con la comida', symptoms: ['Niebla mental', 'Ojo seco', 'Colesterol alto'],
    warning: 'Con anticoagulantes (Sintrom, apixabán) consultar antes al médico.',
    allergens: 'Contiene pescado', suitable: 'Sin gluten', registry: '26.016 902 / V', packaging: 'Caja de 12', consultations30d: 38, bestSeller: true,
  },
  {
    id: 'vitamina-d3-k2', name: 'Vitamina D3 + K2 gotas', format: '15 ml', cn: '215 880', ean: '8436017 331500', pvp: 16.4, pvf: 11.0, margin: 33,
    category: 'vitaminas', categoryLabel: 'Vitaminas y minerales', tag: 'CON FORMACIÓN', art: 'dropper', code: 'D3', status: 'Publicado', updated: '12 ago', updatedBy: 'Kevin S.',
    pitch: 'Una gota al día. La K2 (MK-7) dirige el calcio al hueso. En España hay déficit aunque haya sol: de octubre a marzo casi no se sintetiza.',
    composition: [
      { name: 'Vitamina D3', qty: '2.000 UI', vrn: '1.000 %' },
      { name: 'Vitamina K2 (MK-7)', qty: '75 µg', vrn: '100 %' },
    ],
    dose: '1 gota al día con comida', symptoms: ['Defensas bajas', 'Cansancio y fatiga', 'Dolor articular'],
    warning: 'La K2 interfiere con el Sintrom. Si toma anticoagulantes, derivar.',
    allergens: 'Sin alérgenos', suitable: 'Apto para niños a partir de 3 años', registry: '26.017 004 / V', packaging: 'Caja de 12', consultations30d: 29, hasCourse: true, courseId: 'vitamina-d',
  },
  {
    id: 'probiotico-flora', name: 'Probiótico Flora 10 cepas', format: '30 cápsulas', cn: '216 204', ean: '8436017 331708', pvp: 22.9, pvf: 15.1, margin: 34,
    category: 'digestivo', categoryLabel: 'Digestivo', tag: 'CON PLV', art: 'bottle', code: 'PR', status: 'Publicado', updated: '28 ago', updatedBy: 'Kevin S.',
    pitch: '10 cepas y 20.000 millones de UFC. Tras antibiótico, hinchazón recurrente o tránsito irregular. Se toma en ayunas y no hace falta nevera.',
    composition: [
      { name: 'Mezcla de 10 cepas', qty: '20 × 10⁹ UFC', vrn: '—' },
      { name: 'FOS (prebiótico)', qty: '100 mg', vrn: '—' },
    ],
    dose: '1 cápsula en ayunas', symptoms: ['Digestión pesada', 'Hinchazón', 'Tras antibiótico'],
    allergens: 'Sin lactosa', suitable: 'Dieta vegana', registry: '26.016 977 / V', packaging: 'Caja de 6', consultations30d: 33, hasPLV: true,
  },
  {
    id: 'melatonina-noche', name: 'Melatonina Noche Retard', format: '60 cápsulas', cn: '217 119', ean: '8436017 331906', pvp: 14.2, pvf: 9.8, margin: 31,
    category: 'descanso', categoryLabel: 'Descanso y ánimo', tag: 'MÁS VENDIDO', art: 'bottle', code: 'ME', status: 'Publicado', updated: '28 ago', updatedBy: 'Kevin S.',
    pitch: 'Melatonina 1,9 mg de liberación retardada. Para quien se despierta de madrugada, no para quien tarda en dormirse. Media hora antes de acostarse.',
    composition: [
      { name: 'Melatonina (retard)', qty: '1,9 mg', vrn: '—' },
      { name: 'Extracto de pasiflora', qty: '80 mg', vrn: '—' },
    ],
    dose: '1 cápsula 30 min antes de dormir', symptoms: ['Insomnio de mantenimiento', 'Jet lag', 'Cambio de turno'],
    warning: 'No combinar con ansiolíticos sin consultar. Por debajo de 2 mg se dispensa sin receta.',
    allergens: 'Sin gluten, sin lactosa', suitable: 'Dieta vegana', registry: '26.017 033 / V', packaging: 'Caja de 6', consultations30d: 71, bestSeller: true, courseId: 'insomnio', hasCourse: true,
  },
  {
    id: 'hierro-bisglicinato', name: 'Hierro Bisglicinato', format: '60 cápsulas', cn: '213 470', ean: '8436017 330800', pvp: 15.9, pvf: 11.1, margin: 30,
    category: 'minerales', categoryLabel: 'Vitaminas y minerales', tag: 'CON FORMACIÓN', art: 'bottle', code: 'HI', status: 'Publicado', updated: '14 jul', updatedBy: 'Kevin S.',
    pitch: 'Hierro quelado que no estriñe ni mancha los dientes. Para cansancio en mujer con reglas abundantes. Con vitamina C y separado del café.',
    composition: [
      { name: 'Hierro bisglicinato', qty: '28 mg', vrn: '200 %' },
      { name: 'Vitamina C', qty: '80 mg', vrn: '100 %' },
      { name: 'Ácido fólico', qty: '400 µg', vrn: '200 %' },
    ],
    dose: '1 cápsula en ayunas con zumo', symptoms: ['Cansancio y fatiga', 'Caída del pelo', 'Reglas abundantes'],
    warning: 'No mezclar con café, té ni lácteos en la misma toma.',
    allergens: 'Sin alérgenos', suitable: 'Apto en embarazo', registry: '26.016 811 / V', packaging: 'Caja de 6', consultations30d: 22, hasCourse: true, courseId: 'hierro',
  },
  {
    id: 'complejo-b', name: 'Complejo B Energía', format: '30 comprimidos', cn: '212 665', ean: '8436017 330602', pvp: 12.8, pvf: 9.1, margin: 29,
    category: 'vitaminas', categoryLabel: 'Vitaminas y minerales', tag: 'CON PLV', art: 'sachet', code: 'CB', status: 'Publicado', updated: '14 jul', updatedBy: 'Kevin S.',
    pitch: 'Vitaminas B activadas (metilfolato, metilcobalamina). Para fatiga diurna y épocas de exámenes. Por la mañana, nunca de noche.',
    composition: [
      { name: 'B12 (metilcobalamina)', qty: '500 µg', vrn: '20.000 %' },
      { name: 'Folato (5-MTHF)', qty: '400 µg', vrn: '200 %' },
      { name: 'B6 (P-5-P)', qty: '10 mg', vrn: '714 %' },
    ],
    dose: '1 comprimido por la mañana', symptoms: ['Cansancio y fatiga', 'Niebla mental', 'Estrés sostenido'],
    allergens: 'Sin gluten', suitable: 'Dieta vegana', registry: '26.016 790 / V', packaging: 'Caja de 12', consultations30d: 19, hasPLV: true,
  },
  {
    id: 'ashwagandha', name: 'Ashwagandha KSM-66', format: '60 cápsulas', cn: '—', ean: '—', pvp: 0, pvf: 0, margin: 0,
    category: 'descanso', categoryLabel: 'Descanso y ánimo', art: 'bottle', code: 'AS', status: 'Borrador', updated: 'hace 3 d', updatedBy: 'Kevin S.',
    pitch: '', composition: [{ name: 'Ashwagandha KSM-66', qty: '600 mg', vrn: '—' }], dose: '', symptoms: ['Estrés sostenido'],
    allergens: '', suitable: '', registry: '', packaging: '', consultations30d: 0,
  },
]

export const productById = (id?: string) => products.find((p) => p.id === id)

export const catalogFilters = [
  { key: 'all', label: 'Todo el catálogo' },
  { key: 'new', label: 'Novedades' },
  { key: 'best', label: 'Más vendidos' },
  { key: 'course', label: 'Con formación disponible' },
  { key: 'plv', label: 'Con material PLV' },
] as const

export function filterProducts(key: string) {
  const pub = products.filter((p) => p.status === 'Publicado')
  switch (key) {
    case 'new': return pub.filter((p) => p.isNew)
    case 'best': return pub.filter((p) => p.bestSeller)
    case 'course': return pub.filter((p) => p.hasCourse)
    case 'plv': return pub.filter((p) => p.hasPLV)
    default: return pub
  }
}

export const euro = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'

/** Categorías del catálogo. Se pueden crear nuevas desde el desplegable. */
export const categories = ['Vitaminas y minerales', 'Minerales', 'Digestivo', 'Descanso y ánimo', 'Belleza y piel', 'Cardiovascular', 'Deporte']
export function addCategory(name: string) {
  if (!categories.includes(name)) categories.push(name)
}
