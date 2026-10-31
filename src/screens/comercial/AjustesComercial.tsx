import type { ReactNode } from 'react'
import { Screen } from '@/app/Shell'
import { useAuth } from '@/app/auth'
import { useDatos } from '@/app/datos'
import { comercialesDe, iniciales } from '@/data/pharmacies'
import { Toolbar } from '@/ui/Page'
import { Toggle } from '@/ui/Toggle'
import { Avatar } from '@/ui/Avatar'
import { cn } from '@/lib/cn'

function Row({ label, children, last }: { label: string; children: ReactNode; last?: boolean }) {
  return <div className={cn('min-h-[46px] px-[14px] py-2.5 sm:py-0 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4', !last && 'border-b border-line-soft')}><span className="w-full sm:w-[180px] sm:shrink-0 text-base text-ink-soft">{label}</span><div className="flex-1 min-w-0 flex items-center gap-3">{children}</div></div>
}

export function AjustesComercial() {
  const { user, logout } = useAuth()
  const { farmacias } = useDatos()
  // Los avisos todavía no se pueden elegir desde la app: se enseñan como están, sin interruptores que no guardan.
  const s = { ruta: true, riesgo: true, formacion: false, resumen: true }

  const nombre = user?.name || user?.rep_name || 'Comercial'
  const rep = user?.rep_name || ''
  const zona = comercialesDe(farmacias)[0]?.zona ?? ''
  const n = farmacias.length
  const rows = ([
    user?.email ? { k: 'Correo', v: <span className="text-base text-ink break-all">{user.email}</span> } : null,
    rep ? { k: 'Nombre en el reparto', v: <><span className="text-base text-ink">{rep}</span><span className="text-sm text-faint">Así apareces en la hoja de farmacias</span></> } : null,
    zona ? { k: 'Zona', v: <><span className="text-base text-ink">{zona}</span><span className="text-sm text-faint">La asigna la central</span></> } : null,
    { k: 'Farmacias', v: <span className="text-base text-ink">{n === 1 ? '1 farmacia' : `${n} farmacias`}</span> },
  ] as ({ k: string; v: ReactNode } | null)[]).filter((r): r is { k: string; v: ReactNode } => !!r)

  return (
    <Screen toolbar={<Toolbar title="Ajustes" />}>
      <div className="w-full max-w-[632px] mx-auto flex flex-col gap-7">
        <div className="flex items-center gap-4">
          <Avatar initials={iniciales(nombre) || 'C'} size={60} tone="soft" rounded="full" className="text-[22px]" />
          <div className="flex-1 min-w-0 flex flex-col"><span className="text-title font-semibold tracking-tight text-ink break-words">{nombre}</span><span className="text-base text-muted">{['Comercial', zona, n === 1 ? '1 farmacia' : `${n} farmacias`].filter(Boolean).join(' · ')}</span></div>
        </div>
        <div className="flex flex-col gap-2.5"><span className="label">Datos</span>
          <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
            {rows.map((r, i) => <Row key={r.k} label={r.k} last={i === rows.length - 1}>{r.v}</Row>)}
          </div>
          <span className="text-sm text-faint px-1">Para cambiar tus datos o tu zona, escribe a <a href="mailto:info@suprafeel.es" className="text-accent">info@suprafeel.es</a>.</span>
        </div>
        <div className="flex flex-col gap-2.5"><span className="label">Avisos</span>
          <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
            {[['ruta', 'Ruta del día', 'Cada mañana a las 8:00 con las formaciones del día.'], ['riesgo', 'Formación pendiente', 'Cuando una de tus farmacias queda con la formación sin fecha.'], ['formacion', 'Formación completada', 'Cuando alguien de tus farmacias termina un curso.'], ['resumen', 'Resumen semanal', 'Los lunes con tus farmacias, formaciones y solicitudes de PLV.']].map(([k, t, h], i) => (
              <div key={k} className={cn('min-h-[62px] px-[14px] py-3 flex items-center gap-4', i < 3 && 'border-b border-line-soft')}>
                <div className="flex-1 flex flex-col"><span className="text-base font-medium text-ink">{t}</span><span className="text-sm text-muted mt-[2px]">{h}</span></div>
                <Toggle on={s[k as keyof typeof s]} disabled />
              </div>
            ))}
          </div>
          <span className="text-sm text-faint px-1">De momento los avisos no se cambian desde aquí: si quieres cambiar alguno, escribe a <a href="mailto:info@suprafeel.es" className="text-accent">info@suprafeel.es</a>.</span>
        </div>
        <div className="flex flex-col gap-2.5"><span className="label">Sesión</span>
          <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
            <Row label="Este navegador"><span className="flex-1 min-w-0 text-base text-ink break-all">{user?.email ? `Sesión iniciada con ${user.email}` : 'Sesión iniciada'}</span></Row>
            <Row label="" last><button className="text-base font-medium text-danger" onClick={logout}>Cerrar sesión</button></Row>
          </div>
        </div>
      </div>
    </Screen>
  )
}
