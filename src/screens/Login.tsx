import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { Eye, EyeOff, Plus } from 'lucide-react'
import { AuthError, homeOf, useAuth } from '@/app/auth'
import { Button } from '@/ui/Button'
import { cn } from '@/lib/cn'

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { status, user, login } = useAuth()
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Si la guarda le mandó aquí desde una pantalla de su propia área, vuelve a ella.
  const from = (location.state as { from?: string } | null)?.from

  if (status === 'checking') return <div className="h-dvh w-full bg-canvas" aria-busy="true" />
  if (status === 'in' && user && !busy) return <Navigate to={homeOf[user.role]} replace />

  const enter = async () => {
    const correo = email.trim()
    if (!correo || !pwd) return setError('Escribe tu correo y tu contraseña.')
    // El formato se mira aquí: un correo mal escrito no es una contraseña equivocada.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) return setError('Escribe un correo válido, por ejemplo nombre@farmacia.es')
    setBusy(true)
    setError(null)
    try {
      const u = await login(correo, pwd, remember)
      const area = homeOf[u.role].split('/')[1]
      navigate(from?.startsWith(`/${area}/`) ? from : homeOf[u.role], { replace: true })
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'No hemos podido iniciar sesión. Inténtalo de nuevo en un momento.')
      setBusy(false)
    }
  }

  return (
    <div className="min-h-dvh w-full flex flex-col lg:flex-row bg-canvas">
      <aside className="hidden lg:flex w-[496px] shrink-0 bg-[#7B3A24] text-on-accent flex-col p-12">
        <div className="flex items-center gap-3">
          <span className="h-[30px] w-[30px] rounded-[8px] bg-white/15 inline-flex items-center justify-center"><Plus size={16} strokeWidth={2.4} /></span>
          <span className="text-lg font-semibold">Suprafeel <span className="font-normal opacity-80">Soft</span></span>
        </div>
        <div className="mt-auto">
          <h2 className="text-[34px] leading-[44px] font-medium tracking-tight">El mostrador y la calle, en la misma pantalla.</h2>
          <p className="mt-8 text-base leading-[21px] text-on-accent-soft max-w-[400px]">Catálogo, recomendador, formación y material publicitario para farmacias y equipo comercial de Suprafeel.</p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col items-center justify-center relative px-4 py-12">
        <div className="lg:hidden flex items-center gap-3 mb-9">
          <span className="h-[30px] w-[30px] rounded-[8px] bg-accent text-on-accent inline-flex items-center justify-center"><Plus size={16} strokeWidth={2.4} /></span>
          <span className="text-lg font-semibold text-ink">Suprafeel <span className="font-normal text-muted">Soft</span></span>
        </div>
        <form
          className="w-full max-w-[372px] flex flex-col"
          onSubmit={(e) => { e.preventDefault(); void enter() }}
          noValidate
        >
          <h1 className="text-h1 font-semibold tracking-tight text-ink">Inicia sesión</h1>
          <p className="mt-2 text-base text-muted">Usa las credenciales que te facilitó Suprafeel.</p>

          <label htmlFor="login-email" className="mt-9 text-sm text-ink-soft">Correo</label>
          <div className="field mt-[6px] h-10">
            <input id="login-email" type="email" inputMode="email" className="flex-1 bg-transparent text-base" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" autoFocus />
          </div>

          <div className="mt-5 flex items-center justify-between">
            <label htmlFor="login-pwd" className="text-sm text-ink-soft">Contraseña</label>
            <button type="button" className="h-11 -my-[14px] px-2 -mx-2 inline-flex items-center text-sm font-medium text-accent" onClick={() => setError('Para cambiar la contraseña, escribe a info@suprafeel.es desde el correo de tu cuenta.')}>¿La olvidaste?</button>
          </div>
          <div className="field mt-[6px] h-10 gap-2">
            <input id="login-pwd" className={cn('flex-1 bg-transparent text-base', !show && 'tracking-[0.15em]')} type={show ? 'text' : 'password'} value={pwd} onChange={(e) => setPwd(e.target.value)} autoComplete="current-password" />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'} className="max-lg:h-8 max-lg:w-8 max-lg:-mr-2 shrink-0 inline-flex items-center justify-center text-faint hover:text-ink">{show ? <EyeOff size={15} /> : <Eye size={15} />}</button>
          </div>

          {error && <p role="alert" className="mt-4 text-sm text-danger">{error}</p>}

          <Button type="submit" variant="primary" disabled={busy} className="mt-7 h-11 rounded-[9px] text-base">{busy ? 'Entrando…' : 'Entrar'}</Button>

          <button type="button" role="checkbox" aria-checked={remember} onClick={() => setRemember((r) => !r)} className="mt-4 flex items-center gap-2.5 text-base text-ink-soft">
            <span className={cn('h-4 w-4 rounded-[4px] border inline-flex items-center justify-center', remember ? 'bg-accent border-accent' : 'border-line bg-surface')}>
              {remember && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FBF7F5" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>}
            </span>
            Mantener la sesión iniciada en este equipo
          </button>

        </form>

        <p className="absolute bottom-7 text-sm text-muted">¿Problemas para entrar? <span className="text-ink font-medium">info@suprafeel.es</span></p>
      </main>
    </div>
  )
}
