import { useEffect, useRef, useState, type ReactNode } from 'react'
import { NavLink, Navigate, useParams } from 'react-router'
import { UserRound, Building2, Users, ShieldCheck } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useAuth } from '@/app/auth'
import { useDatos } from '@/app/datos'
import { iniciales, nombreDe, pharmacyById } from '@/data/pharmacies'
import { Toolbar } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Avatar } from '@/ui/Avatar'
import { cn } from '@/lib/cn'
import { tactilBase, tactilSm } from '@/ui/tactil'

const sections = [
  { key: 'perfil', label: 'Perfil', icon: UserRound },
  { key: 'farmacia', label: 'Datos de la farmacia', icon: Building2 },
  { key: 'equipo', label: 'Equipo y accesos', icon: Users },
  { key: 'privacidad', label: 'Privacidad y datos', icon: ShieldCheck },
]

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <span className="label">{title}</span>
      <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">{children}</div>
    </div>
  )
}
/** `htmlFor`: el id del campo de la fila, para que la etiqueta quede unida a él (lectores de pantalla y clic en la etiqueta). */
function Row({ label, hint, children, last, height = 46, htmlFor }: { label: ReactNode; hint?: ReactNode; children?: ReactNode; last?: boolean; height?: number; htmlFor?: string }) {
  return (
    <div style={{ minHeight: height }} className={cn('px-[14px] py-2.5 sm:py-0 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4', !last && 'border-b border-line-soft')}>
      <div className="w-full sm:w-[160px] sm:shrink-0 flex flex-col sm:py-2.5">{htmlFor ? <label htmlFor={htmlFor} className="text-base text-ink-soft">{label}</label> : <span className="text-base text-ink-soft">{label}</span>}{hint && <span className="text-xs text-faint">{hint}</span>}</div>
      <div className="flex-1 min-w-0 flex items-center gap-3">{children}</div>
    </div>
  )
}
/** Un dato de solo lectura: todavía no hay dónde guardarlo, así que no se edita aquí. */
function Dato({ children }: { children: ReactNode }) {
  return <span className="flex-1 min-w-0 text-base text-ink break-words">{children}</span>
}
/** Nota al pie de un grupo: cómo se cambia lo que no se puede tocar desde la app. */
function Pie({ children }: { children: ReactNode }) {
  return <span className="text-sm text-faint px-1">{children}</span>
}

/** La cuenta de la sesión y su farmacia (la que sirve Xano para su pharmacy_slug). */
function useMiFarmacia() {
  const { user } = useAuth()
  const { farmacias } = useDatos()
  const farmacia = pharmacyById(user?.pharmacy_slug ?? undefined, farmacias) ?? farmacias[0]
  return { user, farmacia }
}

const CONTACTO = 'info@suprafeel.es'
const escribir = (asunto: string) => { window.location.href = `mailto:${CONTACTO}?subject=${encodeURIComponent(asunto)}` }
const Correo = () => <a href={`mailto:${CONTACTO}`} className="text-accent">{CONTACTO}</a>

export function Ajustes() {
  const { section = 'perfil' } = useParams()
  const { logout } = useAuth()
  const { farmacia } = useMiFarmacia()
  const sec = sections.find((s) => s.key === section)
  const navRef = useRef<HTMLElement>(null)
  // En el móvil las secciones son una tira que se desliza de lado: la activa se trae al centro,
  // para que se vea cuál está marcada aunque sea de las últimas. En escritorio la lista cabe entera y no se mueve.
  useEffect(() => {
    const nav = navRef.current
    const a = nav?.querySelector<HTMLElement>('a[aria-current="page"]')
    if (!nav || !a || nav.scrollWidth <= nav.clientWidth) return
    const x = a.getBoundingClientRect().left - nav.getBoundingClientRect().left + nav.scrollLeft
    nav.scrollLeft = Math.max(0, x - (nav.clientWidth - a.offsetWidth) / 2)
  }, [section])
  if (!sec) return <Navigate to="/farmacia/ajustes/perfil" replace />
  const de = farmacia ? ` · ${nombreDe(farmacia)}` : ''
  // Los ajustes todavía no se guardan en Suprafeel: los cambios se piden por correo, nada de «guardado» falso.
  const accion =
    section === 'equipo' ? <Button variant="primary" onClick={() => escribir(`Nuevo acceso a Suprafeel Soft${de}`)}>Pedir un acceso</Button>
    : section === 'perfil' ? <Button variant="primary" onClick={() => escribir(`Cambiar mis datos de Suprafeel Soft${de}`)}>Pedir un cambio</Button>
    : section === 'farmacia' ? <Button variant="primary" onClick={() => escribir(`Cambiar los datos de la farmacia${de}`)}>Pedir un cambio</Button>
    : undefined

  return (
    <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
      {/* En el móvil solo queda la tira de secciones: el título de la sección ya va en la barra de debajo. */}
      <aside className="w-full lg:w-[236px] lg:shrink-0 border-b lg:border-b-0 lg:border-r border-line bg-canvas flex flex-col px-3 pt-2.5 lg:pt-5">
        <span className="hidden lg:block text-lg font-semibold text-ink px-1.5">Ajustes</span>
        <nav ref={navRef} className="lg:mt-4 flex gap-0.5 overflow-x-auto no-scrollbar scroll-hint pb-2.5 pr-7 lg:pr-0 lg:flex-col lg:overflow-visible lg:pb-0">
          {sections.map((s) => (
            <NavLink key={s.key} to={`/farmacia/ajustes/${s.key}`} className={({ isActive }) => cn('h-10 lg:h-[35px] shrink-0 whitespace-nowrap rounded-md px-2.5 flex items-center gap-2.5 text-base', isActive ? 'bg-surface border border-line font-semibold text-ink shadow-card' : 'text-ink-soft hover:bg-chrome')}>
              <s.icon size={14} className="text-muted" />{s.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">
        <Screen toolbar={<Toolbar title={sec.label} right={accion} />}>
          <div className="w-full max-w-[632px] mx-auto flex flex-col gap-7 pt-1">
            {section === 'perfil' && <Perfil onLogout={logout} />}
            {section === 'farmacia' && <DatosFarmacia />}
            {section === 'equipo' && <Equipo />}
            {section === 'privacidad' && <Privacidad />}
          </div>
        </Screen>
      </div>
    </div>
  )
}

function Perfil({ onLogout }: { onLogout: () => void }) {
  const { user, farmacia } = useMiFarmacia()
  return (
    <>
      <div className="flex items-center gap-4">
        <Avatar initials={iniciales(user?.name || '') || 'F'} size={60} tone="soft" rounded="full" className="text-[22px]" />
        <div className="flex-1 min-w-0 flex flex-col"><span className="text-title font-semibold tracking-tight text-ink break-words">{user?.name || 'Tu cuenta'}</span><span className="text-base text-muted">{['Cuenta de farmacia', farmacia && [nombreDe(farmacia), farmacia.city].filter(Boolean).join(', ')].filter(Boolean).join(' · ')}</span></div>
      </div>
      <div className="flex flex-col gap-2.5">
        <Group title="Datos personales">
          <Row label="Nombre y apellidos"><Dato>{user?.name || '—'}</Dato></Row>
          <Row label="Correo" last><Dato>{user?.email || '—'}</Dato></Row>
        </Group>
        <Pie>Para cambiar tus datos, escribe a <Correo />.</Pie>
      </div>
      <Group title="Acceso y seguridad">
        <Row label="Tipo de cuenta"><span className="text-base font-semibold text-ink">Farmacia</span><span className="text-sm text-faint">Solo Suprafeel puede cambiarlo</span></Row>
        <Row label="Contraseña" last><span className="flex-1 text-base text-ink">••••••••••</span><button className={`${tactilSm} text-sm font-medium text-accent`} onClick={() => escribir('Cambiar la contraseña de Suprafeel Soft')}>Cambiar</button></Row>
      </Group>
      <Group title="Sesión">
        <Row label="Este navegador"><span className="flex-1 min-w-0 text-base text-ink break-all">{user?.email ? `Sesión iniciada con ${user.email}` : 'Sesión iniciada'}</span></Row>
        <Row label={<button className={`${tactilBase} text-danger font-medium`} onClick={onLogout}>Cerrar sesión</button>} last />
      </Group>
    </>
  )
}

function DatosFarmacia() {
  const { farmacia: p } = useMiFarmacia()
  // Solo lo que viene de Xano; lo que aún no tiene origen (CIF, registro, horario) no se enseña.
  const fiscales = ([
    p?.name ? ['Razón social', p.name] : null,
    p?.nombreComercial && p.nombreComercial !== p.name ? ['Nombre comercial', p.nombreComercial] : null,
    p?.address ? ['Dirección', p.address] : null,
    p?.postal ? ['Código postal', p.postal] : null,
    p?.city ? ['Población', p.city] : null,
    p?.codigoCliente ? ['Código de cliente', p.codigoCliente] : null,
  ] as ([string, string] | null)[]).filter((r): r is [string, string] => !!r)
  return (
    <>
      <div className="flex items-center gap-4">
        <Avatar initials={p?.code || iniciales(p ? nombreDe(p) : '') || 'F'} size={60} tone="soft" className="text-[22px] rounded-xl" />
        <div className="flex-1 min-w-0 flex flex-col"><span className="text-title font-semibold tracking-tight text-ink break-words">{p ? nombreDe(p) : 'Tu farmacia'}</span><span className="text-base text-muted">{[p?.city, p?.codigoCliente ? `Código de cliente ${p.codigoCliente}` : ''].filter(Boolean).join(' · ') || 'Cliente Suprafeel'}</span></div>
      </div>
      {fiscales.length > 0 && (
        <Group title="Datos fiscales">
          {fiscales.map(([k, v], i) => <Row key={k} label={k} last={i === fiscales.length - 1}><Dato>{v}</Dato></Row>)}
        </Group>
      )}
      <div className="flex flex-col gap-2.5">
        <Group title="Contacto">
          <Row label="Teléfono" hint="Visible para tu comercial" last><Dato>{p?.telefono || <span className="text-faint">No consta</span>}</Dato></Row>
        </Group>
        <Pie>Para cambiar algún dato de la farmacia, escribe a <Correo />.</Pie>
      </div>
      <Group title="Tu comercial">
        <Row label={<span className="text-ink">{p?.rep ? [p.rep, p.zona].filter(Boolean).join(' · ') : 'Sin comercial asignado todavía'}</span>}><span className="flex-1" /><NavLink to="/farmacia/mi-comercial" className={`${tactilSm} text-sm font-medium text-accent`}>Ver ficha</NavLink></Row>
      </Group>
    </>
  )
}

function Equipo() {
  const { user } = useMiFarmacia()
  // De momento cada farmacia entra con una sola cuenta: la de la sesión.
  const [team] = useState<{ i: string; n: string; e: string; r: string; s: string; me?: boolean; pending?: boolean }[]>(
    user ? [{ i: iniciales(user.name) || 'F', n: user.name, e: user.email, r: 'Titular', s: 'Tú', me: true }] : [],
  )
  return (
    <>
      <div className="flex flex-col"><h2 className="text-title font-semibold tracking-tight text-ink">Quién entra en Suprafeel Soft</h2><p className="text-base text-muted mt-1.5 leading-[19px]">Cada persona entra con su correo y su formación se registra a su nombre. Para dar acceso a alguien más de tu equipo, pídelo y lo damos de alta.</p></div>
      <Group title={(() => { const n = team.filter((m) => !m.pending).length; return n === 1 ? '1 acceso en uso' : `${n} accesos en uso` })()}>
        {team.map((m, i) => (
          <div key={m.e} className={cn('min-h-[58px] px-[14px] py-2.5 sm:py-0 flex flex-wrap sm:flex-nowrap items-center gap-x-3 gap-y-2', i < team.length - 1 && 'border-b border-line-soft', m.pending && 'opacity-80')}>
            <Avatar initials={m.i} size={30} tone={m.me ? 'soft' : m.pending ? 'outline' : 'neutral'} rounded="full" className="shrink-0" />
            <span className="flex-1 min-w-0 flex flex-col"><span className={cn('text-base font-medium truncate', m.pending ? 'text-faint' : 'text-ink')}>{m.n}</span><span className="text-xs text-faint truncate">{m.e}</span></span>
            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3">
              <span className="w-[108px] shrink-0 text-base text-ink">{m.r}</span>
              <span className={cn('sm:w-[120px] text-right text-sm shrink-0', m.pending ? 'text-warn font-medium' : 'text-muted')}>{m.s}</span>
            </div>
          </div>
        ))}
      </Group>
    </>
  )
}


function Privacidad() {
  return (
    <>
      <div className="flex flex-col"><h2 className="text-title font-semibold tracking-tight text-ink">Aquí no hay datos de pacientes</h2><p className="text-base text-muted mt-1.5 leading-[19px]">Suprafeel Soft no guarda nombres ni historiales de pacientes. De tu farmacia solo tiene los datos de la cuenta y de la farmacia. Mi lista se guarda en este navegador y se borra al cerrar sesión.</p></div>
      <Group title="Tus datos">
        <Row label={<span className="text-ink">Descargar una copia de tus datos</span>}><span className="flex-1" /><button className={`${tactilSm} text-sm font-medium text-accent`} onClick={() => escribir('Copia de mis datos de Suprafeel Soft')}>Pedir copia</button></Row>
        <Row label={<span className="text-danger font-medium">Dar de baja a la farmacia</span>} last><span className="flex-1" /><span className="text-sm text-faint">Lo gestiona tu comercial</span></Row>
      </Group>
    </>
  )
}

