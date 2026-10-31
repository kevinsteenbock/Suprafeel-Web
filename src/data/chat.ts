export interface Symptom {
  id: string
  name: string
  category: string
  expressions: { text: string; count: number }[]
  pending: { text: string; meta: string; danger?: boolean }[]
  /** Consultas y acierto: null mientras Xano no registre las consultas reales (no se inventan) */
  consultations: number | null
  rules: number
  accuracy: number | null
  state: 'Entrenado' | 'Flojo' | 'Sin regla'
  detected?: boolean
}

export const symptoms: Symptom[] = [
  { id: 'insomnio', name: 'Insomnio', category: 'Descanso', consultations: null, rules: 3, accuracy: null, state: 'Entrenado',
    expressions: [{ text: 'no duermo', count: 127 }, { text: 'me despierto a las 3 y ya no vuelvo a dormirme', count: 81 }, { text: 'me cuesta coger el sueño', count: 64 }, { text: 'duermo fatal desde que cambié de turno', count: 43 }, { text: 'insomnio', count: 39 }, { text: 'me desvelo a media noche', count: 22 }, { text: 'no descanso', count: 18 }, { text: 'sueño ligero', count: 11 }, { text: 'no pego ojo', count: 9 }, { text: 'me levanto cansada', count: 7 }, { text: 'duermo a ratos', count: 5 }],
    pending: [{ text: 'me paso la noche dando vueltas', meta: 'escrito 12 veces · 9 farmacias' }, { text: 'me desvelo', meta: 'escrito 8 veces · 6 farmacias' }, { text: 'tomo lorazepam y quiero dejarlo', meta: '7 veces · ojo, esto pide derivar al médico', danger: true }] },
  { id: 'cansancio', name: 'Cansancio', category: 'Energía', consultations: null, rules: 4, accuracy: null, state: 'Entrenado', expressions: [{ text: 'estoy sin fuerzas', count: 96 }, { text: 'me arrastro', count: 71 }, { text: 'fatiga', count: 60 }], pending: [{ text: 'no llego al final del día', meta: 'escrito 9 veces' }] },
  { id: 'digestion', name: 'Digestión pesada', category: 'Digestivo', consultations: null, rules: 2, accuracy: null, state: 'Flojo', expressions: [{ text: 'me sienta mal la comida', count: 88 }, { text: 'hinchazón', count: 64 }], pending: [{ text: 'me hincho como un globo', meta: 'escrito 14 veces' }] },
  { id: 'pelo', name: 'Caída del pelo', category: 'Belleza', consultations: null, rules: 2, accuracy: null, state: 'Entrenado', expressions: [{ text: 'se me cae a puñados', count: 90 }, { text: 'alopecia', count: 41 }], pending: [] },
  { id: 'articular', name: 'Dolor articular', category: 'Movilidad', consultations: null, rules: 3, accuracy: null, state: 'Entrenado', expressions: [{ text: 'me crujen las rodillas', count: 60 }, { text: 'artrosis', count: 52 }], pending: [] },
  { id: 'estres', name: 'Estrés y nervios', category: 'Descanso', consultations: null, rules: 2, accuracy: null, state: 'Flojo', expressions: [{ text: 'voy acelerada', count: 58 }, { text: 'ansiedad', count: 50 }], pending: [{ text: 'tengo un nudo en el estómago', meta: 'escrito 6 veces' }] },
  { id: 'defensas', name: 'Defensas bajas', category: 'Inmunidad', consultations: null, rules: 2, accuracy: null, state: 'Entrenado', expressions: [{ text: 'me cojo todo', count: 71 }, { text: 'catarros seguidos', count: 39 }], pending: [] },
  { id: 'sofocos', name: 'Sofocos de menopausia', category: 'Mujer', consultations: null, rules: 1, accuracy: null, state: 'Flojo', expressions: [{ text: 'calores de repente', count: 44 }, { text: 'sudores de noche', count: 31 }], pending: [] },
  { id: 'niebla', name: 'Niebla mental', category: 'Detectado solo · aún sin clasificar', consultations: null, rules: 0, accuracy: null, state: 'Sin regla', detected: true, expressions: [{ text: 'no me concentro', count: 29 }, { text: 'voy espesa', count: 18 }], pending: [] },
]

export interface Rule {
  id: string
  name: string
  conditions: string
  derive?: boolean
  products: { code: string; tone: 'sand' | 'ok' | 'violet' | 'accent'; name: string; dose: string; why: string; tag: string }[]
  extra?: number
  used: number | null
  useful: number | null
  state: 'Activa' | 'Borrador'
  warn?: string
  notice: string
}

export const rules: Rule[] = [
  { id: 'insomnio-adulto', name: 'Insomnio · adulto sin medicación para dormir', conditions: 'Insomnio + no toma hipnóticos + 18 a 70 años', used: null, useful: null, state: 'Activa', extra: 1,
    products: [
      { code: 'MEL', tone: 'sand', name: 'Melatonina 1,9 mg retard', dose: '1 comprimido 30 min antes de acostarse', why: 'Acorta el tiempo que se tarda en dormirse y no genera dependencia. La forma retard aguanta la noche entera.', tag: '1ª OPCIÓN' },
      { code: 'VAL', tone: 'ok', name: 'Valeriana + pasiflora Noche', dose: '2 cápsulas una hora antes', why: 'Para quien no quiere melatonina. Tarda dos semanas en notarse, hay que decírselo.', tag: 'SI PREFIERE PLANTA' },
      { code: 'MG', tone: 'violet', name: 'Magnesio bisglicinato 300 mg', dose: '1 cápsula por la noche · se puede juntar con la 1ª', why: 'Relaja el músculo y baja los despertares de madrugada. El bisglicinato no suelta el vientre.', tag: 'ACOMPAÑA' },
    ],
    notice: 'Si lleva más de un mes sin dormir, que lo hable con su médico.' },
  { id: 'insomnio-hipnoticos', name: 'Insomnio · ya toma lorazepam o zolpidem', conditions: 'No recomienda nada · manda hablar con el médico', derive: true, products: [], used: null, useful: null, state: 'Activa', notice: 'Deriva al médico.' },
  { id: 'cansancio-mujer', name: 'Cansancio · mujer con reglas abundantes', conditions: 'Cansancio + mujer + menciona regla o anemia', used: null, useful: null, state: 'Activa', products: [{ code: 'FE', tone: 'accent', name: 'Hierro liposomado', dose: '1 cápsula en ayunas', why: 'Hierro quelado que no estriñe.', tag: '1ª OPCIÓN' }, { code: 'B12', tone: 'violet', name: 'Vitamina B12', dose: '1 por la mañana', why: 'Cubre el folato y la B12.', tag: 'ACOMPAÑA' }], notice: 'Si el cansancio dura más de un mes, analítica.' },
  { id: 'cansancio', name: 'Cansancio · sin más datos', conditions: 'Cansancio y nada más · es la red de seguridad', used: null, useful: null, state: 'Activa', products: [{ code: 'MUL', tone: 'sand', name: 'Multivitamínico', dose: '1 al día', why: 'Cubre carencias generales.', tag: '1ª OPCIÓN' }, { code: 'Q10', tone: 'ok', name: 'Coenzima Q10', dose: '1 con la comida', why: 'Energía celular.', tag: 'ACOMPAÑA' }], notice: 'Preguntar por sueño y alimentación antes de recomendar.' },
  { id: 'digestion', name: 'Digestión pesada · después de comer', conditions: 'Digestión pesada + hinchazón o gases', used: null, useful: null, state: 'Activa', products: [{ code: 'ENZ', tone: 'ok', name: 'Enzimas digestivas', dose: '1 antes de las comidas', why: 'Ayuda a digerir.', tag: '1ª OPCIÓN' }, { code: 'ALC', tone: 'sand', name: 'Alcachofa', dose: '1 antes de comer', why: 'Estimula la bilis.', tag: 'ACOMPAÑA' }], notice: 'Si hay pérdida de peso o sangre, derivar.' },
  { id: 'pelo', name: 'Caída del pelo · otoño y primavera', conditions: 'Caída del pelo + de septiembre a noviembre', used: null, useful: null, state: 'Activa', products: [{ code: 'BIO', tone: 'accent', name: 'Biotina', dose: '1 al día', why: 'Fortalece el pelo.', tag: '1ª OPCIÓN' }, { code: 'ZN', tone: 'violet', name: 'Zinc', dose: '1 al día', why: 'Cofactor del folículo.', tag: 'ACOMPAÑA' }, { code: 'COL', tone: 'sand', name: 'Colágeno', dose: '1 cacito', why: 'Aporta aminoácidos.', tag: 'ACOMPAÑA' }], notice: 'Tres meses de pauta mínimo.' },
  { id: 'articular', name: 'Dolor articular · más de 55 años', conditions: 'Dolor articular + edad 55+ · no sustituye al médico', used: null, useful: null, state: 'Activa', products: [{ code: 'COL', tone: 'sand', name: 'Colágeno', dose: '1 cacito', why: 'Cartílago.', tag: '1ª OPCIÓN' }, { code: 'MG', tone: 'violet', name: 'Magnesio', dose: '1 por la noche', why: 'Músculo.', tag: 'ACOMPAÑA' }, { code: 'CUR', tone: 'accent', name: 'Cúrcuma', dose: '1 con comida', why: 'Antiinflamatoria.', tag: 'ACOMPAÑA' }], notice: 'Con anticoagulantes, cuidado con la cúrcuma.' },
  { id: 'sofocos', name: 'Sofocos de menopausia', conditions: 'Falta el «por qué» y la fuente · no se puede publicar', used: null, useful: null, state: 'Borrador', warn: 'Falta el «por qué»', products: [{ code: 'ISO', tone: 'ok', name: 'Isoflavonas de soja', dose: '', why: '', tag: '1ª OPCIÓN' }], notice: '' },
]

export const unanswered = [
  { id: 'niebla', text: '«algo para la niebla mental de la quimio»', meta: 'y 63 consultas más parecidas este mes', pharmacy: 'Farmacia Montoro', when: 'hace 2 h', what: 'No entendí el síntoma', tone: 'danger' as const, action: 'Enseñarle', hot: true },
  { id: 'nino', text: '«mi hijo de 7 años no come nada»', meta: 'y 28 consultas más parecidas', pharmacy: 'Farmacia Salas', when: 'hace 5 h', what: 'No hay regla para niños', tone: 'warn' as const, action: 'Enseñarle' },
  { id: 'manos', text: '«se me duermen las manos por la noche»', meta: 'contestamos magnesio y nos pusieron pulgar abajo', pharmacy: 'Farmacia del Carmen', when: 'ayer', what: 'Contestó mal', tone: 'danger' as const, action: 'Corregir' },
  { id: 'embarazo', text: '«para el cansancio del embarazo»', meta: 'el aviso de embarazo lo bloqueó todo y no quedó nada', pharmacy: 'Farmacia Rosales', when: 'ayer', what: 'Se quedó sin opciones', tone: 'warn' as const, action: 'Enseñarle' },
  { id: 'diabetico', text: '«qué le doy a un diabético para el colesterol»', meta: 'la regla existe pero el producto no está en el catálogo', pharmacy: 'Farmacia Luján', when: 'hace 2 d', what: 'Falta el producto', tone: 'warn' as const, action: 'Al catálogo' },
  { id: 'rodillas', text: '«colágeno o magnesio para las rodillas»', meta: 'dos reglas empataron y salió una respuesta rara', pharmacy: 'Farmacia Pardo', when: 'hace 2 d', what: 'Dos reglas empatadas', tone: 'warn' as const, action: 'Desempatar' },
  { id: 'opositores', text: '«vitaminas para opositores»', meta: 'y 19 consultas más parecidas', pharmacy: 'Farmacia Aribau', when: 'hace 3 d', what: 'No entendí el síntoma', tone: 'danger' as const, action: 'Enseñarle' },
  { id: 'resaca', text: '«algo para la resaca»', meta: 'no tenemos nada y quizá tampoco toca', pharmacy: 'Farmacia Nou', when: 'hace 4 d', what: 'Fuera de lo nuestro', tone: 'neutral' as const, action: 'Descartar' },
]

/* Fechas de muestra contadas desde hoy: ninguna fecha escrita a mano */
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
/** «3 sep» de hace n días (con el año si no es el de hoy) */
const hace = (n: number) => {
  const d = new Date(Date.now() - n * 864e5)
  return `${d.getDate()} ${MESES[d.getMonth()]}${d.getFullYear() !== new Date().getFullYear() ? ` ${d.getFullYear()}` : ''}`
}

export const sources = [
  { kind: 'PDF' as const, name: 'Ficha técnica Melatonina retard', meta: 'Suprafeel Labs · 2025 · 12 págs', used: 3, updated: hace(58) },
  { kind: 'DOC' as const, name: 'Interacciones con anticoagulantes', meta: 'Guía interna · revisada por Dra. Sanz', used: 9, updated: hace(80) },
  { kind: 'PDF' as const, name: 'Magnesio: formas y biodisponibilidad', meta: 'Revisión 2024 · 28 págs', used: 4, updated: hace(58) },
  { kind: 'URL' as const, name: 'AEMPS · vitamina D en adultos', meta: 'Enlace externo · consultado ayer', used: 2, updated: 'ayer' },
  { kind: 'PDF' as const, name: 'Probióticos: cepas con evidencia', meta: 'Dra. Elena Sanz · 2025', used: 2, updated: hace(64) },
  { kind: 'DOC' as const, name: 'Qué no se puede prometer (normativa)', meta: 'Legal · declaraciones autorizadas', used: 24, updated: hace(109) },
]
