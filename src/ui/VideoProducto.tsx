import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Play, X } from 'lucide-react'
import type { Product } from '@/data/products'

type Video = NonNullable<Product['video']>

/**
 * Portada del vídeo explicativo de un producto (vídeo de formación, en horizontal) con su duración.
 * Al pulsarla se abre el vídeo en grande, en una ventana centrada con el fondo oscurecido.
 */
export function VideoProducto({ video, nombre }: { video: Video; nombre: string }) {
  const [abierto, setAbierto] = useState(false)
  return (
    <>
      <button onClick={() => setAbierto(true)} className="group w-full rounded-xl border border-line bg-surface overflow-hidden text-left hover:border-faint">
        <span className="relative block aspect-video bg-video">
          <img src={video.poster} alt="" className="h-full w-full object-cover" loading="lazy" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/15 group-hover:bg-black/25 transition-colors">
            <span className="h-12 w-12 rounded-full bg-white/90 text-accent inline-flex items-center justify-center shadow-card"><Play size={18} fill="currentColor" className="ml-0.5" /></span>
          </span>
          <span className="absolute bottom-2 right-2 h-5 px-1.5 rounded bg-black/60 text-[11px] text-white font-medium inline-flex items-center">{video.duracion}</span>
        </span>
        <span className="px-3.5 py-2.5 flex flex-col">
          <span className="text-base font-medium text-ink">Vídeo explicativo</span>
          <span className="text-xs text-muted mt-0.5">Formación sobre {nombre} · {video.duracion} min</span>
        </span>
      </button>
      {abierto && <VideoVentana video={video} nombre={nombre} onClose={() => setAbierto(false)} />}
    </>
  )
}

/** El vídeo en grande. Escape, la × o un clic fuera lo cierran. */
function VideoVentana({ video, nombre, onClose }: { video: Video; nombre: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={`Vídeo explicativo: ${nombre}`} className="relative w-[min(calc(100vw-32px),calc((100dvh-32px)*16/9),1280px)] aspect-video animate-[video_.18s_ease-out]">
        <video src={video.src} poster={video.poster} controls autoPlay playsInline className="h-full w-full rounded-xl bg-black" />
        <button onClick={onClose} aria-label="Cerrar" className="absolute top-2.5 right-2.5 h-9 w-9 rounded-full bg-black/55 text-white inline-flex items-center justify-center hover:bg-black/75">
          <X size={15} strokeWidth={2.4} />
        </button>
      </div>
      <style>{`@keyframes video{from{transform:translateY(8px) scale(.98);opacity:0}to{transform:none;opacity:1}}`}</style>
    </div>,
    document.body,
  )
}
