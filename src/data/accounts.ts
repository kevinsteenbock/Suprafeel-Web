export interface Account {
  id: string
  code: string
  name: string
  city: string
  owner: string
  plan: 'Pro' | 'Básico'
  seatsUsed: number
  seats: number
  rep: string
  status: 'Activa' | 'Suspendida' | 'Invitada'
  since: string
  cif: string
  address: string
  postal: string
  email: string
  phone: string
  people: { initials: string; name: string; email: string; role: string; last: string; state: 'Activo' | 'Invitado' | 'Retirado' }[]
  usage: { chat: string; courses: string; order: string; plv: string }
  activity: { title: string; meta: string; live?: boolean }[]
}

export const accounts: Account[] = [
  { id: 'central', code: 'FC', name: 'Farmacia Central', city: 'Valencia', owner: 'Laura Vidal', plan: 'Pro', seatsUsed: 3, seats: 5, rep: 'Á. Ferrer', status: 'Activa', since: 'mar 2023', cif: 'B-98 112 447', address: 'C/ Colón 18', postal: 'Valencia · 46004', email: 'laura@fcentral.es', phone: '963 512 044',
    people: [
      { initials: 'LV', name: 'Laura Vidal', email: 'laura@fcentral.es', role: 'Titular', last: 'hace 2 h', state: 'Activo' },
      { initials: 'MO', name: 'Marc Oliver', email: 'marc@fcentral.es', role: 'Farmacéutico', last: 'ayer', state: 'Activo' },
      { initials: 'SB', name: 'Sara Beneito', email: 'sara@fcentral.es', role: 'Auxiliar', last: 'hace 4 d', state: 'Activo' },
      { initials: 'PS', name: 'Pau Server', email: 'pau@fcentral.es', role: 'Auxiliar', last: 'invitado hace 3 d', state: 'Invitado' },
      { initials: 'NG', name: 'Nuria Gil', email: 'nuria@fcentral.es', role: 'Auxiliar', last: 'retirado el 2 jun', state: 'Retirado' },
    ],
    usage: { chat: '128 este mes', courses: '2 de 6', order: 'hace 9 días', plv: '14 unidades' },
    activity: [
      { title: 'Pau Server invitado por Kevin', meta: 'hace 3 días · sin aceptar', live: true },
      { title: 'Sara Beneito entró por primera vez', meta: 'hace 4 días' },
      { title: 'Pedido de 4 referencias', meta: '2 de septiembre · 1.840 €' },
      { title: 'Nuria Gil retirada del equipo', meta: '2 de junio · por Laura Vidal' },
      { title: 'Plan cambiado de Básico a Pro', meta: '2 de junio · por Kevin Steenbock' },
      { title: 'Alta de la cuenta', meta: '14 de marzo de 2023 · alta directa' },
    ] },
  { id: 'blasco', code: 'BI', name: 'Farmacia Blasco Ibáñez', city: 'Valencia', owner: 'Rosa Ten', plan: 'Pro', seatsUsed: 2, seats: 5, rep: 'Á. Ferrer', status: 'Activa', since: 'ene 2023', cif: 'B-97 220 118', address: 'Av. Blasco Ibáñez 42', postal: 'Valencia · 46021', email: 'rosa@fblasco.es', phone: '963 610 220', people: [{ initials: 'RT', name: 'Rosa Ten', email: 'rosa@fblasco.es', role: 'Titular', last: 'hoy', state: 'Activo' }], usage: { chat: '64 este mes', courses: '6 de 6', order: 'hace 2 días', plv: '9 unidades' }, activity: [{ title: 'Alta de la cuenta', meta: '10 de enero de 2023' }] },
  { id: 'alboraya', code: 'AM', name: 'Farmacia Alboraya Mar', city: 'Alboraya', owner: 'Vicent Gil', plan: 'Básico', seatsUsed: 4, seats: 4, rep: 'Á. Ferrer', status: 'Activa', since: 'sep 2024', cif: 'B-98 401 090', address: 'Passeig Aragó 3', postal: 'Alboraya · 46120', email: 'vicent@falboraya.es', phone: '961 850 331', people: [{ initials: 'VG', name: 'Vicent Gil', email: 'vicent@falboraya.es', role: 'Titular', last: 'ayer', state: 'Activo' }], usage: { chat: '21 este mes', courses: '1 de 6', order: 'hace 20 días', plv: '3 unidades' }, activity: [{ title: 'Alta de la cuenta', meta: '2 de septiembre de 2024' }] },
  { id: 'ruzafa', code: 'RS', name: 'Farmacia Ruzafa Salud', city: 'Valencia', owner: 'Inés Prats', plan: 'Básico', seatsUsed: 3, seats: 4, rep: 'Á. Ferrer', status: 'Activa', since: 'feb 2025', cif: 'B-98 511 237', address: 'C/ Sueca 7', postal: 'Valencia · 46006', email: 'ines@fruzafa.es', phone: '963 290 118', people: [{ initials: 'IP', name: 'Inés Prats', email: 'ines@fruzafa.es', role: 'Titular', last: 'hace 6 d', state: 'Activo' }], usage: { chat: '9 este mes', courses: '0 de 6', order: 'hace 31 días', plv: '2 unidades' }, activity: [{ title: 'Alta de la cuenta', meta: '3 de febrero de 2025' }] },
  { id: 'carmen', code: 'EC', name: 'Farmacia El Carmen', city: 'Valencia', owner: 'Pau Server', plan: 'Básico', seatsUsed: 2, seats: 4, rep: 'Á. Ferrer', status: 'Suspendida', since: 'jun 2022', cif: 'B-96 887 001', address: 'Plaza del Carmen 3', postal: 'Valencia · 46003', email: 'pau@fcarmen.es', phone: '963 915 002', people: [{ initials: 'PS', name: 'Pau Server', email: 'pau@fcarmen.es', role: 'Titular', last: 'hace 64 d', state: 'Activo' }], usage: { chat: '0 este mes', courses: '0 de 6', order: '—', plv: '0' }, activity: [{ title: 'Cuenta suspendida por impago', meta: 'hace 12 días' }] },
  { id: 'port-sapla', code: 'PS', name: 'Farmacia Port Saplà', city: 'Valencia', owner: 'Nuria Esteve', plan: 'Básico', seatsUsed: 1, seats: 4, rep: 'Sin asignar', status: 'Invitada', since: 'sep 2025', cif: 'B-98 733 410', address: 'C/ Port Saplà 12', postal: 'Valencia · 46011', email: 'nuria@fportsapla.es', phone: '963 720 411', people: [{ initials: 'NE', name: 'Nuria Esteve', email: 'nuria@fportsapla.es', role: 'Titular', last: 'invitada hace 9 d', state: 'Invitado' }], usage: { chat: '—', courses: '—', order: '—', plv: '—' }, activity: [{ title: 'Invitación enviada', meta: 'hace 9 días' }] },
  { id: 'benimaclet', code: 'BM', name: 'Farmacia Benimaclet', city: 'Valencia', owner: 'Clara Ibáñez', plan: 'Básico', seatsUsed: 2, seats: 4, rep: 'Á. Ferrer', status: 'Activa', since: 'jul 2025', cif: 'B-98 660 902', address: 'C/ Barón de San Petrillo 22', postal: 'Valencia · 46020', email: 'clara@fbenimaclet.es', phone: '963 693 210', people: [{ initials: 'CI', name: 'Clara Ibáñez', email: 'clara@fbenimaclet.es', role: 'Titular', last: 'hace 1 d', state: 'Activo' }], usage: { chat: '12 este mes', courses: '0 de 6', order: 'hace 6 días', plv: '5 unidades' }, activity: [{ title: 'Alta de la cuenta', meta: '5 de julio de 2025' }] },
  { id: 'gran-via', code: 'GM', name: 'Farmacia Gran Vía Marqués', city: 'Valencia', owner: 'Sergio Bonet', plan: 'Pro', seatsUsed: 5, seats: 5, rep: 'Á. Ferrer', status: 'Activa', since: 'nov 2021', cif: 'B-96 411 550', address: 'Gran Vía Marqués del Turia 44', postal: 'Valencia · 46005', email: 'sergio@fgranvia.es', phone: '963 340 771', people: [{ initials: 'SB', name: 'Sergio Bonet', email: 'sergio@fgranvia.es', role: 'Titular', last: 'hoy', state: 'Activo' }], usage: { chat: '88 este mes', courses: '5 de 6', order: 'hace 3 días', plv: '11 unidades' }, activity: [{ title: 'Alta de la cuenta', meta: '18 de noviembre de 2021' }] },
]

export const accountById = (id?: string) => accounts.find((a) => a.id === id)

export const accountFilters = [
  { key: 'all', label: 'Todas', count: 412 },
  { key: 'invited', label: 'Invitadas', count: 9 },
  { key: 'suspended', label: 'Suspendidas', count: 3 },
  { key: 'norep', label: 'Sin comercial', count: 5 },
  { key: 'month', label: 'Alta este mes', count: 14 },
]
export function filterAccounts(key: string) {
  switch (key) {
    case 'invited': return accounts.filter((a) => a.status === 'Invitada')
    case 'suspended': return accounts.filter((a) => a.status === 'Suspendida')
    case 'norep': return accounts.filter((a) => a.rep === 'Sin asignar')
    case 'month': return accounts.filter((a) => a.since === 'sep 2025')
    default: return accounts
  }
}

export interface SignupRequest {
  id: string; code: string; name: string; meta: string; plan: 'Pro' | 'Básico'; received: string; blocked?: boolean; warn?: string
  cif: string; address: string; city: string; owner: string; email: string; phone: string; collegiate: string; planLabel: string; via: string; state: 'Pendiente' | 'Aceptada' | 'Rechazada'
}
export const requests: SignupRequest[] = [
  { id: 'sant-jordi', code: 'SJ', name: 'Farmacia Sant Jordi', meta: 'Valencia · B-98 442 118 · Marta Bosch', plan: 'Pro', received: 'hace 3 d', cif: 'B-98 442 118', address: 'Av. del Port 142', city: 'Valencia · 46023', owner: 'Marta Bosch', email: 'marta@fsantjordi.es', phone: '963 118 204', collegiate: '46 / 3318', planLabel: 'Pro · 5 accesos', via: 'Álvaro Ferrer', state: 'Pendiente' },
  { id: 'la-pobla', code: 'LP', name: 'Farmacia La Pobla', meta: 'La Pobla de Vallbona · B-97 210 554 · Jordi Sanz', plan: 'Básico', received: 'hace 2 d', cif: 'B-97 210 554', address: 'C/ Colón 4', city: 'La Pobla de Vallbona · 46185', owner: 'Jordi Sanz', email: 'jordi@flapobla.es', phone: '962 760 118', collegiate: '46 / 2107', planLabel: 'Básico · 4 accesos', via: 'Formulario web', state: 'Pendiente' },
  { id: 'mislata', code: 'MC', name: 'Farmacia Mislata Centro', meta: 'Mislata · B-96 883 021 · Nuria Beltrán', plan: 'Básico', received: 'hace 2 d', cif: 'B-96 883 021', address: 'Av. Blasco Ibáñez 8', city: 'Mislata · 46920', owner: 'Nuria Beltrán', email: 'nuria@fmislata.es', phone: '963 790 551', collegiate: '46 / 2660', planLabel: 'Básico · 4 accesos', via: 'Formulario web', state: 'Pendiente' },
  { id: 'xativa', code: 'XS', name: 'Farmacia Xàtiva Salut', meta: 'Xàtiva · B-98 004 776 · Pau Ripoll', plan: 'Pro', received: 'hace 1 d', cif: 'B-98 004 776', address: 'C/ Acadèmic Maravall 12', city: 'Xàtiva · 46800', owner: 'Pau Ripoll', email: 'pau@fxativa.es', phone: '962 270 331', collegiate: '46 / 3002', planLabel: 'Pro · 5 accesos', via: 'Formulario web', state: 'Pendiente' },
  { id: 'gandia', code: 'GP', name: 'Farmacia Gandia Platja', meta: 'Gandia · B-97 552 190 · Elena Mora', plan: 'Básico', received: 'hace 22 h', cif: 'B-97 552 190', address: 'Passeig Marítim Neptú 40', city: 'Gandia · 46730', owner: 'Elena Mora', email: 'elena@fgandia.es', phone: '962 840 113', collegiate: '46 / 2914', planLabel: 'Básico · 4 accesos', via: 'Formulario web', state: 'Pendiente' },
  { id: 'burjassot', code: 'B2', name: 'Farmacia Burjassot 2', meta: 'Burjassot · el CIF ya está en otra cuenta', plan: 'Básico', received: 'hace 6 h', blocked: true, cif: 'B-96 120 887', address: 'C/ Jorge Juan 2', city: 'Burjassot · 46100', owner: 'Ana Pons', email: 'ana@fburjassot.es', phone: '963 640 211', collegiate: '46 / 1877', planLabel: 'Básico · 4 accesos', via: 'Formulario web', state: 'Pendiente', warn: 'CIF duplicado' },
  { id: 'paterna', code: 'PN', name: 'Farmacia Paterna Nord', meta: 'Paterna · B-96 120 887 · Lluís Ferrando', plan: 'Pro', received: 'hace 2 h', cif: 'B-96 120 887', address: 'C/ Mayor 61', city: 'Paterna · 46980', owner: 'Lluís Ferrando', email: 'lluis@fpaterna.es', phone: '961 380 507', collegiate: '46 / 3155', planLabel: 'Pro · 5 accesos', via: 'Formulario web', state: 'Pendiente' },
]

export const reps = [
  { initials: 'ÁF', name: 'Álvaro Ferrer', zone: 'Zona Levante', pharmacies: 34, coverage: 68, visits: 27 },
  { initials: 'MR', name: 'Marta Ruiz', zone: 'Zona Centro', pharmacies: 58, coverage: 74, visits: 41 },
  { initials: 'JL', name: 'Jordi Llop', zone: 'Zona Cataluña', pharmacies: 71, coverage: 61, visits: 38 },
  { initials: 'CG', name: 'Carmen Gómez', zone: 'Zona Andalucía', pharmacies: 92, coverage: 55, visits: 44 },
  { initials: 'IB', name: 'Iker Bengoa', zone: 'Zona Norte', pharmacies: 63, coverage: 70, visits: 36 },
  { initials: 'PM', name: 'Paula Martín', zone: 'Zona Galicia', pharmacies: 49, coverage: 66, visits: 29 },
]

/** Nombres de comerciales para los desplegables de asignación (CRM, alta, solicitudes). */
export const repNames = () => reps.map((r) => r.name)
export function addRep(name: string) {
  if (reps.some((r) => r.name === name)) return
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase() || '··'
  reps.push({ initials, name, zone: 'Sin zona asignada', pharmacies: 0, coverage: 0, visits: 0 })
}
