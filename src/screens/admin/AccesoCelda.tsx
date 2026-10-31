import type { CSSProperties, ReactNode } from 'react'
import type { Usuario } from '@/app/datos'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { cn } from '@/lib/cn'

/**
 * Columna principal de una tabla con columnas fijas: crece para llenar el hueco, pero su ancho
 * «natural» es fijo (width 0 + min-width). Así todas las filas miden lo mismo aunque un nombre sea
 * más largo, y las columnas no se descuadran cuando la tabla se desliza de lado.
 */
export const principal = (min: number): CSSProperties => ({ flex: '1 1 0', width: 0, minWidth: min })

export function Principal({ min, children }: { min: number; children: ReactNode }) {
  return <div style={principal(min)} className="flex items-center">{children}</div>
}

/** Vista inicial de las listas: tarjetas en el móvil (las columnas no caben), lista en lo demás. */
export const vistaInicial = (): 'list' | 'cards' => (typeof window !== 'undefined' && window.innerWidth < 640 ? 'cards' : 'list')

/** Estado de acceso: «Con acceso» y el correo de quien entra, o «Sin acceso» y el botón para darlo. */
export function AccesoCelda({ cuentas, onDar, className, align = 'end' }: { cuentas: Usuario[]; onDar: () => void; className?: string; align?: 'end' | 'between' }) {
  if (cuentas.length > 0) {
    const extra = cuentas.length > 1 ? ` +${cuentas.length - 1}` : ''
    return (
      <div className={cn('flex min-w-0', align === 'end' ? 'flex-col items-end' : 'items-center justify-between gap-2', className)}>
        <Badge tone="ok">Con acceso</Badge>
        <span title={cuentas.map((u) => u.email).join('\n')} className={cn('text-xs text-faint truncate max-w-full', align === 'end' && 'mt-[3px]')}>{cuentas[0]!.email}{extra}</span>
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
