export interface Pharmacy {
  id: string
  code: string
  name: string
  city: string
  owner: string
  address: string
  lastVisit: string
  consultations: number
  training: number
  status: 'Activa' | 'En riesgo' | 'Alta reciente'
  nextVisit: string
  nextToday?: boolean
  since: string
  team: { initials: string; name: string; role: string; pct: number }[]
  activity: { title: string; meta: string; date: string; tone?: 'accent' | 'ok' | 'neutral' }[]
  notes: string
  notesMeta: string
  visitsYear: number
}

export const pharmacies: Pharmacy[] = [
  { id: 'central', code: 'FC', name: 'Farmacia Central', city: 'Valencia', owner: 'Laura Vidal', address: 'C/ Colón 18, bajo · 46004 Valencia', lastVisit: '9 sep', consultations: 18, training: 72, status: 'Activa', nextVisit: 'Hoy · 11:00', nextToday: true, since: 'marzo de 2023', visitsYear: 9,
    team: [{ initials: 'LV', name: 'Laura Vidal', role: 'Titular · decide el surtido del lineal', pct: 53 }, { initials: 'MS', name: 'Marta Soler', role: 'Adjunta · la más formada del equipo', pct: 100 }, { initials: 'JR', name: 'Jorge Ramos', role: 'Auxiliar · alta en julio', pct: 65 }],
    activity: [
      { title: 'Añaden Magnesio Complex al lineal', meta: 'Lo dejan como referencia fija en la zona de dermo', date: '9 sep', tone: 'accent' },
      { title: 'Marta Soler termina el itinerario de Descanso', meta: 'Certificado emitido · 17 de 17 módulos', date: '4 sep', tone: 'ok' },
      { title: 'Solicitan material PLV de la campaña de otoño', meta: 'Expositor de mostrador, cartel y folletos', date: '2 sep' },
      { title: 'Caso guardado en el consejo por síntomas', meta: 'Insomnio de mantenimiento · terminó en melatonina', date: '28 ago' },
      { title: 'Visita registrada', meta: 'Revisión de lineal y presentación de novedades de otoño', date: '22 jul' },
      { title: 'Alta de Jorge Ramos como auxiliar', meta: 'Tercer acceso de los 5 incluidos', date: '14 jul' },
    ],
    notes: 'Laura quiere mover el lineal de descanso a la zona de caja. Le interesa el colágeno pero no lo tiene claro: llevar muestras y la tabla comparativa. Jorge aún no ha tocado la formación, presentársela en persona.',
    notesMeta: 'Escrita el 22 de julio tras la última visita' },
  { id: 'blasco', code: 'BI', name: 'Farmacia Blasco Ibáñez', city: 'Valencia', owner: 'Rosa Ten', address: 'Av. Blasco Ibáñez 42 · 46021 Valencia', lastVisit: '2 sep', consultations: 12, training: 100, status: 'Activa', nextVisit: 'Hoy · 09:30', nextToday: true, since: 'enero de 2023', visitsYear: 8,
    team: [{ initials: 'RT', name: 'Rosa Ten', role: 'Titular', pct: 100 }, { initials: 'PG', name: 'Pere Gil', role: 'Adjunto', pct: 100 }], activity: [{ title: 'Visita registrada', meta: 'Revisión de lineal', date: '2 sep' }], notes: 'Equipo formado al 100 %. Pedir opinión sobre el nuevo colágeno.', notesMeta: 'Escrita el 2 de septiembre' },
  { id: 'alboraya', code: 'AM', name: 'Farmacia Alboraya Mar', city: 'Alboraya', owner: 'Vicent Gil', address: 'Passeig Aragó 3 · 46120 Alboraya', lastVisit: '28 ago', consultations: 7, training: 45, status: 'Activa', nextVisit: 'Jue 18 · 12:00', since: 'septiembre de 2024', visitsYear: 5,
    team: [{ initials: 'VG', name: 'Vicent Gil', role: 'Titular', pct: 60 }, { initials: 'AN', name: 'Anna Nadal', role: 'Auxiliar', pct: 30 }], activity: [{ title: 'Visita registrada', meta: 'Novedades', date: '28 ago' }], notes: '', notesMeta: '' },
  { id: 'ruzafa', code: 'RS', name: 'Farmacia Ruzafa Salud', city: 'Valencia', owner: 'Inés Prats', address: 'C/ Sueca 7 · 46006 Valencia', lastVisit: '21 ago', consultations: 4, training: 20, status: 'Activa', nextVisit: 'Hoy · 12:30', nextToday: true, since: 'febrero de 2025', visitsYear: 4,
    team: [{ initials: 'IP', name: 'Inés Prats', role: 'Titular', pct: 20 }], activity: [{ title: 'Visita registrada', meta: 'Presentación de la app', date: '21 ago' }], notes: 'Formación al 20 %: proponer sentarse 15 min con la app.', notesMeta: 'Escrita el 21 de agosto' },
  { id: 'carmen', code: 'EC', name: 'Farmacia El Carmen', city: 'Valencia', owner: 'Pau Server', address: 'Plaza del Carmen 3 · 46003 Valencia', lastVisit: '9 jul', consultations: 0, training: 0, status: 'En riesgo', nextVisit: 'Hoy · 16:00', nextToday: true, since: 'junio de 2022', visitsYear: 3,
    team: [{ initials: 'PS', name: 'Pau Server', role: 'Titular', pct: 0 }], activity: [{ title: 'Sin actividad en 64 días', meta: 'Ninguna consulta ni formación', date: 'hoy' }], notes: '64 días sin visita y formación sin empezar. Llamar antes de ir.', notesMeta: 'Escrita hoy' },
  { id: 'port-sapla', code: 'PS', name: 'Farmacia Port Saplà', city: 'Valencia', owner: 'Nuria Esteve', address: 'C/ Port Saplà 12 · 46011 Valencia', lastVisit: '2 jul', consultations: 0, training: 0, status: 'En riesgo', nextVisit: 'Sin planificar', since: 'septiembre de 2025', visitsYear: 2,
    team: [{ initials: 'NE', name: 'Nuria Esteve', role: 'Titular', pct: 0 }], activity: [], notes: '', notesMeta: '' },
  { id: 'benimaclet', code: 'BM', name: 'Farmacia Benimaclet', city: 'Valencia', owner: 'Clara Ibáñez', address: 'C/ Barón de San Petrillo 22 · 46020 Valencia', lastVisit: '5 sep', consultations: 2, training: 12, status: 'Alta reciente', nextVisit: 'Hoy · 17:30', nextToday: true, since: 'julio de 2025', visitsYear: 2,
    team: [{ initials: 'CI', name: 'Clara Ibáñez', role: 'Titular', pct: 12 }], activity: [{ title: 'Alta de la cuenta', meta: 'Plan Básico · 4 accesos', date: '5 sep', tone: 'ok' }], notes: 'Alta reciente. Llevar el expositor de otoño.', notesMeta: 'Escrita el 5 de septiembre' },
  { id: 'gran-via', code: 'GM', name: 'Farmacia Gran Vía Marqués', city: 'Valencia', owner: 'Sergio Bonet', address: 'Gran Vía Marqués del Turia 44 · 46005 Valencia', lastVisit: '1 sep', consultations: 14, training: 88, status: 'Activa', nextVisit: 'Mar 23 · 10:00', since: 'noviembre de 2021', visitsYear: 7,
    team: [{ initials: 'SB', name: 'Sergio Bonet', role: 'Titular', pct: 90 }, { initials: 'MR', name: 'Marta Roig', role: 'Adjunta', pct: 86 }], activity: [{ title: 'Visita registrada', meta: 'Novedades de otoño', date: '1 sep' }], notes: '', notesMeta: '' },
  { id: 'torrent', code: 'TG', name: 'Farmacia Torrent Guía', city: 'Torrent', owner: 'Amparo Llin', address: 'Av. al Vedat 88 · 46900 Torrent', lastVisit: '26 ago', consultations: 6, training: 35, status: 'Activa', nextVisit: 'Vie 26 · 11:30', since: 'abril de 2024', visitsYear: 5,
    team: [{ initials: 'AL', name: 'Amparo Llin', role: 'Titular', pct: 35 }], activity: [{ title: 'Visita registrada', meta: 'Revisión de lineal', date: '26 ago' }], notes: '', notesMeta: '' },
]

export const pharmacyById = (id?: string) => pharmacies.find((p) => p.id === id)

export const pharmacyFilters = [
  { key: 'all', label: 'Todas', count: 34 },
  { key: 'risk', label: 'En riesgo', count: 2 },
  { key: 'unvisited', label: 'Sin visitar', count: 5 },
  { key: 'new', label: 'Alta reciente', count: 3 },
  { key: 'untrained', label: 'Sin formación', count: 8 },
]
export function filterPharmacies(key: string) {
  switch (key) {
    case 'risk': return pharmacies.filter((p) => p.status === 'En riesgo')
    case 'unvisited': return pharmacies.filter((p) => ['9 jul', '2 jul', '21 aug', '21 ago', '26 ago'].includes(p.lastVisit))
    case 'new': return pharmacies.filter((p) => p.status === 'Alta reciente' || p.since.includes('2025'))
    case 'untrained': return pharmacies.filter((p) => p.training < 40)
    default: return pharmacies
  }
}

export const routeToday = [
  { time: '09:30', id: 'blasco', name: 'Farmacia Blasco Ibáñez', meta: 'Av. Blasco Ibáñez 42 · formación al 100 %', state: 'Visitada' },
  { time: '11:00', id: 'central', name: 'Farmacia Central', meta: 'C/ Colón 18 · última visita el 22 de julio', state: 'Ahora' },
  { time: '12:30', id: 'ruzafa', name: 'Farmacia Ruzafa Salud', meta: 'C/ Sueca 7 · formación al 20 %', state: 'Pendiente' },
  { time: '16:00', id: 'carmen', name: 'Farmacia El Carmen', meta: 'Plaza del Carmen 3 · 64 días sin visita', state: 'En riesgo' },
  { time: '17:30', id: 'benimaclet', name: 'Farmacia Benimaclet', meta: 'C/ Barón de San Petrillo 22 · alta reciente', state: 'Pendiente' },
] as const

export const registry = [
  { code: 'SJ', name: 'Farmacia San Jaume', meta: 'C/ Sant Jaume 4 · 46011 Valencia · F-0871-V', client: false },
  { code: 'SJ', name: 'Farmacia Sant Jaume Xirivella', meta: 'Av. Blasco Ibáñez 91 · Xirivella · F-1330-V', client: true },
]
