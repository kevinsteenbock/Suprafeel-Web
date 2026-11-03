import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Play, X } from 'lucide-react'
import type { Product } from '@/data/products'
import { cn } from '@/lib/cn'

type Video = NonNullable<Product['video']>

/**
 * Tarjeta del vídeo explicativo de un producto: portada en vertical, título y duración. Al pulsarla
 * se abre el vídeo en una ventana centrada con el fondo oscurecido.
 */
export function VideoProducto({ video, nombre, compacta }: { video: Video; nombre: string; compacta?: boolean }) {
  const [abierto, setAbierto] = useState(false)
  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className={cn('w-full rounded-lg bg-chrome border border-line flex items-center text-left hover:bg-chrome-deep/60', compacta ? 'p-2 gap-2.5' : 'p-2.5 gap-3 rounded-xl')}
      >
        <span className={cn('relative shrink-0 rounded-md overflow-hidden bg-video', compacta ? 'h-[64px] w-[36px]' : 'h-[96px] w-[54px]')}>
          <img src={video.poster} alt="" className="h-full w-full object-cover" loading="lazy" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/20">
            <span className={cn('rounded-full bg-white/90 text-accent inline-flex items-center justify-center', compacta ? 'h-5 w-5' : 'h-7 w-7')}><Play size={compacta ? 9 : 12} fill="currentColor" className="ml-px" /></span>
          </span>
        </span>
        <span className="flex-1 min-w-0 flex flex-col">
          <span className={cn('font-medium text-ink', compacta ? 'text-md' : 'text-base')}>Vídeo explicativo</span>
          <span className="text-xs text-muted mt-0.5 line-clamp-2">{video.titulo}</span>
          <span className="text-xs text-faint mt-0.5">{video.duracion} · con subtítulos</span>
        </span>
      </button>
      {abierto && <VideoVentana video={video} nombre={nombre} onClose={() => setAbierto(false)} />}
    </>
  )
}

/**
 * El vídeo a pantalla casi completa. Va en un portal para quedar por encima de otra ventana (la del
 * catálogo) y Escape cierra solo esta: se escucha en captura y no deja que llegue a la de debajo.
 */
function VideoVentana({ video, nombre, onClose }: { video: Video; nombre: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      onClose()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={`Vídeo explicativo: ${nombre}`} className="relative h-[min(calc(100dvh-32px),86vh,calc((100vw-32px)*16/9))] aspect-[9/16] animate-[drawer_.18s_ease-out]">
        <video src={video.src} poster={video.poster} controls autoPlay playsInline className="h-full w-full rounded-xl bg-black object-contain" />
        <button onClick={onClose} aria-label="Cerrar" className="absolute top-2.5 right-2.5 h-9 w-9 rounded-full bg-black/55 text-white inline-flex items-center justify-center hover:bg-black/75">
          <X size={15} strokeWidth={2.4} />
        </button>
      </div>
      <style>{`@keyframes drawer{from{transform:translateY(8px) scale(.98);opacity:0}to{transform:none;opacity:1}}`}</style>
    </div>,
    document.body,
  )
}
