import { cn } from '@/lib/cn'
import type { Material } from '@/data/plv'

/** Iconos de material PLV en línea (expositor, cartel, folleto, stopper, bolsa, móvil, bata) */
export function MaterialArt({ art, size = 72, className, stroke = '#B0AAA1', fill = '#F7E7E0' }: { art: Material['art']; size?: number; className?: string; stroke?: string; fill?: string }) {
  const s = 1.8
  return (
    <div className={cn('bg-chrome flex items-center justify-center', className)}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke={stroke} strokeWidth={s} strokeLinejoin="round" strokeLinecap="round">
        {art === 'shelf' && (<><path d="M30 22 L50 12 L70 22 V82 H30 Z" /><path d="M30 42 H70 M30 62 H70" /><rect x="38" y="30" width="24" height="7" fill={fill} stroke="none" /></>)}
        {art === 'poster' && (<><rect x="30" y="14" width="40" height="72" rx="2" /><rect x="38" y="24" width="24" height="18" fill={fill} stroke="none" /><path d="M38 52 H62 M38 60 H58 M38 68 H54" /></>)}
        {art === 'leaflet' && (<><path d="M26 24 L50 18 L74 24 V78 L50 72 L26 78 Z" /><path d="M50 18 V72" /><rect x="33" y="34" width="12" height="10" fill={fill} stroke="none" /></>)}
        {art === 'stopper' && (<><rect x="18" y="30" width="64" height="34" rx="3" /><path d="M18 64 V80 M82 64 V80" /><rect x="30" y="40" width="20" height="14" fill={fill} stroke="none" /></>)}
        {art === 'bag' && (<><path d="M30 34 H70 L74 84 H26 Z" /><path d="M40 34 V26 a10 10 0 0 1 20 0 V34" /><rect x="44" y="52" width="12" height="12" fill={fill} stroke="none" /></>)}
        {art === 'phone' && (<><rect x="34" y="12" width="32" height="76" rx="5" /><rect x="40" y="28" width="20" height="30" fill={fill} stroke="none" /><path d="M46 76 H54" /></>)}
        {art === 'shirt' && (<><path d="M36 20 L50 28 L64 20 L82 30 L74 44 L68 40 V84 H32 V40 L26 44 L18 30 Z" /><path d="M46 52 h8 v8 h-8 z" fill={fill} stroke="none" /></>)}
      </svg>
    </div>
  )
}
