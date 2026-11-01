import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Columna principal con ancho «natural» fijo: crece para llenar el hueco (flex 1 1 0), pero no
 * depende de lo largo que sea el texto. Así todas las filas miden lo mismo aunque un nombre sea
 * más largo y la tabla, al deslizarla de lado en el móvil, mide siempre lo mismo.
 */
export const colPrincipal = (min: number): CSSProperties => ({ flex: '1 1 0', width: 0, minWidth: min })

/** Difuminado del borde derecho mientras quede tabla por ver a la derecha (avisa de que se desliza). */
const FUNDIDO: CSSProperties = {
  WebkitMaskImage: 'linear-gradient(to right, #000 0, #000 calc(100% - 28px), transparent 100%)',
  maskImage: 'linear-gradient(to right, #000 0, #000 calc(100% - 28px), transparent 100%)',
}

/** ¿Queda contenido escondido a la derecha? Se recalcula al deslizar y al cambiar de tamaño. */
function useHayMasALaDerecha() {
  const ref = useRef<HTMLDivElement>(null)
  const [mas, setMas] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const medir = () => setMas(el.scrollWidth - el.clientWidth - el.scrollLeft > 2)
    medir()
    el.addEventListener('scroll', medir, { passive: true })
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(medir) : null
    ro?.observe(el)
    if (el.firstElementChild) ro?.observe(el.firstElementChild)
    return () => { el.removeEventListener('scroll', medir); ro?.disconnect() }
  }, [])
  return { ref, mas }
}

/**
 * Tarjeta de tabla. Las filas van dentro de un mismo ancho común (el de la fila más ancha, o el de
 * la tarjeta si cabe todo): cabecera y filas miden igual, la columna principal (flex-1) reparte lo
 * mismo en todas y cada columna cae debajo de su cabecera también al deslizar la tabla de lado.
 * Las filas `Tr wrap` siguen partiéndose en dos líneas en el móvil (no fijan ancho mínimo).
 * Si la tabla no cabe, el borde derecho se difumina hasta que se desliza al final.
 */
export function TableCard({ children, footer, footerRight, className }: { children: ReactNode; footer?: ReactNode; footerRight?: ReactNode; className?: string }) {
  const { ref, mas } = useHayMasALaDerecha()
  return (
    <div className={cn('rounded-xl bg-surface border border-line shadow-card overflow-hidden flex flex-col', className)}>
      <div ref={ref} style={mas ? FUNDIDO : undefined} className={cn('overflow-x-auto', mas && 'scroll-hint')}>
        <div className="w-fit min-w-full">{children}</div>
      </div>
      {(footer || footerRight) && (
        <div className="min-h-[46px] lg:h-[46px] px-4 py-2 lg:py-0 max-lg:gap-3 bg-chrome flex items-center justify-between mt-auto">
          <span className="min-w-0 text-sm text-muted">{footer}</span>
          {footerRight && <span className="shrink-0 text-right text-sm font-medium text-accent">{footerRight}</span>}
        </div>
      )}
    </div>
  )
}

export function THead({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('h-8 px-4 gap-[14px] bg-chrome border-b border-line flex items-center min-w-max', className)}>{children}</div>
}

/** `min`: cabecera de la columna principal con ancho natural fijo (ver `colPrincipal`); úsalo igual en `TdMain`. */
export function Th({ children, className, align = 'left', min }: { children?: ReactNode; className?: string; align?: 'left' | 'right' | 'center'; min?: number }) {
  return (
    <span style={min !== undefined ? colPrincipal(min) : undefined} className={cn('label truncate', align === 'right' && 'text-right', align === 'center' && 'text-center', className)}>{children}</span>
  )
}

/**
 * `wrap`: filas de lista simple (sin cabecera de columnas) que en móvil se reparten en dos líneas en vez de obligar a deslizar de lado.
 * `wrap="lg"`: lo mismo hasta 1024 px (también en la tableta, donde las columnas tampoco caben).
 */
export function Tr({ children, className, onClick, active, tone, height = 54, last, wrap }: {
  children: ReactNode; className?: string; onClick?: () => void; active?: boolean; tone?: 'accent' | 'danger'; height?: number; last?: boolean; wrap?: boolean | 'lg'
}) {
  return (
    <div
      style={wrap ? { minHeight: height } : { height }}
      onClick={onClick}
      className={cn(
        'px-4 gap-[14px] flex items-center shrink-0',
        wrap === 'lg' ? 'flex-wrap py-2.5 lg:py-0 lg:flex-nowrap lg:min-w-max' : wrap ? 'flex-wrap py-2.5 sm:py-0 sm:flex-nowrap sm:min-w-max' : 'min-w-max',
        !last && 'border-b border-line-soft',
        onClick && 'cursor-pointer hover:bg-canvas',
        active && 'bg-accent-wash border-accent-line',
        tone === 'danger' && 'bg-danger-wash',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function Td({ children, className, align = 'left' }: { children?: ReactNode; className?: string; align?: 'left' | 'right' | 'center' }) {
  return (
    <span className={cn('text-md text-ink-soft truncate', align === 'right' && 'text-right', align === 'center' && 'text-center', className)}>{children}</span>
  )
}

/**
 * Celda principal: nombre + meta. `min`: ancho natural fijo (ver `colPrincipal`), el mismo que en su `Th`.
 * `wrap`: en el teléfono (< 640 px; con "lg", < 1024 px) el nombre y la meta bajan de línea en vez de
 * cortarse con «…» (para filas `Tr wrap`, que ya se reparten en dos líneas).
 */
export function TdMain({ title, meta, avatar, className, metaTone, min, wrap }: { title: ReactNode; meta?: ReactNode; avatar?: ReactNode; className?: string; metaTone?: 'faint' | 'accent' | 'warn' | 'danger'; min?: number; wrap?: boolean | 'lg' }) {
  const mt = { faint: 'text-faint', accent: 'text-accent-deep', warn: 'text-warn', danger: 'text-danger' }[metaTone ?? 'faint']
  const corte = wrap === 'lg' ? 'lg:truncate break-words' : wrap ? 'sm:truncate break-words' : 'truncate'
  return (
    <div style={min !== undefined ? colPrincipal(min) : undefined} className={cn('flex-1 min-w-0 flex items-center gap-3', className)}>
      {avatar}
      <div className="flex flex-col min-w-0">
        <span className={cn('text-base font-medium text-ink', corte)}>{title}</span>
        {meta && <span className={cn('text-xs mt-[2px]', corte, mt)}>{meta}</span>}
      </div>
    </div>
  )
}

/**
 * Barra de avance. `width` en px o 'full' (todo el ancho del hueco). Nunca pasa del ancho de su
 * contenedor (max-width 100 %), así que un ancho exagerado se queda en el del hueco y el relleno
 * se calcula sobre lo que se ve.
 */
export function Bar({ value, tone = 'ok', width = 54, className }: { value: number; tone?: 'ok' | 'warn' | 'accent' | 'danger' | 'ink'; width?: number | 'full'; className?: string }) {
  const fill = { ok: 'bg-ok', warn: 'bg-warn', accent: 'bg-accent', danger: 'bg-danger', ink: 'bg-ink' }[tone]
  return (
    <span style={width === 'full' ? { maxWidth: '100%' } : { width, maxWidth: '100%' }} className={cn('h-[5px] rounded-[3px] bg-chrome-deep inline-flex overflow-hidden shrink-0', width === 'full' && 'w-full', className)}>
      <span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} className={cn('h-full rounded-[3px]', fill)} />
    </span>
  )
}
