import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Eye, Plus } from 'lucide-react'
import { useStore, type Role } from '@/app/store'
import { Button } from '@/ui/Button'
import { cn } from '@/lib/cn'

const demo: { role: Role; email: string; label: string; who: string; to: string }[] = [
  { role: 'farmacia', email: 'laura.vidal@farmaciacentral.es', label: 'Farmacia', who: 'Laura Vidal · Farmacia Central', to: '/farmacia/catalogo' },
  { role: 'comercial', email: 'alvaro.ferrer@suprafeel.com', label: 'Comercial', who: 'Álvaro Ferrer · Zona Levante', to: '/comercial/hoy' },
  { role: 'admin', email: 'kevin@suprafeel.com', label: 'Superadmin', who: 'Kevin Steenbock · Consola', to: '/admin/cuentas' },
]

export function Login() {
  const navigate = useNavigate()
  const { setRole } = useStore()
  const [email, setEmail] = useState(demo[0].email)
  const [pwd, setPwd] = useState('••••••••••')
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(false)

  const resolve = () => demo.find((d) => d.email === email) ?? (email.endsWith('@suprafeel.com') ? demo[1] : demo[0])

  const enter = (d = resolve()) => {
    setRole(d.role)
    navigate(d.to)
  }

  return (
    <div className="h-screen w-full min-w-[1024px] flex bg-canvas">
      <aside className="w-[496px] shrink-0 bg-[#7B3A24] text-on-accent flex flex-col p-12">
        <div className="flex items-center gap-3">
          <span className="h-[30px] w-[30px] rounded-[8px] bg-white/15 inline-flex items-center justify-center"><Plus size={16} strokeWidth={2.4} /></span>
          <span className="text-lg font-semibold">Suprafeel <span className="font-normal opacity-80">Soft</span></span>
        </div>
        <div className="mt-auto">
          <h2 className="text-[34px] leading-[44px] font-medium tracking-tight">El mostrador y la calle, en la misma pantalla.</h2>
          <p className="mt-8 text-base leading-[21px] text-on-accent-soft max-w-[400px]">Catálogo, consejo por síntomas, formación y material PLV para farmacias y equipo comercial de Suprafeel.</p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col items-center justify-center relative">
        <form
          className="w-[372px] flex flex-col"
          onSubmit={(e) => { e.preventDefault(); enter() }}
        >
          <h1 className="text-h1 font-semibold tracking-tight text-ink">Inicia sesión</h1>
          <p className="mt-2 text-base text-muted">Usa las credenciales que te facilitó Suprafeel.</p>

          <label className="mt-9 text-sm text-ink-soft">Correo</label>
          <div className="field mt-[6px] h-10">
            <input className="flex-1 bg-transparent text-base" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          </div>

          <div className="mt-5 flex items-center justify-between">
            <label className="text-sm text-ink-soft">Contraseña</label>
            <button type="button" className="text-sm font-medium text-accent" onClick={() => alert('Te enviaríamos un enlace al correo.')}>¿La olvidaste?</button>
          </div>
          <div className="field is-focus mt-[6px] h-10 gap-2">
            <input className="flex-1 bg-transparent text-base tracking-[0.15em]" type={show ? 'text' : 'password'} value={pwd} onChange={(e) => setPwd(e.target.value)} autoComplete="current-password" />
            <button type="button" onClick={() => setShow((s) => !s)} className="text-faint hover:text-ink"><Eye size={15} /></button>
          </div>

          <Button type="submit" variant="primary" className="mt-7 h-11 rounded-[9px] text-base">Entrar</Button>

          <button type="button" onClick={() => setRemember((r) => !r)} className="mt-4 flex items-center gap-2.5 text-base text-ink-soft">
            <span className={cn('h-4 w-4 rounded-[4px] border inline-flex items-center justify-center', remember ? 'bg-accent border-accent' : 'border-line bg-surface')}>
              {remember && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FBF7F5" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>}
            </span>
            Mantener la sesión iniciada en este Mac
          </button>

          <div className="mt-12 rounded-xl border border-dashed border-line bg-chrome/60 p-3.5">
            <span className="label-faint">Cuentas de demostración</span>
            <div className="mt-2.5 flex flex-col gap-1">
              {demo.map((d) => (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => { setEmail(d.email); enter(d) }}
                  className="h-9 px-3 rounded-md flex items-center justify-between hover:bg-surface text-left"
                >
                  <span className="flex flex-col">
                    <span className="text-md font-medium text-ink">{d.label}</span>
                    <span className="text-xs text-muted">{d.who}</span>
                  </span>
                  <span className="text-sm font-medium text-accent">Entrar →</span>
                </button>
              ))}
            </div>
          </div>
        </form>

        <p className="absolute bottom-7 text-sm text-muted">¿Problemas para entrar? <span className="text-ink font-medium">soporte@suprafeel.com</span></p>
      </main>
    </div>
  )
}
