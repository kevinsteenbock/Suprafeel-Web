import { useLayoutEffect, useState, type RefObject } from 'react'

const MARGEN = 16

/**
 * Coloca un desplegable bajo su botón sin que se salga nunca de la pantalla. `align` es el lado
 * preferido (el menú pegado al borde izquierdo o al derecho del botón); si por ese lado no cabe,
 * se corre lo justo para quedar a 16 px del borde. Devuelve `left` (relativo al contenedor del
 * botón) y la x de la flechita dentro del menú, o null mientras está cerrado.
 */
export function useMenuPos(open: boolean, anchor: RefObject<HTMLElement | null>, menu: RefObject<HTMLElement | null>, align: 'left' | 'right') {
  const [pos, setPos] = useState<{ left: number; arrow: number } | null>(null)

  useLayoutEffect(() => {
    if (!open) { setPos(null); return }
    const medir = () => {
      const a = anchor.current
      const m = menu.current
      if (!a || !m) return
      const r = a.getBoundingClientRect()
      const vw = document.documentElement.clientWidth
      const w = m.offsetWidth
      const deseado = align === 'right' ? r.right - w : r.left
      const left = Math.max(MARGEN, Math.min(deseado, vw - MARGEN - w))
      // Flechita a 14 px del borde del botón por el lado elegido, siempre dentro del menú.
      const punta = align === 'right' ? r.right - 14 - 12 : r.left + 14
      const arrow = Math.max(10, Math.min(punta - left, w - 22))
      setPos((p) => (p && p.left === left - r.left && p.arrow === arrow ? p : { left: left - r.left, arrow }))
    }
    medir()
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [open, align, anchor, menu])

  return pos
}
