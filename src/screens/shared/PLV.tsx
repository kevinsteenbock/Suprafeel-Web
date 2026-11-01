import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Bookmark, ChevronRight, Minus, Plus, Send } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useBase, useStore } from '@/app/store'
import { useAuth } from '@/app/auth'
import { useDatos } from '@/app/datos'
import { nombreDe } from '@/data/pharmacies'
import { campaigns, materials, type Campaign } from '@/data/plv'
import { Toolbar, SearchField, PageHeader } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Tag } from '@/ui/Badge'
import { Drawer } from '@/ui/Drawer'
import { VistaButton, useVista, useGridCols } from '@/ui/Vista'
import { MaterialArt } from '@/ui/MaterialArt'
import { TableCard, Tr } from '@/ui/Table'
import { cn } from '@/lib/cn'

export function CampaignCover({ c, className, big = true }: { c: Campaign; className?: string; big?: boolean }) {
  const bg = c.dark === 'deep' ? 'bg-[#1A1918]' : c.dark === 'mid' ? 'bg-[#3A3835]' : c.dark === 'light' ? 'bg-[#E9E7E2]' : 'bg-chrome-deep'
  const word = c.dark === 'light' ? 'text-[#C8C4BC]' : c.dark ? 'text-white/45' : 'text-white'
  return (
    <div className={cn('relative overflow-hidden', bg, className)}>
      {c.cover && <img src={c.cover} alt="" className="absolute inset-0 h-full w-full object-cover" />}
      {c.cover && <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />}
      <Tag tone={c.status === 'FINALIZADA' ? 'muted' : 'glass'} className={cn('absolute top-4 left-4', c.dark === 'light' && 'bg-white/70 text-muted')}>{c.status}</Tag>
      <span className={cn('absolute left-4 bottom-3 font-semibold tracking-tight leading-none', word, big ? 'text-[44px]' : 'text-[28px]')}>{c.word}</span>
    </div>
  )
}

/**
 * Envía la solicitud de PLV por correo a Suprafeel (se abre el correo de quien la pide, con la lista).
 * Todavía no hay endpoint de solicitudes: así llega de verdad, en vez de un «enviada» que no sale de aquí.
 */
export function useEnviarSolicitud() {
  const { user } = useAuth()
  const { farmacias } = useDatos()
  const { solicitud } = useStore()
  return () => {
    const items = Object.entries(solicitud).map(([id, qty]) => ({ m: materials.find((x) => x.id === id), qty })).filter((x) => x.m)
    if (!items.length) return
    const f = user?.role === 'farmacia' ? farmacias.find((p) => p.id === user.pharmacy_slug) : undefined
    const quien = f ? nombreDe(f) : user?.rep_name || user?.name || ''
    const lista = items.map(({ m, qty }) => `· ${qty} × ${m!.name}`).join('\n')
    const cuerpo = `Hola:\n\nPido este material PLV${f ? ` para ${nombreDe(f)}` : ''}:\n\n${lista}\n\n${user?.name ?? ''}`
    window.location.href = `mailto:info@suprafeel.es?subject=${encodeURIComponent(`Solicitud de material PLV${quien ? ` · ${quien}` : ''}`)}&body=${encodeURIComponent(cuerpo)}`
  }
}

/** Botón "Solicitud · N" + panel con lo pedido */
export function SolicitudButton() {
  const { solicitud, setQty } = useStore()
  const enviar = useEnviarSolicitud()
  const [open, setOpen] = useState(false)
  const items = Object.entries(solicitud).map(([id, qty]) => ({ m: materials.find((x) => x.id === id)!, qty })).filter((x) => x.m)
  const count = items.reduce((a, b) => a + b.qty, 0)
  return (
    <>
      <Button variant="primary" icon={<Bookmark size={13} />} onClick={() => setOpen(true)}>Solicitud · {count}</Button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        title="Tu solicitud de material"
        subtitle={count ? `${count} ${count === 1 ? 'unidad' : 'unidades'} · se envía por correo a Suprafeel` : 'Todavía no has marcado nada'}
        footer={
          <>
            <span className="text-sm text-muted">Se abre tu correo con la lista</span>
            <Button variant="primary" icon={<Send size={13} />} disabled={!count} onClick={enviar}>Enviar por correo</Button>
          </>
        }
      >
        <div className="rounded-xl bg-surface border border-line overflow-hidden">
          {items.length === 0 && <div className="p-6 text-center text-base text-muted">Entra en una campaña y marca lo que quieras.</div>}
          {items.map(({ m, qty }, i) => (
            <div key={m.id} className={cn('min-h-[64px] py-2.5 px-3.5 flex items-center gap-3', i < items.length - 1 && 'border-b border-line-soft')}>
              <MaterialArt art={m.art} size={32} className="h-11 w-11 rounded-md border border-line-soft" />
              <span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink">{m.name}</span><span className="text-xs text-faint">{m.limit}</span></span>
              <div className="h-[30px] shrink-0 rounded-[7px] bg-surface border border-line flex items-center">
                <button onClick={() => setQty(m.id, qty - 1)} aria-label={`Quitar una unidad de ${m.name}`} className="w-8 h-full inline-flex items-center justify-center text-muted hover:text-ink"><Minus size={12} /></button>
                <span className="w-6 text-center text-base font-semibold">{qty}</span>
                <button onClick={() => setQty(m.id, qty + 1)} aria-label={`Añadir una unidad de ${m.name}`} className="w-8 h-full inline-flex items-center justify-center text-muted hover:text-ink"><Plus size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      </Drawer>
    </>
  )
}

export function PLV() {
  const base = useBase()
  const navigate = useNavigate()
  const { solicitud } = useStore()
  const { vista, setVista, resetVista } = useVista({ mode: 'cards', perRow: 3 })
  const gridStyle = useGridCols(vista)
  const inReq = (c: Campaign) => materials.filter((m) => m.campaignId === c.id && solicitud[m.id]).length
  const isComercial = base === '/comercial'

  return (
    <Screen toolbar={<Toolbar title="Materiales PLV" right={<><SearchField placeholder="Buscar material" /><SolicitudButton /></>} />}>
      <PageHeader
        title="Materiales PLV"
        subtitle={isComercial ? 'Cada campaña trae su propio material. Marca lo que necesites y envía la solicitud a la central por correo.' : 'Cada campaña trae su propio material. Marca lo que quieras y envía la solicitud por correo.'}
        right={<VistaButton vista={vista} onChange={setVista} onReset={resetVista} />}
      />

      {vista.mode === 'cards' ? (
        <div className="grid gap-5" style={gridStyle}>
          {campaigns.map((c) => {
            const n = inReq(c)
            return (
              <Link key={c.id} to={`${base}/plv/${c.id}`} className="rounded-xl bg-surface border border-line shadow-card overflow-hidden flex flex-col hover:border-faint transition-colors">
                <CampaignCover c={c} className="h-[146px]" />
                <div className="p-4 flex flex-col">
                  <span className="text-lg font-semibold text-ink">{c.name}</span>
                  <span className="text-sm text-faint mt-1">{c.period} · {c.theme}</span>
                  <div className="mt-3.5 flex items-center justify-between">
                    <span className="text-sm text-ink-soft">{c.materials} materiales{n ? ` · ${n} en tu solicitud` : c.note ? ` · ${c.note}` : ''}</span>
                    <ChevronRight size={15} className="text-accent" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <TableCard footer={`${campaigns.length} campañas · ${campaigns.reduce((a, c) => a + c.materials, 0)} materiales`}>
          {campaigns.map((c, i) => (
            <Tr key={c.id} height={62} onClick={() => navigate(`${base}/plv/${c.id}`)} last={i === campaigns.length - 1}>
              <CampaignCover c={c} big={false} className="h-11 w-[72px] rounded-md shrink-0 [&_span:first-child]:hidden [&_span:last-child]:text-[13px] [&_span:last-child]:left-2 [&_span:last-child]:bottom-2" />
              <span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink">{c.name}</span><span className="text-xs text-faint">{c.period} · {c.theme}</span></span>
              <Tag tone={c.status === 'FINALIZADA' ? 'neutral' : c.status === 'PRÓXIMA' ? 'neutral' : 'accent'}>{c.status}</Tag>
              <span className="w-[160px] text-right text-md text-ink-soft">{c.materials} materiales{inReq(c) ? ` · ${inReq(c)} pedidos` : ''}</span>
              <ChevronRight size={14} className="text-faint" />
            </Tr>
          ))}
        </TableCard>
      )}
    </Screen>
  )
}
