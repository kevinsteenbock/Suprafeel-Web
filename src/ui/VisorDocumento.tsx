import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Download, X } from 'lucide-react'
import { call, useAuth } from '@/app/auth'
import { Button } from './Button'

interface Abierto { titulo: string; paginas: string[]; pdf: string }

/**
 * Documento en grande, página a página, con el fondo oscurecido. Sus enlaces se piden al abrirlo y
 * caducan en una hora: los archivos son privados. Escape, la × o un clic fuera lo cierran.
 */
export function VisorDocumento({ slug, titulo, onClose }: { slug: string; titulo: string; onClose: () => void }) {
  const { token } = useAuth()
  const [doc, setDoc] = useState<Abierto | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let vigente = true
    call(`/documentos/${encodeURIComponent(slug)}`, {}, token)
      .then(({ res, body }) => {
        if (!vigente) return
        if (!res.ok || !Array.isArray(body?.paginas)) throw new Error()
        setDoc({ titulo: body.titulo || titulo, paginas: body.paginas, pdf: body.pdf || '' })
      })
      .catch(() => vigente && setError('No hemos podido abrir el documento. Inténtalo de nuevo en un momento.'))
    return () => { vigente = false }
  }, [slug, titulo, token])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const descarga = doc?.pdf || doc?.paginas[0]

  return createPortal(
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/75" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={titulo} className="relative m-auto w-full lg:w-[min(calc(100vw-64px),1040px)] h-dvh lg:h-[calc(100dvh-48px)] bg-canvas lg:rounded-xl flex flex-col overflow-hidden">
        <header className="min-h-[52px] shrink-0 px-4 py-2 bg-surface border-b border-line flex items-center gap-3">
          <span className="flex-1 min-w-0 text-base font-semibold text-ink line-clamp-2">{titulo}</span>
          {descarga && (
            <a href={descarga} target="_blank" rel="noopener noreferrer" className="shrink-0">
              <Button variant="primary" size="lg" icon={<Download size={13} />}>Descargar</Button>
            </a>
          )}
          <button onClick={onClose} aria-label="Cerrar" className="h-9 w-9 shrink-0 rounded-full bg-chrome text-ink-soft inline-flex items-center justify-center hover:bg-chrome-deep"><X size={15} strokeWidth={2.4} /></button>
        </header>
        <div className="flex-1 min-h-0 overflow-y-auto p-3 lg:p-5 flex flex-col items-center gap-3">
          {error && <p role="alert" className="my-auto text-base text-muted text-center max-w-[360px]">{error}</p>}
          {!doc && !error && <p className="my-auto text-base text-muted">Abriendo…</p>}
          {doc?.paginas.map((src, i) => (
            <img key={src} src={src} alt={`Página ${i + 1} de ${doc.paginas.length}`} loading={i < 2 ? 'eager' : 'lazy'} className="w-full max-w-[960px] h-auto rounded-md border border-line bg-white" />
          ))}
        </div>
      </div>
    </div>,
    document.body,
  )
}
