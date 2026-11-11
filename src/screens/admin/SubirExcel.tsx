import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Download, FileSpreadsheet, Upload } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { call, useAuth } from '@/app/auth'
import { useDatos } from '@/app/datos'
import { useStore } from '@/app/store'
import { formacionLabel, type Formacion } from '@/data/pharmacies'
import { productById } from '@/data/products'
import { leerXlsx } from '@/lib/xlsx'
import { analizarExcel, type Analisis } from '@/lib/excelFarmacias'
import { Notice, PageHeader, Section, Toolbar } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { cn } from '@/lib/cn'
import { accesosPorComercial } from './accesos'
import { repsDe } from '@/data/pharmacies'

interface Subido { id: number; created_at: number; nombre: string; resumen?: { aplicadas?: number; nuevas?: number; errores?: number } | null }

const LIMITE = 6 * 1024 * 1024
const fecha = (v: number) => new Date(v).toLocaleString('es-ES', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })

/** Cómo se lee un valor en la tabla de cambios: estados con su nombre y referencias con el del producto. */
function legible(campo: string, v: string): string {
  if (!v) return '—'
  if (campo === 'Formación') return formacionLabel(v as Formacion)
  if (campo === 'Referencias') return v.split(', ').map((id) => productById(id)?.name ?? id).join(', ')
  if (campo === 'Fecha') { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v); return m ? `${+m[3]!}/${+m[2]!}/${m[1]}` : v }
  return v
}

function aBase64(buf: ArrayBuffer): string {
  const b = new Uint8Array(buf)
  let s = ''
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode(...b.subarray(i, i + 0x8000))
  return btoa(s)
}

function Cifra({ n, texto, tono }: { n: number; texto: string; tono?: 'ok' | 'warn' | 'danger' }) {
  return (
    <div className="rounded-xl bg-surface border border-line px-4 py-3 flex flex-col">
      <span className={cn('text-title font-semibold tracking-tight', tono === 'ok' ? 'text-ok' : tono === 'warn' ? 'text-[#7A5A18]' : tono === 'danger' ? 'text-[#7E2323]' : 'text-ink')}>{n}</span>
      <span className="text-sm text-muted">{texto}</span>
    </div>
  )
}

function Marca({ activa, onClick, etiqueta }: { activa: boolean; onClick: () => void; etiqueta: string }) {
  return <input type="checkbox" checked={activa} onChange={onClick} aria-label={etiqueta} className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-accent)]" />
}

/**
 * Subir Excel (doc de cambios del 9 nov): administración sube el Excel semanal de farmacias y
 * formaciones, ve qué cambia y lo confirma. Hasta confirmar no se guarda nada; cada Excel queda
 * guardado para descargarlo otra vez. La información relevante es interna: la farmacia no la ve.
 */
export function SubirExcel() {
  const { token } = useAuth()
  const { farmacias, usuarios, recargar } = useDatos()
  const conCuenta = accesosPorComercial(usuarios)
  const { notify } = useStore()
  const input = useRef<HTMLInputElement>(null)
  const [archivo, setArchivo] = useState<{ nombre: string; datos: ArrayBuffer } | null>(null)
  const [an, setAn] = useState<Analisis | null>(null)
  const [fuera, setFuera] = useState<Set<string>>(new Set())
  const [leyendo, setLeyendo] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [hecho, setHecho] = useState('')
  const [subidos, setSubidos] = useState<Subido[] | null>(null)

  const cargarLista = () =>
    call('/admin/excel', {}, token)
      .then(({ res, body }) => setSubidos(res.ok && Array.isArray(body) ? body : []))
      .catch(() => setSubidos([]))
  useEffect(() => { void cargarLista() }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  const elegir = async (f?: File) => {
    setError(''); setHecho(''); setAn(null); setFuera(new Set())
    if (!f) return
    if (!/\.xlsx$/i.test(f.name)) return setError('Tiene que ser un archivo .xlsx (Excel).')
    if (f.size > LIMITE) return setError('El archivo pasa de 6 MB.')
    setLeyendo(true)
    try {
      const datos = await f.arrayBuffer()
      const hojas = await leerXlsx(datos)
      // Los comerciales con cuenta (también los que aún no llevan farmacias) y la zona de su ficha.
      const conocidos = usuarios.filter((u) => u.role === 'comercial' && repsDe(u.rep_name).length === 1 && u.rep_name !== '*').map((u) => ({ rep: u.rep_name, zona: u.zona }))
      const r = analizarExcel(hojas, farmacias, new Date(), conocidos)
      // Un Excel con comerciales y sin farmacias todavía (p. ej. los de una zona nueva) también vale.
      if (r.filasLeidas === 0 && r.comerciales.length === 0) {
        setError(`No encuentro farmacias ni comerciales en el Excel (${r.hojas.length === 1 ? 'hoja' : 'hojas'}: ${r.hojas.map((h) => `«${h}»`).join(', ')}). En la fila de títulos de cada hoja tiene que haber una columna «Farmacia» (o «Nombre») o, si de momento solo son comerciales, una columna «Comercial».`)
      } else { setArchivo({ nombre: f.name, datos }); setAn(r) }
    } catch {
      setError('No se ha podido leer el Excel. Guárdalo otra vez como .xlsx y vuelve a probar.')
    } finally {
      setLeyendo(false)
      if (input.current) input.current.value = ''
    }
  }

  const alternar = (k: string) => setFuera((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n })
  const cambios = an?.cambios.filter((c) => !fuera.has(c.slug)) ?? []
  const nuevas = an?.nuevas.filter((n) => !fuera.has(`nueva:${n.envio.slug}`)) ?? []
  const total = cambios.length + nuevas.length

  const guardar = async () => {
    if (!an || !archivo) return
    setGuardando(true); setError('')
    try {
      const { res, body } = await call('/admin/excel', {
        method: 'POST',
        body: JSON.stringify({
          nombre: archivo.nombre,
          archivo: aBase64(archivo.datos),
          cambios: cambios.map((c) => c.envio),
          nuevas: nuevas.map((n) => n.envio),
          resumen: { filas: an.filasLeidas, iguales: an.iguales, avisos: an.avisos.length, errores_excel: an.errores.length, descartadas: fuera.size },
        }),
      }, token)
      if (!res.ok) throw new Error(body?.message || 'No se ha podido guardar')
      const malas = Array.isArray(body?.errores) ? body.errores.length : 0
      setHecho(`Guardado: ${body.aplicadas} farmacias actualizadas y ${body.nuevas} nuevas.${malas ? ` ${malas} no se han podido guardar.` : ''}`)
      notify('Excel guardado')
      setAn(null); setArchivo(null); setFuera(new Set())
      await recargar()
      void cargarLista()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se ha podido guardar')
    } finally {
      setGuardando(false)
    }
  }

  const descargar = async (s: Subido) => {
    const { res, body } = await call(`/admin/excel/${s.id}`, {}, token).catch(() => ({ res: { ok: false } as Response, body: null }))
    if (!res.ok || !body?.archivo) return notify('No se ha podido descargar')
    const bin = Uint8Array.from(atob(body.archivo), (c) => c.charCodeAt(0))
    const url = URL.createObjectURL(new Blob([bin], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
    const a = document.createElement('a')
    a.href = url; a.download = body.nombre || 'farmacias.xlsx'; a.click()
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }

  return (
    <Screen toolbar={<Toolbar title="Subir Excel" />}>
      <PageHeader title="Subir Excel" subtitle="Sube el Excel actualizado de farmacias y formaciones. Antes de guardar verás qué cambia; hasta que confirmes, no se guarda nada." />

      <section className="rounded-xl bg-surface border border-line shadow-card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <span className="h-11 w-11 shrink-0 rounded-lg bg-accent-wash text-accent inline-flex items-center justify-center"><FileSpreadsheet size={20} /></span>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-ink">{archivo ? archivo.nombre : 'Excel de farmacias (.xlsx)'}</h2>
          <p className="text-sm text-muted">Vale el Excel de siempre («Farmacias ordenadas», «Carbó», «Canarias») o la hoja «FORMACIÓN FARMACIAS». Las farmacias que ya existen se actualizan; no se duplican.</p>
        </div>
        <input ref={input} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="hidden" onChange={(e) => void elegir(e.target.files?.[0])} />
        <Button variant="primary" size="lg" icon={<Upload size={14} />} disabled={leyendo || guardando} onClick={() => input.current?.click()}>{leyendo ? 'Leyendo…' : archivo ? 'Elegir otro' : 'Elegir Excel'}</Button>
      </section>

      {error && <Notice tone="danger">{error}</Notice>}
      {hecho && <Notice tone="ok">{hecho}</Notice>}

      {an && (
        <>
          <div className="grid gap-2.5 grid-cols-2 lg:grid-cols-5">
            <Cifra n={an.nuevas.length} texto="farmacias nuevas" tono="ok" />
            <Cifra n={an.cambios.length} texto="con cambios" />
            <Cifra n={an.iguales} texto="sin cambios" />
            <Cifra n={an.avisos.length} texto="avisos" tono={an.avisos.length ? 'warn' : undefined} />
            <Cifra n={an.errores.length} texto="filas con errores" tono={an.errores.length ? 'danger' : undefined} />
          </div>

          {an.hojasSinTitulos.length > 0 && (
            <Notice tone="warn">No se han leído {an.hojasSinTitulos.length === 1 ? 'la hoja' : 'las hojas'} {an.hojasSinTitulos.map((h) => `«${h}»`).join(', ')}: no encuentro la fila de títulos con «Farmacia» o «Comercial».</Notice>
          )}

          {an.filasLeidas === 0 && (
            <Notice tone="ok">Este Excel solo trae comerciales, todavía sin farmacias. No hay farmacias que guardar: crea la cuenta de los que aún no la tienen.</Notice>
          )}

          {an.comerciales.length > 0 && (
            <Section title="Comerciales sin farmacias todavía">
              <p className="text-sm text-muted">Salen en el Excel sin farmacias. Crea la cuenta de los que aún no la tienen para que puedan entrar; sus farmacias llegarán con el Excel de cada semana.</p>
              <div className="rounded-xl bg-surface border border-line overflow-hidden">
                {an.comerciales.map((c, i) => (
                  <div key={c.nombre} className={cn('min-h-[52px] px-3.5 py-2 flex items-center gap-3', i < an.comerciales.length - 1 && 'border-b border-line-soft')}>
                    <span className="flex-1 min-w-0 flex flex-col">
                      <span className="text-base font-medium text-ink">{c.nombre}</span>
                      {c.zona && <span className="text-sm text-muted">{c.zona}</span>}
                    </span>
                    {conCuenta.has(c.nombre)
                      ? <span className="text-sm text-muted">Ya tiene cuenta</span>
                      : <Link to={`/admin/cuentas/nueva?rol=comercial&comercial=${encodeURIComponent(c.nombre)}${c.zona ? `&zona=${encodeURIComponent(c.zona)}` : ''}${c.email ? `&email=${encodeURIComponent(c.email)}` : ''}`}><Button>Crear su cuenta</Button></Link>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {an.nuevas.length > 0 && (
            <Section title="Farmacias nuevas">
              <div className="rounded-xl bg-surface border border-line overflow-hidden">
                {an.nuevas.map((n, i) => (
                  <label key={n.envio.slug} className={cn('px-3.5 py-2.5 flex items-start gap-3 cursor-pointer', i < an.nuevas.length - 1 && 'border-b border-line-soft')}>
                    <Marca activa={!fuera.has(`nueva:${n.envio.slug}`)} onClick={() => alternar(`nueva:${n.envio.slug}`)} etiqueta={`Dar de alta ${n.nombre}`} />
                    <span className="flex-1 min-w-0 flex flex-col">
                      <span className="text-base font-medium text-ink">{n.nombre}</span>
                      <span className="text-sm text-muted">{n.detalle}</span>
                      <span className="text-sm text-muted">{[formacionLabel(n.envio.formacion || undefined), legible('Fecha', n.envio.formacion_fecha), n.envio.formacion_hora].filter((x) => x && x !== '—').join(' · ')}</span>
                    </span>
                  </label>
                ))}
              </div>
            </Section>
          )}

          {an.cambios.length > 0 && (
            <Section title="Farmacias que cambian">
              <div className="rounded-xl bg-surface border border-line overflow-hidden">
                {an.cambios.map((c, i) => (
                  <label key={c.slug} className={cn('px-3.5 py-2.5 flex items-start gap-3 cursor-pointer', i < an.cambios.length - 1 && 'border-b border-line-soft')}>
                    <Marca activa={!fuera.has(c.slug)} onClick={() => alternar(c.slug)} etiqueta={`Actualizar ${c.nombre}`} />
                    <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <span className="text-base font-medium text-ink">{c.nombre}</span>
                      {c.campos.map((k) => (
                        <span key={k.campo} className="text-sm text-muted">
                          <span className="text-ink-soft">{k.campo}:</span> <span className="line-through">{legible(k.campo, k.antes)}</span> → <span className="text-ink font-medium">{legible(k.campo, k.despues)}</span>
                        </span>
                      ))}
                    </span>
                  </label>
                ))}
              </div>
            </Section>
          )}

          {an.avisos.length > 0 && (
            <Section title="Avisos">
              <div className="rounded-xl bg-warn-wash border border-warn-line px-4 py-3 flex flex-col gap-1.5">
                {an.avisos.map((a, i) => <p key={i} className="text-sm text-[#7A5A18]"><span className="font-semibold">{a.nombre}:</span> {a.texto}</p>)}
              </div>
            </Section>
          )}

          {an.errores.length > 0 && (
            <Section title="Filas con errores (no se guardan)">
              <div className="rounded-xl bg-danger-wash border border-danger-line px-4 py-3 flex flex-col gap-1.5">
                {an.errores.map((e, i) => <p key={i} className="text-sm text-[#7E2323]"><span className="font-semibold">{e.nombre}</span> (hoja «{e.hoja}», fila {e.fila}): {e.motivo}</p>)}
              </div>
            </Section>
          )}

          <div className="sticky bottom-0 z-10 py-3 bg-canvas border-t border-line flex flex-wrap items-center gap-3">
            <Button variant="primary" size="lg" disabled={guardando || total === 0} onClick={() => void guardar()}>{guardando ? 'Guardando…' : total === 0 ? 'No hay nada que guardar' : `Guardar ${total} ${total === 1 ? 'cambio' : 'cambios'}`}</Button>
            <Button size="lg" disabled={guardando} onClick={() => { setAn(null); setArchivo(null); setFuera(new Set()) }}>Cancelar</Button>
          </div>
        </>
      )}

      <Section title="Excels subidos">
        {subidos === null ? null : subidos.length === 0 ? (
          <p className="text-base text-muted">Todavía no se ha subido ningún Excel.</p>
        ) : (
          <div className="rounded-xl bg-surface border border-line overflow-hidden">
            {subidos.map((s, i) => (
              <div key={s.id} className={cn('min-h-[52px] px-3.5 py-2 flex items-center gap-3', i < subidos.length - 1 && 'border-b border-line-soft')}>
                <span className="flex-1 min-w-0 flex flex-col">
                  <span className="text-base font-medium text-ink truncate">{s.nombre}</span>
                  <span className="text-sm text-muted">{fecha(s.created_at)}{s.resumen ? ` · ${s.resumen.aplicadas ?? 0} actualizadas, ${s.resumen.nuevas ?? 0} nuevas` : ''}</span>
                </span>
                <Button icon={<Download size={13} />} className="shrink-0" onClick={() => void descargar(s)}>Descargar</Button>
              </div>
            ))}
          </div>
        )}
      </Section>
    </Screen>
  )
}
