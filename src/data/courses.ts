export interface Lesson {
  n: number
  title: string
  meta: string
  minutes: number
  type: 'video' | 'text' | 'test'
  state: 'done' | 'current' | 'todo' | 'locked'
  summary?: string
  files?: { kind: 'PDF' | 'A5' | 'MP3' | 'URL'; name: string; meta: string }[]
}

export interface Course {
  id: string
  title: string
  itinerary: string
  teacher: string
  lessons: Lesson[]
  minutes: number
  cover: string
  progress: number // 0-100
  state: 'progress' | 'done' | 'todo' | 'new'
  stateLabel: string
  description: string
  materials: { kind: 'PDF' | 'A5' | 'URL'; name: string; meta: string }[]
  enrolled: number
  finish: string
  published: boolean
  certificate: boolean
  updated: string
}

const img = (n: string) => `${import.meta.env.BASE_URL}img/cursos/${n}.jpg`

export const courses: Course[] = [
  {
    id: 'magnesio', title: 'Cómo recomendar magnesio en el mostrador', itinerary: 'Vitaminas y minerales', teacher: 'Álvaro Ferrer', minutes: 48, cover: img('magnesio'),
    progress: 40, state: 'progress', stateLabel: '40 % completado', enrolled: 5, finish: '48 min', published: true, certificate: true, updated: 'actualizado el 3 sep',
    description: 'Qué forma de magnesio elegir según lo que cuenta el cliente, cómo explicar la dosis y qué decir cuando ya toma otra medicación.',
    lessons: [
      { n: 1, title: 'Para qué sirve de verdad el magnesio', meta: 'Vídeo · lo que dice la evidencia y lo que no', minutes: 8, type: 'video', state: 'done' },
      { n: 2, title: 'Citrato, bisglicinato y óxido: cuál y cuándo', meta: 'Vídeo · tabla comparativa descargable', minutes: 11, type: 'video', state: 'done' },
      {
        n: 3, title: 'La conversación en el mostrador', meta: 'Vídeo · 3 casos reales grabados en farmacia', minutes: 14, type: 'video', state: 'current',
        summary: 'Tres casos grabados en farmacia real: la clienta que no duerme, el cliente con calambres y quien viene pidiendo magnesio por TikTok.',
        files: [
          { kind: 'PDF', name: 'Guion de los 3 casos', meta: 'PDF · 310 KB' },
          { kind: 'A5', name: 'Frases que sí funcionan', meta: 'Imprimible A5 · 140 KB' },
          { kind: 'MP3', name: 'Audio de la clase', meta: 'MP3 · 13 min · 9,2 MB' },
        ],
      },
      { n: 4, title: 'Interacciones y cuándo no recomendarlo', meta: 'Vídeo · ficha de interacciones en PDF', minutes: 9, type: 'video', state: 'todo' },
      { n: 5, title: 'Test final', meta: '10 preguntas · necesitas un 70 % para el certificado', minutes: 6, type: 'test', state: 'locked' },
    ],
    materials: [
      { kind: 'PDF', name: 'Tabla comparativa de sales', meta: 'PDF · 420 KB' },
      { kind: 'PDF', name: 'Ficha de interacciones', meta: 'PDF · 260 KB' },
      { kind: 'A5', name: 'Guía rápida para el mostrador', meta: 'Imprimible A5 · 180 KB' },
      { kind: 'URL', name: 'Estudio de referencia (2024)', meta: 'Enlace externo · PubMed' },
    ],
  },
  {
    id: 'insomnio', title: 'Insomnio de conciliación y de mantenimiento', itinerary: 'Descanso y ánimo', teacher: 'Dra. Elena Sanz', minutes: 26, cover: img('insomnio'),
    progress: 100, state: 'done', stateLabel: 'Completado en julio', enrolled: 3, finish: '26 min', published: true, certificate: true, updated: 'actualizado el 12 ago',
    description: 'Distinguir en treinta segundos si el cliente tarda en dormirse o se despierta, y qué recomendar en cada caso sin pisar al médico.',
    lessons: [
      { n: 1, title: 'Dos insomnios distintos', meta: 'Vídeo · cómo preguntarlo en el mostrador', minutes: 9, type: 'video', state: 'done' },
      { n: 2, title: 'Melatonina: dosis, forma y timing', meta: 'Vídeo · 1,9 mg y por qué retard', minutes: 10, type: 'video', state: 'done' },
      { n: 3, title: 'Cuándo derivar', meta: 'Texto · señales de alarma', minutes: 7, type: 'text', state: 'done' },
    ],
    materials: [
      { kind: 'A5', name: 'Las 4 preguntas del sueño', meta: 'Imprimible A5 · 120 KB' },
      { kind: 'PDF', name: 'Ficha técnica Melatonina retard', meta: 'PDF · 340 KB' },
    ],
  },
  {
    id: 'microbiota', title: 'Microbiota: cuándo un probiótico sí y cuándo no', itinerary: 'Digestivo', teacher: 'Dra. Elena Sanz', minutes: 35, cover: img('microbiota'),
    progress: 0, state: 'todo', stateLabel: 'Sin empezar', enrolled: 4, finish: '35 min', published: true, certificate: true, updated: 'nuevo este mes',
    description: 'Qué cepas importan, cuánto dura una pauta y cómo no venderlo para todo.',
    lessons: [
      { n: 1, title: 'Qué es una cepa y por qué importa', meta: 'Vídeo', minutes: 9, type: 'video', state: 'todo' },
      { n: 2, title: 'Tras antibiótico: la pauta que funciona', meta: 'Vídeo', minutes: 8, type: 'video', state: 'todo' },
      { n: 3, title: 'Hinchazón y tránsito', meta: 'Vídeo', minutes: 10, type: 'video', state: 'todo' },
      { n: 4, title: 'Lo que no cura un probiótico', meta: 'Texto', minutes: 8, type: 'text', state: 'todo' },
    ],
    materials: [{ kind: 'PDF', name: 'Cepas y evidencia', meta: 'PDF · 510 KB' }],
  },
  {
    id: 'deporte', title: 'Qué pide el cliente deportista y qué necesita', itinerary: 'Deporte', teacher: 'Javier Ortí', minutes: 18, cover: img('deporte'),
    progress: 100, state: 'done', stateLabel: 'Completado en mayo', enrolled: 2, finish: '18 min', published: true, certificate: true, updated: 'actualizado en mayo',
    description: 'Proteína, creatina, magnesio y electrolitos: qué tiene sentido en una farmacia y qué no.',
    lessons: [
      { n: 1, title: 'Lo que pide vs. lo que necesita', meta: 'Vídeo', minutes: 10, type: 'video', state: 'done' },
      { n: 2, title: 'Recuperación y sueño', meta: 'Vídeo', minutes: 8, type: 'video', state: 'done' },
    ],
    materials: [{ kind: 'A5', name: 'Chuleta deportista', meta: 'Imprimible A5 · 90 KB' }],
  },
  {
    id: 'colageno', title: 'Colágeno: separar la evidencia del marketing', itinerary: 'Belleza y piel', teacher: 'Dra. Elena Sanz', minutes: 22, cover: img('colageno'),
    progress: 0, state: 'todo', stateLabel: 'Sin empezar', enrolled: 3, finish: '22 min', published: true, certificate: true, updated: 'nuevo este mes',
    description: 'Tipos de colágeno, dosis con evidencia y qué contestar cuando preguntan si «se nota».',
    lessons: [
      { n: 1, title: 'Tipos y péptidos', meta: 'Vídeo', minutes: 8, type: 'video', state: 'todo' },
      { n: 2, title: 'Qué dice la evidencia', meta: 'Vídeo', minutes: 8, type: 'video', state: 'todo' },
      { n: 3, title: 'Cómo explicarlo sin prometer', meta: 'Texto', minutes: 6, type: 'text', state: 'todo' },
    ],
    materials: [{ kind: 'PDF', name: 'Resumen de estudios', meta: 'PDF · 280 KB' }],
  },
  {
    id: 'hierro', title: 'Hierro: cuándo sí y con qué no mezclarlo', itinerary: 'Vitaminas y minerales', teacher: 'Dra. Elena Sanz', minutes: 16, cover: img('magnesio'),
    progress: 0, state: 'todo', stateLabel: 'Sin empezar', enrolled: 2, finish: '16 min', published: true, certificate: true, updated: 'actualizado',
    description: 'Quién tiene ferropenia de verdad, por qué el bisglicinato no estriñe como el sulfato y con qué no se puede tomar en la misma toma.',
    lessons: [
      { n: 1, title: 'Cansancio no siempre es anemia', meta: 'Vídeo · cuándo tiene sentido ofrecerlo', minutes: 9, type: 'video', state: 'todo' },
      { n: 2, title: 'Café, té y lácteos: por qué separarlo', meta: 'Vídeo', minutes: 7, type: 'video', state: 'todo' },
    ],
    materials: [{ kind: 'A5', name: 'Chuleta de hierro y absorción', meta: 'Imprimible A5 · 100 KB' }],
  },
  {
    id: 'mostrador', title: 'Preguntas incómodas y cuándo derivar al médico', itinerary: 'Mostrador', teacher: 'Dra. Elena Sanz', minutes: 20, cover: img('mostrador'),
    progress: 0, state: 'new', stateLabel: 'Nuevo este mes', enrolled: 3, finish: '20 min', published: true, certificate: false, updated: 'nuevo este mes',
    description: 'Las frases que sacan al farmacéutico del apuro y las señales que obligan a derivar.',
    lessons: [
      { n: 1, title: 'Señales de alarma', meta: 'Vídeo', minutes: 8, type: 'video', state: 'todo' },
      { n: 2, title: 'Cómo derivar sin perder al cliente', meta: 'Vídeo', minutes: 7, type: 'video', state: 'todo' },
      { n: 3, title: 'Casos reales', meta: 'Texto', minutes: 5, type: 'text', state: 'todo' },
    ],
    materials: [{ kind: 'A5', name: 'Frases para derivar', meta: 'Imprimible A5 · 110 KB' }],
  },
]

export const courseById = (id?: string) => courses.find((c) => c.id === id)

export const courseFilters = [
  { key: 'all', label: 'Todos' },
  { key: 'progress', label: 'En curso' },
  { key: 'todo', label: 'Sin empezar' },
  { key: 'done', label: 'Completados' },
  { key: 'short', label: 'Menos de 20 min' },
]

export function filterCourses(key: string) {
  switch (key) {
    case 'progress': return courses.filter((c) => c.state === 'progress')
    case 'todo': return courses.filter((c) => c.state === 'todo' || c.state === 'new')
    case 'done': return courses.filter((c) => c.state === 'done')
    case 'short': return courses.filter((c) => c.minutes < 20)
    default: return courses
  }
}

/** Cursos tal como los ve el superadmin (con borradores) */
export const adminCourses = [
  { id: 'magnesio', code: 'MG', title: 'Cómo recomendar magnesio en el mostrador', meta: 'Álvaro Ferrer · actualizado el 3 sep', itinerary: 'Vitaminas', lessons: 5, minutes: 48, state: 'Publicado', completions: 412 },
  { id: 'insomnio', code: 'IN', title: 'Insomnio de conciliación y mantenimiento', meta: 'Dra. Elena Sanz · actualizado el 12 ago', itinerary: 'Descanso', lessons: 3, minutes: 26, state: 'Publicado', completions: 387 },
  { id: 'microbiota', code: 'MI', title: 'Microbiota: cuándo un probiótico sí y cuándo no', meta: 'Dra. Elena Sanz · nuevo este mes', itinerary: 'Digestivo', lessons: 4, minutes: 35, state: 'Publicado', completions: 96 },
  { id: 'deporte', code: 'DE', title: 'Qué pide el cliente deportista y qué necesita', meta: 'Javier Ortí · actualizado en mayo', itinerary: 'Deporte', lessons: 2, minutes: 18, state: 'Publicado', completions: 268 },
  { id: 'colageno', code: 'CO', title: 'Colágeno: separar la evidencia del marketing', meta: 'Dra. Elena Sanz · nuevo este mes', itinerary: 'Belleza', lessons: 3, minutes: 22, state: 'Publicado', completions: 74 },
  { id: 'mostrador', code: 'MO', title: 'Preguntas incómodas y cuándo derivar', meta: 'Dra. Elena Sanz · nuevo este mes', itinerary: 'Mostrador', lessons: 3, minutes: 20, state: 'Publicado', completions: 51 },
  { id: 'hierro', code: 'HI', title: 'Hierro: cuándo sí y con qué no mezclarlo', meta: 'Dra. Elena Sanz', itinerary: 'Minerales', lessons: 2, minutes: 16, state: 'Publicado', completions: 142 },
  { id: 'adaptogenos', code: 'AS', title: 'Adaptógenos: ashwagandha y rodiola', meta: 'Sin asignar · empezado hace 3 d', itinerary: 'Descanso', lessons: 1, minutes: 0, state: 'Borrador', completions: 0 },
  { id: 'vitamina-d', code: 'VI', title: 'Vitamina D: la pregunta de cada invierno', meta: 'Sin asignar · sin lecciones', itinerary: 'Vitaminas', lessons: 0, minutes: 0, state: 'Borrador', completions: 0 },
]
