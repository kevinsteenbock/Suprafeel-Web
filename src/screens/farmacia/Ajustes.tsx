import { useState, type ReactNode } from 'react'
import { NavLink, Navigate, useParams } from 'react-router'
import { UserRound, Building2, Users, Bell, ShieldCheck, Sun, Search } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useStore } from '@/app/store'
import { Toolbar } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Toggle } from '@/ui/Toggle'
import { Avatar } from '@/ui/Avatar'
import { Select } from '@/ui/Field'
import { cn } from '@/lib/cn'

const sections = [
  { key: 'perfil', label: 'Perfil', icon: UserRound },
  { key: 'farmacia', label: 'Datos de la farmacia', icon: Building2 },
  { key: 'equipo', label: 'Equipo y accesos', icon: Users },
  { key: 'notificaciones', label: 'Notificaciones', icon: Bell },
  { key: 'privacidad', label: 'Privacidad y datos', icon: ShieldCheck },
  { key: 'apariencia', label: 'Apariencia', icon: Sun },
]

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="label">{title}</span>
      <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">{children}</div>
    </div>
  )
}
function Row({ label, hint, children, last, height = 46 }: { label: ReactNode; hint?: ReactNode; children?: ReactNode; last?: boolean; height?: number }) {
  return (
    <div style={{ minHeight: height }} className={cn('px-[14px] flex items-center gap-4', !last && 'border-b border-line-soft')}>
      <div className="w-[160px] shrink-0 flex flex-col py-2.5"><span className="text-base text-ink-soft">{label}</span>{hint && <span className="text-xs text-faint">{hint}</span>}</div>
      <div className="flex-1 min-w-0 flex items-center gap-3">{children}</div>
    </div>
  )
}
function ToggleRow({ title, hint, on, onChange, last, disabled }: { title: string; hint: string; on: boolean; onChange?: (v: boolean) => void; last?: boolean; disabled?: boolean }) {
  return (
    <div className={cn('min-h-[62px] px-[14px] py-3 flex items-center gap-4', !last && 'border-b border-line-soft')}>
      <div className="flex-1 flex flex-col"><span className="text-base font-medium text-ink">{title}</span><span className="text-sm text-muted mt-[2px]">{hint}</span></div>
      <Toggle on={on} onChange={onChange} disabled={disabled} />
    </div>
  )
}
function Edit({ value, onChange }: { value: string; onChange?: (v: string) => void }) {
  return <div className="field flex-1 h-8 rounded-[7px] bg-canvas"><input className="flex-1 bg-transparent text-base" value={value} onChange={(e) => onChange?.(e.target.value)} /></div>
}

export function Ajustes() {
  const { section = 'perfil' } = useParams()
  const { notify, setRole } = useStore()
  const sec = sections.find((s) => s.key === section)
  if (!sec) return <Navigate to="/farmacia/ajustes/perfil" replace />
  const save = () => notify('Cambios guardados')

  return (
    <div className="flex-1 min-h-0 flex">
      <aside className="w-[236px] shrink-0 border-r border-line bg-canvas flex flex-col px-3 pt-5">
        <span className="text-lg font-semibold text-ink px-1.5">Ajustes</span>
        <div className="mt-4 h-8 rounded-[7px] bg-surface border border-line px-2.5 flex items-center gap-2 text-md text-faint"><Search size={13} /> Buscar en ajustes</div>
        <nav className="mt-4 flex flex-col gap-0.5">
          {sections.map((s) => (
            <NavLink key={s.key} to={`/farmacia/ajustes/${s.key}`} className={({ isActive }) => cn('h-[35px] rounded-md px-2.5 flex items-center gap-2.5 text-base', isActive ? 'bg-surface border border-line font-semibold text-ink shadow-card' : 'text-ink-soft hover:bg-chrome')}>
              <s.icon size={14} className="text-muted" />{s.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">
        <Screen toolbar={<Toolbar title={sec.label} right={section === 'equipo' ? <Button variant="primary" onClick={() => notify('Invitación enviada')}>Invitar a alguien</Button> : <Button variant="primary" onClick={save}>Guardar cambios</Button>} />}>
          <div className="w-full max-w-[632px] mx-auto flex flex-col gap-7 pt-1">
            {section === 'perfil' && <Perfil onLogout={() => setRole(null)} />}
            {section === 'farmacia' && <DatosFarmacia />}
            {section === 'equipo' && <Equipo />}
            {section === 'notificaciones' && <Notificaciones />}
            {section === 'privacidad' && <Privacidad />}
            {section === 'apariencia' && <Apariencia />}
          </div>
        </Screen>
      </div>
    </div>
  )
}

function Perfil({ onLogout }: { onLogout: () => void }) {
  const { notify } = useStore()
  const [f, setF] = useState({ nombre: 'Laura', apellidos: 'Vidal Martínez', correo: 'laura.vidal@farmaciacentral.es', tel: '+34 961 24 88 10' })
  const [twoFA, set2FA] = useState(true)
  return (
    <>
      <div className="flex items-center gap-4">
        <Avatar initials="LV" size={60} tone="soft" rounded="full" className="text-[22px]" />
        <div className="flex-1 flex flex-col"><span className="text-title font-semibold tracking-tight text-ink">Laura Vidal</span><span className="text-base text-muted">Titular · Farmacia Central, Valencia</span></div>
        <Button onClick={() => notify('Elige una foto en tu Mac')}>Cambiar foto</Button>
      </div>
      <Group title="Datos personales">
        <Row label="Nombre"><Edit value={f.nombre} onChange={(v) => setF({ ...f, nombre: v })} /></Row>
        <Row label="Apellidos"><Edit value={f.apellidos} onChange={(v) => setF({ ...f, apellidos: v })} /></Row>
        <Row label="Correo"><Edit value={f.correo} onChange={(v) => setF({ ...f, correo: v })} /></Row>
        <Row label="Teléfono" last><Edit value={f.tel} onChange={(v) => setF({ ...f, tel: v })} /></Row>
      </Group>
      <Group title="Acceso y seguridad">
        <Row label="Rol en el software"><span className="text-base font-semibold text-ink">Titular</span><span className="text-sm text-faint">Solo Suprafeel puede cambiarlo</span></Row>
        <Row label="Verificación en dos pasos"><span className="flex-1 text-base text-ink">{twoFA ? 'Activa por SMS al ···· 810' : 'Desactivada'}</span><Toggle on={twoFA} onChange={set2FA} /></Row>
        <Row label="Contraseña" last><span className="flex-1 text-base text-ink">Cambiada hace 3 meses</span><button className="text-sm font-medium text-accent" onClick={() => notify('Te hemos enviado un enlace para cambiarla')}>Cambiar</button></Row>
      </Group>
      <Group title="Sesión">
        <Row label={<span className="text-ink">Sesión iniciada en este Mac desde el 2 de septiembre</span>}><span className="flex-1" /><button className="text-sm font-medium text-accent" onClick={() => notify('1 dispositivo activo')}>Ver dispositivos</button></Row>
        <Row label={<button className="text-danger font-medium" onClick={() => { onLogout(); location.assign(import.meta.env.BASE_URL) }}>Cerrar sesión</button>} last />
      </Group>
    </>
  )
}

function DatosFarmacia() {
  const { notify } = useStore()
  const [f, setF] = useState({ razon: 'Farmacia Central S.L.', cif: 'B-98 442 117', dir: 'C/ Colón 18, bajo', pob: '46004 Valencia', reg: 'F-1042-V' })
  return (
    <>
      <div className="flex items-center gap-4">
        <Avatar initials="FC" size={60} tone="soft" className="text-[22px] rounded-xl" />
        <div className="flex-1 flex flex-col"><span className="text-title font-semibold tracking-tight text-ink">Farmacia Central</span><span className="text-base text-muted">Cliente Suprafeel desde marzo de 2023 · código VLC-0142</span></div>
        <Button onClick={() => notify('Elige el logo en tu Mac')}>Cambiar logo</Button>
      </div>
      <Group title="Datos fiscales">
        <Row label="Razón social"><Edit value={f.razon} onChange={(v) => setF({ ...f, razon: v })} /></Row>
        <Row label="CIF"><Edit value={f.cif} onChange={(v) => setF({ ...f, cif: v })} /></Row>
        <Row label="Dirección"><Edit value={f.dir} onChange={(v) => setF({ ...f, dir: v })} /></Row>
        <Row label="Población"><Edit value={f.pob} onChange={(v) => setF({ ...f, pob: v })} /></Row>
        <Row label="Nº de registro" last><Edit value={f.reg} onChange={(v) => setF({ ...f, reg: v })} /></Row>
      </Group>
      <Group title="Contacto y horario">
        <Row label="Teléfono"><span className="text-base font-semibold text-ink">+34 961 24 88 10</span><span className="text-sm text-faint">Visible para tu comercial</span></Row>
        <Row label="Horario"><span className="flex-1 text-base text-ink">L–V 9:00–21:00 · Sáb 9:30–14:00</span><button className="text-sm font-medium text-accent" onClick={() => notify('Editor de horario')}>Editar</button></Row>
        <Row label="Visitas del comercial" last><span className="flex-1 text-base text-ink">Cada 3 semanas, martes por la mañana</span><button className="text-sm font-medium text-accent" onClick={() => notify('Le hemos pedido a Álvaro otra franja')}>Cambiar</button></Row>
      </Group>
      <Group title="Tu comercial">
        <Row label={<span className="text-ink">Álvaro Ferrer · Zona Levante · alvaro.ferrer@suprafeel.com</span>}><span className="flex-1" /><NavLink to="/farmacia/mi-comercial" className="text-sm font-medium text-accent">Ver ficha</NavLink></Row>
        <Row label={<button className="text-accent font-medium" onClick={() => notify('Solicitud enviada a la central')}>Solicitar cambio de comercial</button>} last />
      </Group>
    </>
  )
}

function Equipo() {
  const { notify } = useStore()
  const [team, setTeam] = useState([
    { i: 'LV', n: 'Laura Vidal', e: 'laura.vidal@farmaciacentral.es', r: 'Titular', s: 'Tú', me: true },
    { i: 'MS', n: 'Marta Soler', e: 'marta.soler@farmaciacentral.es', r: 'Adjunta', s: 'Activa' },
    { i: 'JR', n: 'Jorge Ramos', e: 'jorge.ramos@farmaciacentral.es', r: 'Auxiliar', s: 'Activo' },
    { i: 'NB', n: 'Nuria Beltrán', e: 'nuria.beltran@farmaciacentral.es', r: 'Auxiliar', s: 'Invitación enviada', pending: true },
  ])
  const cycle = (idx: number) => {
    const roles = ['Titular', 'Adjunta', 'Auxiliar']
    setTeam((t) => t.map((m, i) => (i === idx && !m.me ? { ...m, r: roles[(roles.indexOf(m.r) + 1) % roles.length] } : m)))
    notify('Rol actualizado')
  }
  return (
    <>
      <div className="flex flex-col"><h2 className="text-title font-semibold tracking-tight text-ink">Quién entra en Suprafeel Soft</h2><p className="text-base text-muted mt-1.5 leading-[19px]">Tu farmacia tiene 5 accesos incluidos. Cada persona entra con su correo y su formación se registra a su nombre.</p></div>
      <Group title={`${team.filter((m) => !m.pending).length} de 5 accesos en uso`}>
        {team.map((m, i) => (
          <div key={m.e} className={cn('h-[58px] px-[14px] flex items-center gap-3', i < team.length - 1 && 'border-b border-line-soft', m.pending && 'opacity-80')}>
            <Avatar initials={m.i} size={30} tone={m.me ? 'soft' : m.pending ? 'outline' : 'neutral'} rounded="full" />
            <span className="flex-1 min-w-0 flex flex-col"><span className={cn('text-base font-medium', m.pending ? 'text-faint' : 'text-ink')}>{m.n}</span><span className="text-xs text-faint">{m.e}</span></span>
            <button onClick={() => cycle(i)} className="w-[108px]"><Select value={m.r} size="sm" /></button>
            <span className={cn('w-[120px] text-right text-sm', m.pending ? 'text-warn font-medium' : 'text-muted')}>{m.s}</span>
          </div>
        ))}
      </Group>
      <Group title="Qué puede hacer cada rol">
        {[['Titular', 'Todo, más los datos fiscales, los accesos del equipo y la relación con el comercial.'], ['Adjunto', 'Catálogo, consejo por síntomas, formación y materiales PLV. Puede invitar a auxiliares.'], ['Auxiliar', 'Catálogo, consejo por síntomas y su propia formación. No ve datos de la farmacia.']].map(([r, d], i) => (
          <div key={r} className={cn('min-h-11 px-[14px] py-3 flex items-start gap-4', i < 2 && 'border-b border-line-soft')}><span className="w-[80px] text-base font-semibold text-ink">{r}</span><span className="flex-1 text-base text-ink-soft leading-[19px]">{d}</span></div>
        ))}
      </Group>
    </>
  )
}

function Notificaciones() {
  const { notify } = useStore()
  const [s, setS] = useState({ cat: true, form: true, visita: true, plv: false, resumen: true, dnd: true })
  const t = (k: keyof typeof s) => (v: boolean) => setS({ ...s, [k]: v })
  return (
    <>
      <div className="flex flex-col"><h2 className="text-title font-semibold tracking-tight text-ink">Qué te avisamos</h2><p className="text-base text-muted mt-1.5">Estas notificaciones son de Suprafeel. Nada de esto toca tu programa de gestión.</p></div>
      <Group title="En la app y por correo">
        <ToggleRow title="Novedades de catálogo" hint="Cuando entra una referencia nueva o cambia la tarifa." on={s.cat} onChange={t('cat')} />
        <ToggleRow title="Formación nueva" hint="Cursos y lecciones nuevas, y recordatorio si dejas uno a medias." on={s.form} onChange={t('form')} />
        <ToggleRow title="Visita del comercial" hint="Aviso el día antes y si Álvaro cambia la hora." on={s.visita} onChange={t('visita')} />
        <ToggleRow title="Materiales PLV disponibles" hint="Expositores, folletos y carteles de campaña listos para pedir." on={s.plv} onChange={t('plv')} />
        <ToggleRow title="Resumen mensual" hint="Un correo el día 1 con novedades, formación pendiente y campañas." on={s.resumen} onChange={t('resumen')} last />
      </Group>
      <Group title="Cómo y cuándo">
        <Row label="Correo de avisos"><span className="flex-1 text-base text-ink">laura.vidal@farmaciacentral.es</span><button className="text-sm font-medium text-accent" onClick={() => notify('Cambia el correo en Perfil')}>Cambiar</button></Row>
        <Row label="No molestar" last><span className="flex-1 text-base text-ink">Fuera del horario de la farmacia</span><Toggle on={s.dnd} onChange={t('dnd')} /></Row>
      </Group>
    </>
  )
}

function Privacidad() {
  const { notify } = useStore()
  const [s, setS] = useState({ consultas: true, lista: true })
  return (
    <>
      <div className="flex flex-col"><h2 className="text-title font-semibold tracking-tight text-ink">Aquí no hay datos de pacientes</h2><p className="text-base text-muted mt-1.5 leading-[19px]">Suprafeel Soft no guarda nombres ni historiales. Lo que escribes en el buscador por síntomas se almacena sin identificar a nadie.</p></div>
      <Group title="Qué compartes con Suprafeel">
        <ToggleRow title="Progreso de formación del equipo" hint="Necesario para emitir los certificados. No se puede desactivar." on={false} disabled />
        <ToggleRow title="Consultas del buscador por síntomas" hint="Nos ayudan a mejorar las recomendaciones. Se guardan sin tu nombre ni el de la farmacia." on={s.consultas} onChange={(v) => setS({ ...s, consultas: v })} />
        <ToggleRow title="Compartir Mi lista con tu comercial" hint="Álvaro verá lo que has guardado antes de la visita, para llegar preparado." on={s.lista} onChange={(v) => setS({ ...s, lista: v })} last />
      </Group>
      <Group title="Tus datos">
        <Row label={<span className="text-ink">Descargar una copia de tus datos</span>}><span className="flex-1" /><button className="text-sm font-medium text-accent" onClick={() => notify('Te la enviamos por correo en unas horas')}>Pedir copia</button></Row>
        <Row label={<span className="text-ink">Historial del buscador · 142 consultas</span>}><span className="flex-1" /><button className="text-sm font-medium text-accent" onClick={() => notify('Historial borrado')}>Borrar historial</button></Row>
        <Row label={<span className="text-danger font-medium">Dar de baja a la farmacia</span>} last><span className="flex-1" /><span className="text-sm text-faint">Lo gestiona tu comercial</span></Row>
      </Group>
    </>
  )
}

function Apariencia() {
  const { notify } = useStore()
  const [theme, setTheme] = useState('Claro')
  const [size, setSize] = useState('Normal')
  const [dense, setDense] = useState(false)
  return (
    <>
      <div className="flex flex-col"><h2 className="text-title font-semibold tracking-tight text-ink">Cómo se ve en tu Mac</h2><p className="text-base text-muted mt-1.5">Piensa en la luz de tu mostrador. Muchas farmacias trabajan con fluorescente y agradecen el modo claro.</p></div>
      <div className="flex flex-col gap-2.5">
        <span className="label">Tema</span>
        <div className="grid grid-cols-3 gap-4">
          {[{ n: 'Claro', side: '#E5E4E0', main: '#FBFBFA', bg: '#F1F0ED' }, { n: 'Oscuro', side: '#2B2926', main: '#1A1918', bg: '#232120' }, { n: 'Automático', side: '#E5E4E0', main: '#3A3835', bg: '#F1F0ED' }].map((t) => (
            <button key={t.n} onClick={() => { setTheme(t.n); if (t.n !== 'Claro') notify('El modo oscuro llega en la siguiente versión') }} className="flex flex-col items-center gap-2.5">
              <span style={{ background: t.bg }} className={cn('w-full h-[96px] rounded-lg border-2 p-2.5 flex gap-2', theme === t.n ? 'border-accent ring-[3px] ring-accent-wash' : 'border-line')}>
                <span style={{ background: t.side }} className="w-8 h-full rounded-md" /><span style={{ background: t.main }} className="flex-1 h-full rounded-md" />
              </span>
              <span className={cn('text-base', theme === t.n ? 'font-semibold text-ink' : 'text-ink-soft')}>{t.n}</span>
            </button>
          ))}
        </div>
      </div>
      <Group title="Lectura">
        <Row label="Tamaño del texto">
          <div className="h-[30px] rounded-[7px] border border-line bg-surface p-[2px] flex">
            {['Pequeño', 'Normal', 'Grande'].map((o) => <button key={o} onClick={() => setSize(o)} className={cn('px-3 rounded-[5px] text-sm font-medium', size === o ? 'bg-accent text-on-accent' : 'text-ink-soft hover:bg-chrome')}>{o}</button>)}
          </div>
        </Row>
        <Row label="Densidad de las listas"><span className="flex-1 text-base text-ink">{dense ? 'Compacta · más filas por pantalla' : 'Cómoda · más aire entre filas'}</span><button className="text-sm font-medium text-accent" onClick={() => setDense((d) => !d)}>{dense ? 'Cambiar a cómoda' : 'Cambiar a compacta'}</button></Row>
        <Row label="Abrir al iniciar en" last><Select value="Catálogo" size="sm" className="w-[110px]" /></Row>
      </Group>
    </>
  )
}
