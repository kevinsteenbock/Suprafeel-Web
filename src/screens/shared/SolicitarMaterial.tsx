import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { Check, ImagePlus, X } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useBase } from '@/app/store'
import { API_URL, useAuth } from '@/app/auth'
import { useDatos } from '@/app/datos'
import { nombreDe, type Pharmacy } from '@/data/pharmacies'
import { MATERIALES, materialPorId } from '@/data/material'
import { Notice, Toolbar } from '@/ui/Page'
import { Field, Input } from '@/ui/Field'
import { Button } from '@/ui/Button'

const direccionDe = (f?: Pharmacy) => (f ? [f.address, [f.postal, f.city].filter(Boolean).join(' ')].filter(Boolean).join(', ') : '')
const soloCifras = (v: string) => v.replace(/[^\d]/g, '')

/** Reduce la foto a 1600 px en JPEG: las del móvil pesan demasiado para mandarlas tal cual. */
async function prepararFoto(archivo: File): Promise<Blob> {
  const bitmap = await createImageBitmap(archivo)
  const escala = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height))
  const lienzo = document.createElement('canvas')
  lienzo.width = Math.round(bitmap.width * escala)
  lienzo.height = Math.round(bitmap.height * escala)
  lienzo.getContext('2d')?.drawImage(bitmap, 0, 0, lienzo.width, lienzo.height)
  bitmap.close()
  return new Promise((ok, mal) => lienzo.toBlob((b) => (b ? ok(b) : mal(new Error())), 'image/jpeg', 0.82))
}

/** Pedir material: farmacia, contacto, dirección, qué y cuántas unidades. El vinilo a medida añade medidas, sitio y foto. */
export function SolicitarMaterial() {
  const { id } = useParams()
  const base = useBase()
  const { user, token, logout } = useAuth()
  const { farmacias } = useDatos()
  const esFarmacia = user?.role === 'farmacia'
  const propia = esFarmacia ? farmacias.find((f) => f.id === user?.pharmacy_slug) : farmacias.length === 1 ? farmacias[0] : undefined

  const [materialId, setMaterialId] = useState(id ?? '')
  const [slug, setSlug] = useState(propia?.id ?? '')
  const [contacto, setContacto] = useState(user?.name ?? '')
  const [direccion, setDireccion] = useState(direccionDe(propia))
  const [unidades, setUnidades] = useState('1')
  const [ancho, setAncho] = useState('')
  const [alto, setAlto] = useState('')
  const [ubicacion, setUbicacion] = useState('')
  const [foto, setFoto] = useState<File | null>(null)
  const [vista, setVista] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [hecho, setHecho] = useState<{ correo: string } | null>(null)

  useEffect(() => {
    if (!foto) { setVista(''); return }
    const url = URL.createObjectURL(foto)
    setVista(url)
    return () => URL.revokeObjectURL(url)
  }, [foto])

  // Un error antiguo no se queda en pantalla mientras se corrige.
  useEffect(() => setError(''), [materialId, slug, contacto, direccion, unidades, ancho, alto, ubicacion, foto])

  const material = materialPorId(materialId)
  const volver = `${base}/material`
  if (!materialPorId(id)) return <Navigate to={volver} replace />
  const toolbar = <Toolbar back={volver} crumbs={[{ label: 'Material publicitario', to: volver }, { label: 'Solicitar' }]} />

  const elegirFarmacia = (v: string) => {
    setSlug(v)
    setDireccion(direccionDe(farmacias.find((f) => f.id === v)))
  }

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    if (enviando) return
    const uds = Number(unidades)
    if (!slug) return setError('Elige la farmacia.')
    if (contacto.trim().length < 2) return setError('Escribe la persona de contacto.')
    if (direccion.trim().length < 5) return setError('Escribe la dirección de entrega.')
    if (!(uds >= 1 && uds <= 999)) return setError('Las unidades tienen que estar entre 1 y 999.')
    if (material?.aMedida && (!Number(ancho) || !Number(alto))) return setError('Escribe el ancho y el alto en centímetros.')
    if (material?.aMedida && ubicacion.trim().length < 2) return setError('Di dónde se colocará el vinilo.')

    setError('')
    setEnviando(true)
    try {
      const datos = new FormData()
      datos.set('farmacia_slug', slug)
      datos.set('contacto', contacto.trim())
      datos.set('direccion', direccion.trim())
      datos.set('material', materialId)
      datos.set('unidades', String(uds))
      if (material?.aMedida) {
        datos.set('ancho_cm', ancho)
        datos.set('alto_cm', alto)
        datos.set('ubicacion', ubicacion.trim())
        if (foto) {
          const lista = await prepararFoto(foto).catch(() => null)
          if (!lista) { setError('No hemos podido leer esa foto. Prueba con otra o envía la solicitud sin foto.'); return }
          datos.set('foto', lista, 'espacio.jpg')
        }
      }
      const res = await fetch(`${API_URL}/material/solicitudes`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: datos })
      const body = await res.json().catch(() => null)
      if (res.status === 401) { logout(); return }
      if (!res.ok) { setError(body?.message || 'No hemos podido enviar la solicitud. Inténtalo de nuevo en un momento.'); return }
      setHecho({ correo: body?.correo ?? '' })
    } catch {
      setError('No hay conexión con Suprafeel. Revisa tu conexión e inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  if (hecho) {
    return (
      <Screen toolbar={toolbar}>
        <div className="rounded-xl bg-surface border border-line shadow-card px-6 py-12 flex flex-col items-center text-center">
          <span className="h-10 w-10 rounded-full bg-ok-wash text-ok inline-flex items-center justify-center"><Check size={18} /></span>
          <h1 className="mt-4 text-lg font-semibold text-ink">Solicitud recibida</h1>
          <p className="mt-1.5 text-base text-muted max-w-[420px]">{hecho.correo === 'enviado' ? 'El equipo de Suprafeel ya la tiene y te hemos enviado la confirmación por correo.' : 'El equipo de Suprafeel la verá en su consola. Puedes seguirla en «Tus solicitudes».'}</p>
          <Link to={volver} className="mt-6"><Button variant="primary" size="lg">Volver a Material publicitario</Button></Link>
        </div>
      </Screen>
    )
  }

  return (
    <Screen toolbar={toolbar}>
      <form onSubmit={enviar} noValidate className="w-full max-w-[560px] flex flex-col gap-4">
        <h1 className="text-h1 font-semibold tracking-tight text-ink">Solicitar material</h1>

        <Field label="Material" required>
          <select aria-label="Material" value={materialId} onChange={(e) => setMaterialId(e.target.value)} className="field text-base text-ink">
            {MATERIALES.map((m) => <option key={m.id} value={m.id}>{m.titulo}</option>)}
          </select>
        </Field>

        <Field label="Farmacia" required>
          {esFarmacia ? (
            <Input value={propia ? nombreDe(propia) : 'Tu cuenta no tiene farmacia: escribe a info@suprafeel.es'} />
          ) : (
            <select aria-label="Farmacia" value={slug} onChange={(e) => elegirFarmacia(e.target.value)} className="field text-base text-ink">
              <option value="">Elige una farmacia</option>
              {farmacias.map((f) => <option key={f.id} value={f.id}>{nombreDe(f)} · {f.city}</option>)}
            </select>
          )}
        </Field>

        <Field label="Persona de contacto" required><Input value={contacto} onChange={setContacto} /></Field>
        <Field label="Dirección de entrega" required><Input value={direccion} onChange={setDireccion} /></Field>
        <Field label="Unidades" required className="max-w-[140px]"><Input value={unidades} onChange={(v) => setUnidades(soloCifras(v).slice(0, 3))} /></Field>

        {material?.aMedida && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ancho (cm)" required><Input value={ancho} onChange={(v) => setAncho(soloCifras(v).slice(0, 4))} /></Field>
              <Field label="Alto (cm)" required><Input value={alto} onChange={(v) => setAlto(soloCifras(v).slice(0, 4))} /></Field>
            </div>
            <Field label="Dónde se colocará" required><Input value={ubicacion} placeholder="Escaparate, mostrador…" onChange={setUbicacion} /></Field>
            <Field label="Foto del espacio (opcional)">
              {vista ? (
                <div className="relative self-start">
                  <img src={vista} alt="Foto del espacio" className="h-24 w-24 rounded-lg border border-line object-cover" />
                  <button type="button" onClick={() => setFoto(null)} aria-label="Quitar la foto" className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-ink text-white inline-flex items-center justify-center"><X size={13} /></button>
                </div>
              ) : (
                <label className="h-11 self-start rounded-lg border border-dashed border-line bg-chrome px-4 inline-flex items-center gap-2 text-base font-medium text-ink-soft cursor-pointer hover:bg-chrome-deep/60">
                  <ImagePlus size={15} />Añadir foto
                  <input type="file" accept="image/*" className="sr-only" onChange={(e) => setFoto(e.target.files?.[0] ?? null)} />
                </label>
              )}
            </Field>
          </>
        )}

        {error && <Notice tone="danger">{error}</Notice>}
        <div><Button type="submit" variant="primary" size="lg" disabled={enviando} className="h-11 px-6">{enviando ? 'Enviando…' : 'Enviar solicitud'}</Button></div>
      </form>
    </Screen>
  )
}
