import { useState } from 'react'
import { Screen } from '@/app/Shell'
import { useStore } from '@/app/store'
import { Toolbar } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Toggle } from '@/ui/Toggle'
import { Avatar } from '@/ui/Avatar'
import { cn } from '@/lib/cn'

function Row({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return <div className={cn('min-h-[46px] px-[14px] flex items-center gap-4', !last && 'border-b border-line-soft')}><span className="w-[180px] text-base text-ink-soft">{label}</span><div className="flex-1 flex items-center gap-3">{children}</div></div>
}

export function AjustesComercial() {
  const { notify, setRole } = useStore()
  const [s, setS] = useState({ ruta: true, riesgo: true, formacion: false, resumen: true })
  return (
    <Screen toolbar={<Toolbar title="Ajustes" right={<Button variant="primary" onClick={() => notify('Cambios guardados')}>Guardar cambios</Button>} />}>
      <div className="w-full max-w-[632px] mx-auto flex flex-col gap-7">
        <div className="flex items-center gap-4">
          <Avatar initials="ÁF" size={60} tone="soft" rounded="full" className="text-[22px]" />
          <div className="flex-1 flex flex-col"><span className="text-title font-semibold tracking-tight text-ink">Álvaro Ferrer</span><span className="text-base text-muted">Comercial · Zona Levante · 34 farmacias</span></div>
          <Button onClick={() => notify('Elige una foto en tu Mac')}>Cambiar foto</Button>
        </div>
        <div className="flex flex-col gap-2.5"><span className="label">Datos</span>
          <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
            <Row label="Correo"><span className="text-base text-ink">alvaro.ferrer@suprafeel.com</span></Row>
            <Row label="Teléfono"><span className="text-base text-ink">+34 600 118 204</span></Row>
            <Row label="Zona"><span className="text-base text-ink">Levante · Valencia, Castellón y Alicante norte</span><span className="text-sm text-faint">La asigna la central</span></Row>
            <Row label="Día habitual de ruta" last><span className="text-base text-ink">Martes y jueves</span></Row>
          </div>
        </div>
        <div className="flex flex-col gap-2.5"><span className="label">Avisos</span>
          <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
            {[['ruta', 'Ruta del día', 'Cada mañana a las 8:00 con las visitas y kilómetros.'], ['riesgo', 'Farmacias en riesgo', 'Cuando una farmacia supera 60 días sin visita.'], ['formacion', 'Formación completada', 'Cuando alguien de tus farmacias termina un curso.'], ['resumen', 'Resumen semanal', 'Los lunes con cobertura, visitas y solicitudes de PLV.']].map(([k, t, h], i) => (
              <div key={k} className={cn('min-h-[62px] px-[14px] py-3 flex items-center gap-4', i < 3 && 'border-b border-line-soft')}>
                <div className="flex-1 flex flex-col"><span className="text-base font-medium text-ink">{t}</span><span className="text-sm text-muted mt-[2px]">{h}</span></div>
                <Toggle on={s[k as keyof typeof s]} onChange={(v) => setS({ ...s, [k]: v })} />
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2.5"><span className="label">Sesión</span>
          <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
            <Row label="Este Mac"><span className="flex-1 text-base text-ink">Sesión iniciada el 2 de septiembre</span></Row>
            <Row label="" last><button className="text-base font-medium text-danger" onClick={() => { setRole(null); location.assign(import.meta.env.BASE_URL) }}>Cerrar sesión</button></Row>
          </div>
        </div>
      </div>
    </Screen>
  )
}
