import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useAuth } from '@/app/auth'
import { useStore } from '@/app/store'
import { enviarMensaje } from '@/data/mensajes'
import { Notice } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Textarea } from '@/ui/Field'

/**
 * «Escribir»: ventana centrada con el fondo oscurecido. El mensaje llega al panel de administración
 * (y por correo cuando esté activado). Solo dice «enviado» si Xano lo ha guardado.
 */
export function Escribir({ inicial = '', onClose, onEnviado }: { inicial?: string; onClose: () => void; onEnviado?: () => void }) {
  const { token } = useAuth()
  const { notify } = useStore()
  const [texto, setTexto] = useState(inicial)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const enviar = async () => {
    if (texto.trim().length < 2) return setError('Escribe tu mensaje.')
    setError('')
    setEnviando(true)
    try {
      await enviarMensaje(token, { tipo: 'escribir', texto: texto.trim() })
      notify('Mensaje enviado')
      onEnviado?.()
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No hemos podido enviarlo.')
    } finally {
      setEnviando(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label="Escribir" className="w-full max-w-[480px] rounded-xl bg-surface shadow-card p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink">Escribir</h2>
          <button onClick={onClose} aria-label="Cerrar" className="h-9 w-9 -mr-1.5 rounded-full text-ink-soft inline-flex items-center justify-center hover:bg-chrome"><X size={15} /></button>
        </div>
        <Textarea rows={5} value={texto} onChange={setTexto} placeholder="Cuéntanos qué necesitas" />
        {error && <Notice tone="danger">{error}</Notice>}
        <div className="flex justify-end"><Button variant="primary" size="lg" disabled={enviando} onClick={() => void enviar()}>{enviando ? 'Enviando…' : 'Enviar'}</Button></div>
      </div>
    </div>,
    document.body,
  )
}
