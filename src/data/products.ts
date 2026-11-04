import type { Art } from '@/ui/ProductArt'

/** Foto real del producto, extraída de la ficha de Shopify (azwvb1-gd.myshopify.com). */
const photo = (n: string) => `${import.meta.env.BASE_URL}img/productos/${n}.png`

/** Vídeo explicativo del producto: el vídeo de formación de Suprafeel, en versión web de 720p, y su portada. */
const video = (n: string, duracion: string) => ({
  src: `${import.meta.env.BASE_URL}video/formacion/${n}.mp4`,
  poster: `${import.meta.env.BASE_URL}video/formacion/${n}.jpg`,
  duracion,
})

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
  tag?: 'NOVEDAD' | 'MÁS VENDIDO' | 'MÁS CONSULTADO'
  art: Art
  photo?: string
  video?: { src: string; poster: string; duracion: string }
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
  isNew?: boolean
  bestSeller?: boolean
}

/** La tarifa de la que salen PVPR, PVF y EAN. El año es el del documento, no el de hoy. */
export const TARIFA = 'Tarifa 2026'
/**
 * Día en que se cargaron esa tarifa y los EAN en la app y en Xano. Es un dato (cuándo cambió la
 * ficha), no la fecha de hoy: cuando el catálogo se lea de Xano, saldrá de su campo `updated`.
 */
export const TARIFA_CARGADA = '2026-10-31'

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
/** '2026-10-31' → «31 oct» (con el año si no es el de hoy). Sin pasar por Date: la zona horaria no mueve el día. */
export function fechaDato(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return ''
  const año = Number(m[1]) !== new Date().getFullYear() ? ` ${m[1]}` : ''
  return `${Number(m[3])} ${MESES[Number(m[2]) - 1]}${año}`
}

/** Lo que consta que ha cambiado en cada ficha. Antes de la tarifa 2026 no hay historial en la app. */
export function historialDe(p: Pick<Product, 'ean'>): { t: string; fecha: string; quien: string }[] {
  return [{ t: `${p.ean ? 'PVPR, PVF y EAN' : 'PVPR y PVF'} de la ${TARIFA.toLowerCase()}`, fecha: fechaDato(TARIFA_CARGADA), quien: 'Kevin S.' }]
}

const ACTUALIZADO = fechaDato(TARIFA_CARGADA)

/** IVA de los complementos alimenticios: el PVPR de la tarifa lo lleva incluido. */
export const IVA = 0.1

/**
 * Margen de la farmacia en %, sobre el precio de venta sin IVA:
 * (PVPR / 1,10 − PVF) / (PVPR / 1,10). Con la tarifa 2026 sale un 35 % en todos.
 */
export function margen(pvp: number, pvf: number): number {
  const sinIva = pvp / (1 + IVA)
  return pvp > 0 && pvf > 0 ? Math.round(((sinIva - pvf) / sinIva) * 100) : 0
}

/** EAN, PVF y PVPR de TARIFA SUPRAFEEL 2026.pdf (Drive); el margen se calcula. */
function tarifa(ean: string, pvf: number, pvp: number) {
  return { ean, pvf, pvp, margin: margen(pvp, pvf) }
}

/**
 * Los 20 productos reales de la tienda Shopify de Suprafeel (azwvb1-gd.myshopify.com),
 * extraídos vía Admin API: nombre, presentación, composición nutricional, modo de empleo,
 * advertencias, aptitud dietética y gama vienen todos de la ficha real de cada producto.
 * EAN, PVF y PVPR vienen de la tarifa 2026 (TARIFA SUPRAFEEL 2026.pdf). El CN y el registro
 * sanitario no están en la tarifa y se dejan vacíos: son identificadores regulatorios reales
 * que no se inventan.
 */
export const products: Product[] = [
  {
    id: 'magnesio', photo: photo('magnesio'), video: video('magnesio', '3:00'), name: 'Magnesio', format: '120 cápsulas', cn: '',
    ...tarifa('8425402898109', 11.76, 19.9),
    category: 'basicos', categoryLabel: 'Básicos',
    art: 'bottle', code: 'MA', status: 'Publicado', updated: ACTUALIZADO, updatedBy: 'Kevin S.',
    pitch: 'Magnesio (citrato + bisglicinato) con vitaminas C, B5 y B6',
    composition: [
      { name: 'Citrato de magnesio (14,5–16,5% Mg)', qty: '1.030 mg', vrn: '—' },
      { name: 'de los cuales magnesio elemental', qty: 'mín. 149,35 mg', vrn: '—' },
      { name: 'Bisglicinato de magnesio (20% Mg)', qty: '400 mg', vrn: '—' },
      { name: 'de los cuales magnesio elemental', qty: '80 mg', vrn: '—' },
      { name: 'Total magnesio elemental', qty: '229,35 mg', vrn: '61,2 %' },
      { name: 'Vitamina C', qty: '80 mg', vrn: '100 %' },
      { name: 'Ácido pantoténico (B5)', qty: '6 mg', vrn: '100 %' },
      { name: 'Vitamina B6', qty: '1,7 mg', vrn: '121 %' },
    ],
    dose: '2 cápsulas al día. Preferiblemente por la noche, con comida.',
    symptoms: ['Personas con estrés físico o mental', 'Sueño de baja calidad', 'Tensión muscular o calambres'],
    warning: 'Se recomienda no consumir durante el embarazo, la lactancia ni en niños. Los complementos alimenticios no deben utilizarse como sustituto de una dieta variada y equilibrada y un modo de vida saludable. No superar la dosis diaria expresamente recomendada. Mantener fuera del alcance de los niños. Recomendado solo para adultos.',
    allergens: '', suitable: 'Apto veganos, Sin gluten, Sin lactosa, Sin OGM, Sin alérgenos', registry: '', packaging: '',
  },
  {
    id: 'colageno-1', photo: photo('colageno-1'), video: video('colageno-1', '2:31'), name: 'Colágeno', format: '60 cápsulas', cn: '',
    ...tarifa('8425402898154', 11.76, 19.9),
    category: 'basicos', categoryLabel: 'Básicos',
    art: 'bottle', code: 'CO', status: 'Publicado', updated: ACTUALIZADO, updatedBy: 'Kevin S.',
    pitch: 'Colágeno hidrolizado de origen bovino con coenzima Q10, ácido hialurónico, zinc y vitaminas',
    composition: [
      { name: 'Colágeno bovino hidrolizado (COLPROPUR® D)', qty: '740 mg', vrn: '—' },
      { name: 'Vitamina C', qty: '160 mg', vrn: '200 %' },
      { name: 'Coenzima Q10', qty: '60 mg', vrn: '—' },
      { name: 'Hialuronato sódico', qty: '57 mg', vrn: '—' },
      { name: 'Citrato de zinc trihidrato', qty: '20 mg', vrn: '—' },
      { name: 'del cual zinc elemental', qty: '6,2 mg', vrn: '62 %' },
      { name: 'Vitamina D', qty: '50 µg', vrn: '1.000 %' },
      { name: 'Vitamina B12', qty: '50 µg', vrn: '2.000 %' },
      { name: 'Biotina', qty: '900 µg', vrn: '1.800 %' },
    ],
    dose: '2 cápsulas al día. Preferiblemente por la noche, con comida.',
    symptoms: ['Personas activas o deportistas que someten sus', 'Adultos que buscan cuidar la firmeza y el aspecto de su', 'Cualquiera que quiera incorporar el colágeno hidrolizado'],
    warning: 'Si vas a hacerte un análisis de sangre, ten en cuenta que la biotina puede interferir en los resultados: coméntaselo a tu médico o al laboratorio. Se recomienda no consumir durante el embarazo, la lactancia ni en niños. Los complementos alimenticios no deben utilizarse como sustituto de una dieta variada y equilibrada y un modo de vida saludable. No superar la dosis diaria expresamente recomendada. Mantener fuera del alcance de los niños. Recomendado solo para adultos.',
    allergens: '', suitable: 'Sin gluten, Sin lactosa, Sin OGM, Sin alérgenos', registry: '', packaging: '',
  },
  {
    id: 'omega', photo: photo('omega'), video: video('omega', '2:30'), name: 'Omega 3', format: '60 perlas', cn: '',
    ...tarifa('8425402898116', 14.71, 24.9),
    category: 'basicos', categoryLabel: 'Básicos',
    art: 'bottle', code: 'OM', status: 'Publicado', updated: ACTUALIZADO, updatedBy: 'Kevin S.',
    pitch: 'Aceite de pescado concentrado rico en EPA y DHA en forma de triglicéridos',
    composition: [
      { name: 'Aceite de pescado concentrado (triglicéridos)', qty: '2.000 mg', vrn: '—' },
      { name: 'del cual EPA (mín. 35%)', qty: '700 mg', vrn: '—' },
      { name: 'del cual DHA (mín. 25%)', qty: '500 mg', vrn: '—' },
      { name: 'Vitamina E (D-α-tocoferol)', qty: '4 mg', vrn: '33,3 %' },
    ],
    dose: '2 perlas al día. Preferiblemente con una comida principal, con algo de grasa.',
    symptoms: ['Adultos que quieran cubrir su aporte de omega-3 de forma', 'Personas cuyo consumo habitual de pescado azul es bajo', 'Cualquiera que busque un apoyo diario a la salud'],
    warning: 'Confirma el origen de la gelatina de la cápsula si sigues una dieta sin productos de origen animal. Se recomienda no consumir durante el embarazo, la lactancia ni en niños. Los complementos alimenticios no deben utilizarse como sustituto de una dieta variada y equilibrada y un modo de vida saludable. No superar la dosis diaria expresamente recomendada. Mantener fuera del alcance de los niños. Recomendado solo para adultos.',
    allergens: 'Pescado', suitable: 'Sin gluten, Sin lactosa, Sin OGM', registry: '', packaging: '',
  },
  {
    id: 'vitamina-d3-k2', photo: photo('vitamina-d3-k2'), name: 'Vitamina D3 + K2 (MK-7)', format: '60 cápsulas', cn: '',
    ...tarifa('8425402898000', 12.35, 20.9),
    category: 'basicos', categoryLabel: 'Básicos',
    art: 'bottle', code: 'VI', status: 'Publicado', updated: ACTUALIZADO, updatedBy: 'Kevin S.',
    pitch: 'Vitaminas D3 (colecalciferol) y K2 (menaquinona-7)',
    composition: [
      { name: 'Vitamina K2 (MK-7)', qty: '75 µg', vrn: '100 %' },
      { name: 'Vitamina D3 (colecalciferol)', qty: '50 µg', vrn: '1.000 %' },
    ],
    dose: '1 cápsula al día. Preferiblemente con una comida principal, con algo de grasa.',
    symptoms: ['Adultos con baja exposición solar durante gran parte del'],
    warning: 'Si estás en tratamiento anticoagulante (antivitamina K), consulta a tu médico antes de tomarlo. Se recomienda no consumir durante el embarazo, la lactancia ni en niños. Los complementos alimenticios no deben utilizarse como sustituto de una dieta variada y equilibrada y un modo de vida saludable. No superar la dosis diaria expresamente recomendada. Mantener fuera del alcance de los niños. Recomendado solo para adultos.',
    allergens: '', suitable: 'Apto veganos, Sin gluten, Sin lactosa, Sin OGM, Sin alérgenos', registry: '', packaging: '',
  },
  {
    id: 'multivitaminico', photo: photo('multivitaminico'), video: video('multivitaminico', '2:09'), name: 'Multivitamínico', format: '60 cápsulas', cn: '',
    ...tarifa('8425402898048', 14.12, 23.9),
    category: 'basicos', categoryLabel: 'Básicos',
    art: 'bottle', code: 'MU', status: 'Publicado', updated: ACTUALIZADO, updatedBy: 'Kevin S.',
    pitch: 'Multivitamínico y multimineral con coenzima Q10',
    composition: [
      { name: 'Vitamina C', qty: '250 mg', vrn: '312 %' },
      { name: 'Vitamina E', qty: '27,5 mg', vrn: '229 %' },
      { name: 'Coenzima Q10', qty: '25 mg', vrn: '—' },
      { name: 'Magnesio', qty: '20 mg', vrn: '5,3 %' },
      { name: 'Niacina (B3)', qty: '20 mg', vrn: '125 %' },
      { name: 'Ácido pantoténico (B5)', qty: '8 mg', vrn: '133 %' },
      { name: 'Zinc', qty: '5 mg', vrn: '50 %' },
      { name: 'Vitamina B6', qty: '2,6 mg', vrn: '186 %' },
      { name: 'Vitamina B2', qty: '2,1 mg', vrn: '150 %' },
      { name: 'Vitamina B1', qty: '2,07 mg', vrn: '188 %' },
      { name: 'Vitamina A', qty: '405 µg', vrn: '50,6 %' },
      { name: 'Ácido fólico', qty: '100 µg', vrn: '50 %' },
      { name: 'Biotina', qty: '75 µg', vrn: '150 %' },
      { name: 'Vitamina B12', qty: '1.250 µg', vrn: '50.000 %' },
    ],
    dose: '1 cápsula al día. Preferiblemente por la mañana, con comida.',
    symptoms: ['Producto de entrada para cualquier adulto que quiera'],
    warning: 'Consulta a un profesional sanitario si tomas medicamentos o estás bajo supervisión médica, especialmente anticoagulantes, insulina o tratamiento oncológico. Se recomienda no consumir durante el embarazo, la lactancia ni en niños. Los complementos alimenticios no deben utilizarse como sustituto de una dieta variada y equilibrada y un modo de vida saludable. No superar la dosis diaria expresamente recomendada. Mantener fuera del alcance de los niños. Recomendado solo para adultos.',
    allergens: '', suitable: 'Apto veganos, Sin gluten, Sin lactosa, Sin OGM, Sin alérgenos', registry: '', packaging: '',
  },
  {
    id: 'immune-defense', photo: photo('immune-defense'), video: video('immune-defense', '2:22'), name: 'Immune Defense', format: '60 cápsulas', cn: '',
    ...tarifa('8425402898079', 11.76, 19.9),
    category: 'inmunidad', categoryLabel: 'Inmunidad',
    art: 'bottle', code: 'IM', status: 'Publicado', updated: ACTUALIZADO, updatedBy: 'Kevin S.',
    pitch: 'Vitamina C, equinácea, zinc y vitamina D3',
    composition: [
      { name: 'Vitamina C', qty: '325 mg', vrn: '406 %' },
      { name: 'Extracto de equinácea (4% polifenoles)', qty: '225 mg', vrn: '—' },
      { name: 'de los cuales polifenoles', qty: '9 mg', vrn: '—' },
      { name: 'Zinc', qty: '20 mg', vrn: '200 %' },
      { name: 'Vitamina D', qty: '5 µg', vrn: '100 %' },
    ],
    dose: '1 cápsula al día. Preferiblemente por la mañana, con comida.',
    symptoms: ['Adultos mayores de 12 años que buscan un apoyo puntual de', 'Personas que quieren potenciar su sistema inmunológico en'],
    warning: 'Contiene equinácea: no recomendado en enfermedades autoinmunes ni en menores de 12 años. Contraindicado en lupus, esclerosis múltiple, artritis reumatoide o tratamiento inmunosupresor. No se recomienda su uso continuado más de 8 semanas seguidas. Se recomienda no consumir durante el embarazo, la lactancia ni en niños. Los complementos alimenticios no deben utilizarse como sustituto de una dieta variada y equilibrada y un modo de vida saludable. No superar la dosis diaria expresamente recomendada. Mantener fuera del alcance de los niños. Recomendado solo para adultos.',
    allergens: '', suitable: 'Apto veganos, Sin gluten, Sin lactosa, Sin OGM, Sin alérgenos', registry: '', packaging: '',
  },
  {
    id: 'vitamin-c', photo: photo('vitamin-c'), video: video('vitamin-c', '2:40'), name: 'Vitamina C', format: '180 cápsulas', cn: '',
    ...tarifa('8425402898017', 14.71, 24.9),
    category: 'inmunidad', categoryLabel: 'Inmunidad',
    art: 'bottle', code: 'VI', status: 'Publicado', updated: ACTUALIZADO, updatedBy: 'Kevin S.',
    pitch: 'Vitamina C 1.000 mg',
    composition: [
      { name: 'Vitamina C', qty: '1.000 mg', vrn: '1.250 %' },
    ],
    dose: '1 cápsula al día. Preferiblemente por la mañana, con comida.',
    symptoms: ['Cualquier adulto que quiera cubrir de forma constante su', 'Personas que quieran un apoyo para prevenir gripes y', 'Personas cuya dieta es baja en fruta y verdura fresca, o'],
    warning: 'Se recomienda no consumir durante el embarazo, la lactancia ni en niños. Los complementos alimenticios no deben utilizarse como sustituto de una dieta variada y equilibrada y un modo de vida saludable. No superar la dosis diaria expresamente recomendada. Mantener fuera del alcance de los niños. Recomendado solo para adultos.',
    allergens: '', suitable: 'Apto veganos, Sin gluten, Sin lactosa, Sin OGM, Sin alérgenos', registry: '', packaging: '',
  },
  {
    id: 'zinc', photo: photo('zinc'), video: video('zinc', '2:32'), name: 'Zinc', format: '120 cápsulas', cn: '',
    ...tarifa('8425402898024', 11.76, 19.9),
    category: 'inmunidad', categoryLabel: 'Inmunidad',
    art: 'bottle', code: 'ZI', status: 'Publicado', updated: ACTUALIZADO, updatedBy: 'Kevin S.',
    pitch: 'Bisglicinato de zinc (15 mg de zinc elemental)',
    composition: [
      { name: 'Bisglicinato de zinc (20% Zn)', qty: '75 mg', vrn: '—' },
      { name: 'del cual zinc elemental', qty: '15 mg', vrn: '150 %' },
    ],
    dose: '1 cápsula al día. Preferiblemente por la noche, con comida.',
    symptoms: ['Personas que buscan un apoyo nutricional para sus defensas,', 'Personas con acné, piel grasa o problemas de piel', 'Personas que siguen una alimentación vegetariana o vegana,'],
    warning: 'No se recomienda el consumo simultáneo de otros suplementos que contengan zinc. Se recomienda no consumir durante el embarazo, la lactancia ni en niños. Los complementos alimenticios no deben utilizarse como sustituto de una dieta variada y equilibrada y un modo de vida saludable. No superar la dosis diaria expresamente recomendada. Mantener fuera del alcance de los niños. Recomendado solo para adultos.',
    allergens: '', suitable: 'Apto veganos, Sin gluten, Sin lactosa, Sin OGM, Sin alérgenos', registry: '', packaging: '',
  },
  {
    id: 'curcuma', photo: photo('curcuma'), video: video('curcuma', '2:39'), name: 'Cúrcuma', format: '120 cápsulas', cn: '',
    ...tarifa('8425402898147', 11.76, 19.9),
    category: 'vitalidad', categoryLabel: 'Vitalidad',
    art: 'bottle', code: 'CÚ', status: 'Publicado', updated: ACTUALIZADO, updatedBy: 'Kevin S.',
    pitch: 'Cúrcuma con jengibre y pimienta negra (piperina)',
    composition: [
      { name: 'Cúrcuma (Curcuma longa) rizoma', qty: '1.300 mg', vrn: '—' },
      { name: 'Extracto de jengibre (5% gingeroles)', qty: '100 mg', vrn: '—' },
      { name: 'de los cuales gingeroles', qty: '5 mg', vrn: '—' },
      { name: 'Extracto de pimienta negra (95% piperina)', qty: '20 mg', vrn: '—' },
      { name: 'de los cuales piperina', qty: '19 mg', vrn: '—' },
    ],
    dose: '2 cápsulas al día. Preferiblemente con comida, idealmente con algo de grasa.',
    symptoms: ['Personas con molestias articulares ocasionales o sobrecarga', 'Quienes buscan apoyo digestivo ocasional', 'Adultos que quieran mantener o mejorar su bienestar'],
    warning: 'Si toma medicación anticoagulante o tiene problemas biliares, consulte a su médico antes de usar este producto.',
    allergens: '', suitable: 'Apto veganos, Sin gluten, Sin lactosa, Sin OGM, Sin alérgenos', registry: '', packaging: '',
  },
  {
    id: 'maca-negra', photo: photo('maca-negra'), video: video('maca-negra', '1:46'), name: 'Maca negra', format: '120 cápsulas', cn: '',
    ...tarifa('8425402898215', 12.94, 21.9),
    category: 'vitalidad', categoryLabel: 'Vitalidad',
    art: 'bottle', code: 'MA', status: 'Publicado', updated: ACTUALIZADO, updatedBy: 'Kevin S.',
    pitch: 'Extracto de maca negra (20:1) con L-arginina, zinc y vitaminas B6 y B12',
    composition: [
      { name: 'Extracto de maca (20:1) raíz', qty: '1.200 mg', vrn: '—' },
      { name: 'L-arginina', qty: '450 mg', vrn: '—' },
      { name: 'Bisglicinato de zinc (20% Zn)', qty: '75 mg', vrn: '—' },
      { name: 'del cual zinc elemental', qty: '15 mg', vrn: '150 %' },
      { name: 'Vitamina B12', qty: '7,5 µg', vrn: '300 %' },
      { name: 'Vitamina B6', qty: '5,1 mg', vrn: '364 %' },
    ],
    dose: '3 cápsulas al día. Preferiblemente por la mañana, con comida.',
    symptoms: ['Adultos que buscan un extra de energía física y vitalidad', 'Especialmente en épocas de mayor desgaste físico o bajón de'],
    warning: 'La L-arginina puede potenciar el efecto de antihipertensivos, nitratos y tratamientos para la disfunción eréctil. Consulta con tu médico o farmacéutico antes de usarlo. Se recomienda no consumir durante el embarazo, la lactancia ni en niños. Los complementos alimenticios no deben utilizarse como sustituto de una dieta variada y equilibrada y un modo de vida saludable. No superar la dosis diaria expresamente recomendada. Mantener fuera del alcance de los niños. Recomendado solo para adultos.',
    allergens: '', suitable: 'Apto veganos, Sin gluten, Sin lactosa, Sin OGM, Sin alérgenos', registry: '', packaging: '',
  },
  {
    id: 'hierro-liposomado', photo: photo('hierro-liposomado'), name: 'Hierro liposomado', format: '60 cápsulas', cn: '',
    ...tarifa('8425402898093', 13.89, 23.5),
    category: 'vitalidad', categoryLabel: 'Vitalidad',
    art: 'bottle', code: 'HI', status: 'Publicado', updated: ACTUALIZADO, updatedBy: 'Kevin S.',
    pitch: 'Hierro liposomado (pirofosfato férrico)',
    composition: [
      { name: 'Hierro liposomado (pirofosfato férrico)', qty: '600 mg', vrn: '—' },
      { name: 'del cual hierro elemental', qty: '30 mg', vrn: '214 %' },
      { name: 'Vitamina C', qty: '80 mg', vrn: '100 %' },
      { name: 'Vitamina B12', qty: '12,5 µg', vrn: '500 %' },
      { name: 'Vitamina A', qty: '810 µg', vrn: '101 %' },
      { name: 'Vitamina B6', qty: '1,8 mg', vrn: '129 %' },
      { name: 'Ácido fólico', qty: '200 µg', vrn: '100 %' },
    ],
    dose: '1 cápsula al día. Preferiblemente por la mañana, en ayunas (separado del café, el té, los lácteos o el calcio).',
    symptoms: ['Personas con deficiencia de hierro o con necesidades'],
    warning: 'El consumo excesivo de hierro puede ser perjudicial; mantener especialmente fuera del alcance de los niños. No combinar con otros complementos que contengan hierro. Se recomienda no consumir durante el embarazo, la lactancia ni en niños. Los complementos alimenticios no deben utilizarse como sustituto de una dieta variada y equilibrada y un modo de vida saludable. No superar la dosis diaria expresamente recomendada. Mantener fuera del alcance de los niños. Recomendado solo para adultos.',
    allergens: '', suitable: 'Apto veganos, Sin gluten, Sin lactosa, Sin OGM, Sin alérgenos', registry: '', packaging: '',
  },
  {
    id: 'levadura-de-arroz-rojo', photo: photo('levadura-de-arroz-rojo'), video: video('levadura-de-arroz-rojo', '2:32'), name: 'Levadura de arroz rojo', format: '90 cápsulas', cn: '',
    ...tarifa('8425402898185', 14.71, 24.9),
    category: 'vitalidad', categoryLabel: 'Vitalidad',
    art: 'bottle', code: 'LE', status: 'Publicado', updated: ACTUALIZADO, updatedBy: 'Kevin S.',
    pitch: 'Levadura de arroz rojo, fitosteroles y extractos vegetales',
    composition: [
      { name: 'Extracto de salvia (2,5% ác. rosmarínico)', qty: '150 mg', vrn: '—' },
      { name: 'Fitosteroles 90% (de soja)', qty: '100 mg', vrn: '—' },
      { name: 'Extracto de ajo (1% alicina)', qty: '100 mg', vrn: '—' },
      { name: 'Vitamina E', qty: '44 mg', vrn: '367 %' },
      { name: 'Vitamina C', qty: '80 mg', vrn: '100 %' },
      { name: 'Levadura de arroz rojo (1,6% monacolina K)', qty: '50,87 mg', vrn: '—' },
      { name: 'de los cuales monacolina K', qty: '0,81 mg', vrn: '—' },
      { name: 'Extracto de astrágalo (20% polisacáridos)', qty: '50 mg', vrn: '—' },
      { name: 'de los cuales polisacáridos', qty: '10 mg', vrn: '—' },
      { name: 'Extracto de caña de azúcar (policosanol)', qty: '20 mg', vrn: '—' },
      { name: 'Niacina (B3)', qty: '16 mg', vrn: '100 %' },
      { name: 'Coenzima Q10', qty: '12 mg', vrn: '—' },
    ],
    dose: '1 cápsula al día. Preferiblemente por la noche, con la cena.',
    symptoms: ['Adultos (18–70 años) que desean un apoyo específico para su salud cardiovascular', 'Siempre bajo criterio médico si toman otra medicación'],
    warning: 'Contiene SOJA. No consumir junto a medicamentos hipolipemiantes (estatinas). No recomendado en menores de 18 ni mayores de 70 años. No recomendado durante el embarazo ni la lactancia. No superar 1 cápsula al día. Consulta a tu médico si tienes problemas musculares, hepáticos o renales. No combinar con otros productos que contengan arroz de levadura roja. No superar 3 g/día de esteroles vegetales añadidos si se combina con otras fuentes. Se recomienda no consumir durante el embarazo, la lactancia ni en niños. Los complementos alimenticios no deben utilizarse como sustituto de una dieta variada y equilibrada y un modo de vida saludable. No superar la dosis diaria expresamente recomendada. Mantener fuera del alcance de los niños. Recomendado solo para adultos.',
    allergens: 'Soja', suitable: 'Apto veganos, Sin gluten, Sin lactosa, Sin OGM', registry: '', packaging: '',
  },
  {
    id: 'vitamina-b12', photo: photo('vitamina-b12'), video: video('vitamina-b12', '2:11'), name: 'Vitamina B12', format: '120 cápsulas', cn: '',
    ...tarifa('8425402898178', 11.76, 19.9),
    category: 'vitalidad', categoryLabel: 'Vitalidad',
    art: 'bottle', code: 'VI', status: 'Publicado', updated: ACTUALIZADO, updatedBy: 'Kevin S.',
    pitch: 'Vitamina B12 con colina, ácido fólico y vitamina B6',
    composition: [
      { name: 'Bitartrato de colina', qty: '244 mg', vrn: '—' },
      { name: 'Vitamina B6', qty: '2,22 mg', vrn: '159 %' },
      { name: 'Vitamina B12', qty: '2.000 µg', vrn: '80.000 %' },
      { name: 'Ácido fólico', qty: '400 µg', vrn: '200 %' },
    ],
    dose: '1 cápsula al día. Preferiblemente por la mañana, en ayunas.',
    symptoms: ['Personas con dietas vegetarianas o veganas', 'Adultos mayores (con absorción reducida por la edad)', 'Cualquier persona con cansancio persistente o que tome'],
    warning: 'Se recomienda no consumir durante el embarazo, la lactancia ni en niños. Los complementos alimenticios no deben utilizarse como sustituto de una dieta variada y equilibrada y un modo de vida saludable. No superar la dosis diaria expresamente recomendada. Mantener fuera del alcance de los niños. Recomendado solo para adultos.',
    allergens: '', suitable: 'Apto veganos, Sin gluten, Sin lactosa, Sin OGM, Sin alérgenos', registry: '', packaging: '',
  },
  {
    id: 'glucosamina', photo: photo('glucosamina'), video: video('glucosamina', '2:12'), name: 'Glucosamina', format: '120 cápsulas', cn: '',
    ...tarifa('8425402898062', 14.12, 23.9),
    category: 'vitalidad', categoryLabel: 'Vitalidad',
    art: 'bottle', code: 'GL', status: 'Publicado', updated: ACTUALIZADO, updatedBy: 'Kevin S.',
    pitch: 'Sulfato de glucosamina, MSM, condroitina y harpagofito',
    composition: [
      { name: 'Sulfato de glucosamina (de crustáceos)', qty: '1.000 mg', vrn: '—' },
      { name: 'MSM (metilsulfonilmetano)', qty: '800 mg', vrn: '—' },
      { name: 'Vitamina C', qty: '400 mg', vrn: '500 %' },
      { name: 'Sulfato de condroitina', qty: '360 mg', vrn: '—' },
      { name: 'Extracto de harpagofito (4% harpagósidos)', qty: '200 mg', vrn: '—' },
      { name: 'de los cuales harpagósidos', qty: '8 mg', vrn: '—' },
    ],
    dose: '4 cápsulas al día. Repartidas a lo largo del día, con comida.',
    symptoms: ['Personas con desgaste articular por la edad o la actividad', 'Deportistas que someten sus articulaciones a impacto', 'Adultos que quieren cuidar su movilidad'],
    warning: 'Contiene CRUSTÁCEOS. No recomendado en tratamiento anticoagulante o antidiabético sin control médico. Se recomienda no consumir durante el embarazo, la lactancia ni en niños. Los complementos alimenticios no deben utilizarse como sustituto de una dieta variada y equilibrada y un modo de vida saludable. No superar la dosis diaria expresamente recomendada. Mantener fuera del alcance de los niños. Recomendado solo para adultos.',
    allergens: 'Crustáceos', suitable: 'Sin gluten, Sin lactosa, Sin OGM', registry: '', packaging: '',
  },
  {
    id: 'creatina', photo: photo('creatina'), video: video('creatina', '2:23'), name: 'Creatina', format: '90 cápsulas', cn: '',
    ...tarifa('8425402898031', 13.89, 23.5),
    category: 'vitalidad', categoryLabel: 'Vitalidad',
    art: 'bottle', code: 'CR', status: 'Publicado', updated: ACTUALIZADO, updatedBy: 'Kevin S.',
    pitch: 'Creatina monohidrato',
    composition: [
      { name: 'Creatina monohidrato', qty: '3.000 mg', vrn: '—' },
    ],
    dose: '4 cápsulas al día. En cualquier momento del día, con agua abundante.',
    symptoms: ['Deportistas y personas físicamente activas que entrenan', 'Sprints u otros esfuerzos cortos e intensos', 'Buscan mejorar su rendimiento o su capacidad de repetir'],
    warning: 'No utilizar en caso de enfermedad renal preexistente. Si estás bajo supervisión médica o tomas medicamentos, consulta con un profesional sanitario antes de consumirla. Informa a tu médico del consumo de creatina antes de someterte a pruebas de función renal. Se recomienda no consumir durante el embarazo, la lactancia ni en niños. Los complementos alimenticios no deben utilizarse como sustituto de una dieta variada y equilibrada y un modo de vida saludable. No superar la dosis diaria expresamente recomendada. Mantener fuera del alcance de los niños. Recomendado solo para adultos.',
    allergens: '', suitable: 'Apto veganos, Sin gluten, Sin lactosa, Sin OGM, Sin alérgenos', registry: '', packaging: '',
  },
  {
    id: 'biotina', photo: photo('biotina'), video: video('biotina', '1:22'), name: 'Biotina', format: '120 cápsulas', cn: '',
    ...tarifa('8425402898192', 12.35, 20.9),
    category: 'belleza', categoryLabel: 'Belleza',
    art: 'bottle', code: 'BI', status: 'Publicado', updated: ACTUALIZADO, updatedBy: 'Kevin S.',
    pitch: 'Biotina de alta dosis',
    composition: [
      { name: 'Vitamina E', qty: '25 mg', vrn: '208 %' },
      { name: 'Zinc', qty: '4,65 mg', vrn: '46,5 %' },
      { name: 'D-Biotina', qty: '10.000 µg', vrn: '20.000 %' },
      { name: 'Vitamina D3', qty: '50 µg', vrn: '1.000 %' },
      { name: 'Selenio', qty: '55 µg', vrn: '100 %' },
    ],
    dose: '1 cápsula al día. Preferiblemente por la mañana, con comida.',
    symptoms: ['Personas que buscan cuidar la piel', 'El cabello y las uñas', 'Como parte de una rutina diaria de belleza y bienestar'],
    warning: 'La biotina puede interferir con los resultados de determinados análisis clínicos; informa a tu médico o al laboratorio de tu consumo actual o reciente. Se recomienda no consumir durante el embarazo, la lactancia ni en niños. Los complementos alimenticios no deben utilizarse como sustituto de una dieta variada y equilibrada y un modo de vida saludable. No superar la dosis diaria expresamente recomendada. Mantener fuera del alcance de los niños. Recomendado solo para adultos.',
    allergens: '', suitable: 'Apto veganos, Sin gluten, Sin lactosa, Sin OGM, Sin alérgenos', registry: '', packaging: '',
  },
  {
    id: 'hair-forte', photo: photo('hair-forte'), video: video('hair-forte', '2:26'), name: 'Hair forte', format: '90 cápsulas', cn: '',
    ...tarifa('8425402898161', 14.71, 24.9),
    category: 'belleza', categoryLabel: 'Belleza',
    art: 'bottle', code: 'HA', status: 'Publicado', updated: ACTUALIZADO, updatedBy: 'Kevin S.',
    pitch: 'L-cistina, extracto de semilla de calabaza, saw palmetto, vitaminas y minerales',
    composition: [
      { name: 'L-cistina', qty: '350 mg', vrn: '—' },
      { name: 'Vitamina E', qty: '15 mg', vrn: '125 %' },
      { name: 'Extracto de semilla de calabaza', qty: '50 mg', vrn: '—' },
      { name: 'Extracto de saw palmetto (25% ác. grasos)', qty: '50 mg', vrn: '—' },
      { name: 'Bisglicinato de zinc (20% Zn)', qty: '32,5 mg', vrn: '—' },
      { name: 'del cual zinc elemental', qty: '6,5 mg', vrn: '65 %' },
      { name: 'Levadura enriquecida en selenio', qty: '15 mg', vrn: '—' },
      { name: 'del cual selenio elemental', qty: '30 µg', vrn: '54,5 %' },
      { name: 'Niacina (B3)', qty: '8 mg', vrn: '50 %' },
      { name: 'Vitamina B6', qty: '4,2 mg', vrn: '300 %' },
      { name: 'Gluconato de cobre', qty: '3,57 mg', vrn: '—' },
      { name: 'del cual cobre elemental', qty: '0,5 mg', vrn: '50 %' },
      { name: 'Ácido pantoténico (B5)', qty: '3 mg', vrn: '50 %' },
      { name: 'Vitamina D', qty: '5 µg', vrn: '100 %' },
      { name: 'Vitamina B12', qty: '1 µg', vrn: '40 %' },
      { name: 'Vitamina B1', qty: '0,7 mg', vrn: '63,6 %' },
      { name: 'Biotina', qty: '450 µg', vrn: '900 %' },
    ],
    dose: '1 cápsula al día. Preferiblemente por la mañana, con comida.',
    symptoms: ['Personas que buscan reforzar su cabello', 'Especialmente en épocas de mayor demanda como cambios de', 'Estrés o cuando perciben un cabello más débil o frágil'],
    warning: 'La biotina puede interferir con los resultados de determinados análisis clínicos; informa a tu médico o al laboratorio de tu consumo. Se recomienda no consumir durante el embarazo, la lactancia ni en niños. Los complementos alimenticios no deben utilizarse como sustituto de una dieta variada y equilibrada y un modo de vida saludable. No superar la dosis diaria expresamente recomendada. Mantener fuera del alcance de los niños. Recomendado solo para adultos.',
    allergens: '', suitable: 'Apto veganos, Sin gluten, Sin lactosa, Sin OGM, Sin alérgenos', registry: '', packaging: '',
  },
  {
    id: 'ashwagandha', photo: photo('ashwagandha'), video: video('ashwagandha', '3:01'), name: 'Ashwagandha', format: '60 cápsulas', cn: '',
    ...tarifa('', 14.71, 24.9),  // pendiente: la tarifa repite 8425402898130
    category: 'mente', categoryLabel: 'Mente',
    art: 'bottle', code: 'AS', status: 'Publicado', updated: ACTUALIZADO, updatedBy: 'Kevin S.',
    pitch: 'Extracto de ashwagandha KSM-66',
    composition: [
      { name: 'Extracto de ashwagandha (5% withanólidos)', qty: '600 mg', vrn: '—' },
      { name: 'de los cuales withanólidos', qty: '30 mg', vrn: '—' },
    ],
    dose: '1 cápsula al día. Preferiblemente por la mañana o por la noche.',
    symptoms: ['Para adultos que atraviesan periodos de estrés', 'Tensión o elevada exigencia diaria y buscan un complemento'],
    warning: 'Consulta a tu médico antes de tomarlo si padeces una enfermedad autoinmune o tiroidea, o si sigues tratamiento con sedantes o ansiolíticos. Se recomienda no consumir durante el embarazo, la lactancia ni en niños. Los complementos alimenticios no deben utilizarse como sustituto de una dieta variada y equilibrada y un modo de vida saludable. No superar la dosis diaria expresamente recomendada. Mantener fuera del alcance de los niños. Recomendado solo para adultos.',
    allergens: '', suitable: 'Apto veganos, Sin gluten, Sin lactosa, Sin OGM, Sin alérgenos', registry: '', packaging: '',
  },
  {
    id: 'brain-support', photo: photo('brain-support'), video: video('brain-support', '2:20'), name: 'Brain support', format: '60 cápsulas', cn: '',
    ...tarifa('', 13.53, 22.9),  // pendiente: la tarifa repite 8425402898130
    category: 'mente', categoryLabel: 'Mente',
    art: 'bottle', code: 'BR', status: 'Publicado', updated: ACTUALIZADO, updatedBy: 'Kevin S.',
    pitch: 'Bacopa, ginseng y ginkgo con aminoácidos, vitaminas y minerales',
    composition: [
      { name: 'Magnesio', qty: '56,28 mg', vrn: '15 %' },
      { name: 'Extracto de Bacopa monnieri (45% bacósidos)', qty: '225 mg', vrn: '—' },
      { name: 'Extracto de ginseng (10% ginsenósidos)', qty: '150 mg', vrn: '—' },
      { name: 'Extracto de Ginkgo biloba (24/6)', qty: '90 mg', vrn: '—' },
      { name: 'Vitamina C', qty: '80 mg', vrn: '100 %' },
      { name: 'L-cisteína HCl', qty: '80 mg', vrn: '—' },
      { name: 'L-tirosina', qty: '80 mg', vrn: '—' },
      { name: 'L-carnitina tartrato', qty: '74 mg', vrn: '—' },
      { name: 'Bitartrato de colina', qty: '60 mg', vrn: '—' },
      { name: 'Extracto de ashwagandha (5% withanólidos)', qty: '60 mg', vrn: '—' },
      { name: 'Zinc', qty: '10 mg', vrn: '100 %' },
      { name: 'Vitamina B12', qty: '30 µg', vrn: '1.200 %' },
      { name: 'Fosfatidilserina 20%', qty: '25 mg', vrn: '—' },
      { name: 'Coenzima Q10', qty: '20 mg', vrn: '—' },
      { name: 'Niacina (B3)', qty: '16 mg', vrn: '100 %' },
      { name: 'Selenio', qty: '30 µg', vrn: '54,5 %' },
      { name: 'Manganeso', qty: '0,95 mg', vrn: '47,5 %' },
      { name: 'Cobre', qty: '1,01 mg', vrn: '101 %' },
      { name: 'Ácido pantoténico (B5)', qty: '6 mg', vrn: '100 %' },
      { name: 'Vitamina D', qty: '10 µg', vrn: '200 %' },
      { name: 'Vitamina B6', qty: '2,56 mg', vrn: '183 %' },
      { name: 'Vitamina B2', qty: '1,4 mg', vrn: '100 %' },
      { name: 'Vitamina B1', qty: '1,4 mg', vrn: '127 %' },
      { name: 'Ácido fólico', qty: '200 µg', vrn: '100 %' },
    ],
    dose: '2 cápsulas al día. Preferiblemente por la mañana, con comida.',
    symptoms: ['Personas con alta demanda intelectual que buscan mantener', 'Como estudiantes y profesionales'],
    warning: 'Contiene ginkgo: consulta a tu médico si estás en tratamiento con anticoagulantes. Si sigues tratamiento médico (anticoagulante, antiagregante, antidiabético, antihipertensivo, inmunosupresor o tiroideo), consulta a un profesional sanitario antes de tomarlo. Informa de tu consumo antes de cualquier intervención quirúrgica. Se recomienda no consumir durante el embarazo, la lactancia ni en niños. Los complementos alimenticios no deben utilizarse como sustituto de una dieta variada y equilibrada y un modo de vida saludable. No superar la dosis diaria expresamente recomendada. Mantener fuera del alcance de los niños. Recomendado solo para adultos.',
    allergens: '', suitable: 'Apto veganos, Sin gluten, Sin lactosa, Sin OGM, Sin alérgenos', registry: '', packaging: '',
  },
  {
    id: 'colageno-marino', photo: photo('colageno-marino'), name: 'Colágeno marino', format: '60 cápsulas', cn: '',
    ...tarifa('8425402898086', 13.89, 23.5),
    category: 'belleza', categoryLabel: 'Belleza',
    art: 'bottle', code: 'CO', status: 'Publicado', updated: ACTUALIZADO, updatedBy: 'Kevin S.',
    pitch: 'Colágeno marino hidrolizado con vitamina C y ácido hialurónico',
    composition: [
      { name: 'Colágeno marino hidrolizado', qty: '800 mg', vrn: '—' },
      { name: 'Vitamina C', qty: '160 mg', vrn: '200 %' },
      { name: 'Hialuronato sódico', qty: '80 mg', vrn: '—' },
    ],
    dose: '2 cápsulas al día.',
    symptoms: ['Personas que buscan mantener la firmeza', 'Elasticidad e hidratación de la piel'],
    warning: 'Contiene PESCADO. Se recomienda no consumir durante el embarazo, la lactancia ni en niños. Los complementos alimenticios no deben utilizarse como sustituto de una dieta variada y equilibrada y un modo de vida saludable. No superar la dosis diaria expresamente recomendada. Mantener fuera del alcance de los niños. Recomendado solo para adultos.',
    allergens: 'Pescado', suitable: 'Sin gluten, Sin lactosa, Sin OGM', registry: '', packaging: '',
  },
]

export const productById = (id?: string) => products.find((p) => p.id === id)

export const catalogFilters = [
  { key: 'all', label: 'Todo el catálogo' },
  { key: 'new', label: 'Novedades' },
  { key: 'best', label: 'Más vendidos' },
  { key: 'course', label: 'Con vídeo de formación' },
] as const

export function filterProducts(key: string) {
  const pub = products.filter((p) => p.status === 'Publicado')
  switch (key) {
    case 'new': return pub.filter((p) => p.isNew)
    case 'best': return pub.filter((p) => p.bestSeller)
    case 'course': return pub.filter((p) => p.video)
    default: return pub
  }
}

/**
 * Filtros con su recuento real. Los que no tienen ningún producto detrás no se enseñan:
 * así nunca se ofrece un filtro que lleva a una lista vacía (y vuelven solos en cuanto
 * haya productos con esa etiqueta).
 */
export function catalogFiltersWithCounts() {
  return catalogFilters
    .map((f) => ({ key: f.key as string, label: f.label as string, count: filterProducts(f.key).length }))
    .filter((f) => f.key === 'all' || f.count > 0)
}

export const euro = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'

/** Categorías del catálogo (gamas reales de Shopify). Se pueden crear nuevas desde el desplegable. */
export const categories = ['Básicos', 'Inmunidad', 'Vitalidad', 'Belleza', 'Mente']
export function addCategory(name: string) {
  if (!categories.includes(name)) categories.push(name)
}
