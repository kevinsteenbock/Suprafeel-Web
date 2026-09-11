import { cn } from '@/lib/cn'

export type Art = 'bottle' | 'dropper' | 'jar' | 'sachet' | 'box' | 'tube'

/** Silueta de producto en línea, como en el Paper: trazo gris y tapón/etiqueta en arcilla suave. */
export function ProductArt({ art = 'bottle', className, size = 80, stroke = '#B0AAA1', fill = '#F7E7E0', bg = true, filled }: {
  art?: Art; className?: string; size?: number; stroke?: string; fill?: string; bg?: boolean; filled?: boolean
}) {
  const s = 1.6
  const body = filled ? '#B4502E' : 'none'
  const bodyStroke = filled ? '#B4502E' : stroke
  const cap = filled ? '#8E3B20' : fill
  const label = filled ? '#F7E7E0' : 'none'
  const inner = (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" strokeWidth={s} strokeLinejoin="round" strokeLinecap="round">
      {art === 'bottle' && (
        <>
          <rect x="39" y="12" width="22" height="12" rx="2" fill={cap} stroke={filled ? cap : stroke} />
          <path d="M33 30 h34 a5 5 0 0 1 5 5 v45 a5 5 0 0 1 -5 5 h-34 a5 5 0 0 1 -5 -5 v-45 a5 5 0 0 1 5 -5 z" fill={body} stroke={bodyStroke} />
          <rect x="37" y="46" width="26" height="22" rx="3" fill={label} stroke={filled ? 'none' : stroke} />
        </>
      )}
      {art === 'dropper' && (
        <>
          <rect x="43" y="10" width="14" height="16" rx="2" fill={cap} stroke={filled ? cap : stroke} />
          <path d="M37 32 h26 a4 4 0 0 1 4 4 v46 a4 4 0 0 1 -4 4 h-26 a4 4 0 0 1 -4 -4 v-46 a4 4 0 0 1 4 -4 z" fill={body} stroke={bodyStroke} />
          <rect x="41" y="50" width="18" height="18" rx="3" fill={label} stroke={filled ? 'none' : stroke} />
        </>
      )}
      {art === 'jar' && (
        <>
          <rect x="28" y="16" width="44" height="12" rx="2" fill={cap} stroke={filled ? cap : stroke} />
          <path d="M31 32 h38 a4 4 0 0 1 4 4 v44 a5 5 0 0 1 -5 5 h-36 a5 5 0 0 1 -5 -5 v-44 a4 4 0 0 1 4 -4 z" fill={body} stroke={bodyStroke} />
          <rect x="37" y="46" width="26" height="22" rx="3" fill={label} stroke={filled ? 'none' : stroke} />
        </>
      )}
      {art === 'sachet' && (
        <>
          <path d="M30 22 h40 a3 3 0 0 1 3 3 v52 a3 3 0 0 1 -3 3 h-40 a3 3 0 0 1 -3 -3 v-52 a3 3 0 0 1 3 -3 z" fill={body} stroke={bodyStroke} />
          <path d="M27 30 h46" stroke={bodyStroke} />
          <rect x="38" y="44" width="24" height="22" rx="3" fill={label} stroke={filled ? 'none' : stroke} />
        </>
      )}
      {art === 'box' && (
        <>
          <rect x="24" y="26" width="52" height="52" rx="4" fill={body} stroke={bodyStroke} />
          <path d="M24 40 h52" stroke={bodyStroke} />
          <rect x="36" y="48" width="28" height="20" rx="3" fill={label} stroke={filled ? 'none' : stroke} />
        </>
      )}
      {art === 'tube' && (
        <>
          <rect x="40" y="14" width="20" height="10" rx="2" fill={cap} stroke={filled ? cap : stroke} />
          <path d="M34 28 h32 v40 l-4 14 h-24 l-4 -14 z" fill={body} stroke={bodyStroke} />
          <rect x="40" y="40" width="20" height="18" rx="3" fill={label} stroke={filled ? 'none' : stroke} />
        </>
      )}
    </svg>
  )
  if (!bg) return inner
  return <div className={cn('bg-chrome flex items-center justify-center', className)}>{inner}</div>
}

/** Miniatura cuadrada con iniciales (para tablas) */
export function Thumb({ code, tone = 'neutral', size = 30, className }: { code: string; tone?: 'neutral' | 'accent' | 'ok' | 'violet' | 'sand'; size?: number; className?: string }) {
  const t = {
    neutral: 'bg-chrome-deep text-ink-soft',
    accent: 'bg-accent-wash text-accent-deep',
    ok: 'bg-ok-wash text-ok',
    violet: 'bg-[#E4DEE8] text-[#5F5273]',
    sand: 'bg-[#E8E2D6] text-[#7A6A4C]',
  }[tone]
  return (
    <span style={{ width: size, height: size, fontSize: size >= 30 ? 9.5 : 8.5 }} className={cn('rounded-[7px] inline-flex items-center justify-center font-bold shrink-0 tracking-[0.02em]', t, className)}>
      {code}
    </span>
  )
}

export function FileBadge({ kind }: { kind: 'PDF' | 'A5' | 'URL' | 'MP3' | 'MP4' | 'PNG' | 'ZIP' | 'DOC' | 'CUR' }) {
  const t: Record<string, string> = {
    PDF: 'bg-danger-wash text-danger', A5: 'bg-chrome-deep text-ink-soft', URL: 'bg-chrome-deep text-ink-soft', MP3: 'bg-chrome-deep text-ink-soft',
    MP4: 'bg-ink text-white', PNG: 'bg-accent-wash text-accent-deep', ZIP: 'bg-chrome-deep text-ink-soft', DOC: 'bg-chrome-deep text-ink-soft', CUR: 'bg-warn-wash text-warn',
  }
  return <span className={cn('h-[26px] w-[26px] rounded-[5px] inline-flex items-center justify-center text-[8.5px] font-bold shrink-0', t[kind])}>{kind}</span>
}
