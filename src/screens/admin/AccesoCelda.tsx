import type { CSSProperties, ReactNode } from 'react'
import type { Usuario } from '@/app/datos'
import type { PerRow } from '@/ui/Vista'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { cn } from '@/lib/cn'

/**
 * Columna principal de una tabla con columnas fijas: crece para llenar el hueco, pero su ancho
 * «natural» es fijo (width 0 + min-width). Así todas las filas miden lo mismo aunque un nombre sea
 * más largo, y las columnas no se descuadran cuando la tabla se desliza de lado.
 */
export const principal = (min: number): CSSProperties => ({ flex: '1 1 0', width: 0, minWidth: min })

/**
 * Fila de lista con columnas. Desde lg, una fila de tabla igual que Tr (una línea, 54 px). Por debajo
 * (móvil y tableta, donde las columnas no caben ni a 768 px) se reparte en varias líneas: lo principal
 * arriba y las cifras debajo, sin deslizar de lado. Las columnas de escritorio llevan `hidden lg:…`.
 */
export function FilaLista({ children, onClick, tone, active, last, height = 54 }: { children: ReactNode; onClick?: () => void; tone?: 'danger'; active?: boolean; last?: boolean; height?: number }) {
  return (
    <div
      style={{ minHeight: height }}
      onClick={onClick}
      className={cn(
        'px-4 gap-x-[14px] gap-y-2 flex flex-wrap items-center shrink-0 py-2.5 lg:py-0 lg:flex-nowrap lg:min-w-max',
        !last && 'border-b border-line-soft',
        onClick && 'cursor-pointer hover:bg-canvas',
        active && 'bg-accent-wash border-accent-line',
        tone === 'danger' && 'bg-danger-wash',
      )}
    >
      {children}
    </div>
  )
}

export function Principal({ min, children }: { min: number; children: ReactNode }) {
  return <div style={principal(min)} className="flex items-center">{children}</div>
}

/** Por debajo de 1024 px (móvil y tableta) las columnas de las listas no caben: a 768 se esconden de 29 a 233 px. */
const estrecha = () => typeof window !== 'undefined' && window.innerWidth < 1024

/** Vista inicial de las listas: tarjetas en el móvil y la tableta, lista en el escritorio. */
export const vistaInicial = (): 'list' | 'cards' => (estrecha() ? 'cards' : 'list')

/** Tarjetas por fila al empezar: en el móvil y la tableta, las que quepan (4 por fila a 768 quedan de 170 px). */
export const porFilaInicial = (n: PerRow): PerRow => (estrecha() ? 'fit' : n)

/** Estado de acceso: «Con acceso» y el correo de quien entra, o «Sin acceso» y el botón para darlo. */
export function AccesoCelda({ cuentas, onDar, onEditar, className, align = 'end' }: { cuentas: Usuario[]; onDar: () => void; /** Abre la ficha de la cuenta (nombre, zona…). */ onEditar?: () => void; className?: string; align?: 'end' | 'between' }) {
  if (cuentas.length > 0) {
    const extra = cuentas.length > 1 ? ` +${cuentas.length - 1}` : ''
    const datos = (
      <div className={cn('flex min-w-0', align === 'end' ? 'flex-col items-end' : 'items-center justify-between gap-2', !onEditar && className, onEditar && 'flex-1')}>
        <Badge tone="ok">Con acceso</Badge>
        <span title={cuentas.map((u) => u.email).join('\n')} className={cn('text-xs text-faint truncate max-w-full', align === 'end' && 'mt-[3px]')}>{cuentas[0]!.email}{extra}</span>
      </div>
    )
    if (!onEditar) return datos
    return (
      <div className={cn('flex items-center gap-2 min-w-0', className)}>
        {align === 'end' && <Button size="sm" onClick={(e) => { e.stopPropagation(); onEditar() }}>Ficha</Button>}
        {datos}
        {align === 'between' && <Button size="sm" onClick={(e) => { e.stopPropagation(); onEditar() }}>Ficha</Button>}
      </div>
    )
  }
  return (
    <div className={cn('flex items-center gap-2 min-w-0', align === 'end' ? 'justify-end' : 'justify-between', className)}>
      <Badge tone="neutral">Sin acceso</Badge>
      <Button size="sm" onClick={(e) => { e.stopPropagation(); onDar() }}>Dar acceso</Button>
    </div>
  )
}
