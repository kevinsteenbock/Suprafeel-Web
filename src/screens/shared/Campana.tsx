import { useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { Check, ChevronRight, Lightbulb, Minus, Plus } from 'lucide-react'
import { Screen, FooterBar } from '@/app/Shell'
import { useBase, useStore } from '@/app/store'
import { campaignById, filterMaterials, materialFilters, materialsOf, type Material } from '@/data/plv'
import { Toolbar, SearchField, PageHeader, KeyValue } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Chip, ChipRow } from '@/ui/Chip'
import { Drawer } from '@/ui/Drawer'
import { VistaButton, useVista } from '@/ui/Vista'
import { MaterialArt } from '@/ui/MaterialArt'
import { TableCard, Tr } from '@/ui/Table'
import { cn } from '@/lib/cn'
import { SolicitudButton } from './PLV'

export function Campana() {
  const { id } = useParams()
  const base = useBase()
  const { solicitud, setQty, notify } = useStore()
  const [filter, setFilter] = useState('all')
  const [openId, setOpenId] = useState<string | null>(null)
  const { vista, setVista } = useVista({ mode: 'cards', perRow: 4 })
  const c = campaignById(id)
  if (!c) return <Navigate to={`${base}/plv`} replace />
  const all = materialsOf(c.id)
  const list = filterMaterials(all.length ? all : materialsOf('otono'), filter)
  const open = list.find((m) => m.id === openId) ?? all.find((m) => m.id === openId)
  const count = Object.entries(solicitud).filter(([mid]) => (all.length ? all : materialsOf('otono')).some((m) => m.id === mid)).reduce((a, [, q]) => a + q, 0)
  const isComercial = base === '/comercial'

  const actionOf = (m: Material) => {
    if (m.action === 'Descargar') return { label: 'Descargar', tone: 'accent' as const, onClick: () => notify(`Descargando ${m.name}`) }
    if (m.action === 'En camino') return { label: 'En camino', tone: 'warn' as const, onClick: () => notify('Solicitado el 4 sep · llega en la próxima visita') }
    const added = !!solicitud[m.id]
    return { label: added ? 'Añadido' : 'Añadir', tone: added ? ('accent-deep' as const) : ('accent' as const), onClick: () => { setQty(m.id, added ? 0 : 1); notify(added ? 'Quitado de la solicitud' : 'Añadido a la solicitud') } }
  }

  return (
    <Screen
      toolbar={<Toolbar back={`${base}/plv`} crumbs={[{ label: 'Materiales PLV', to: `${base}/plv` }, { label: c.name }]} right={<><SearchField placeholder="Buscar material" /><SolicitudButton /></>} />}
      footer={
        <FooterBar title={`${count} materiales en tu solicitud`} subtitle={isComercial ? 'Lo que marques aquí te lo llevas en la visita' : 'Álvaro los revisará y te los trae el martes 16'}>
          <SolicitudButtonInline />
          <Button variant="primary" size="lg" disabled={!count} onClick={() => notify(isComercial ? 'Solicitud registrada para la próxima ruta' : 'Solicitud enviada a Álvaro · te la trae el martes 16')}>{isComercial ? 'Reservar para la ruta' : 'Enviar a mi comercial'}</Button>
        </FooterBar>
      }
    >
      <PageHeader title={c.name} subtitle={c.description} right={<span className="text-base text-muted">{c.period === 'Todo el año' || c.period === 'Siempre disponible' ? c.period : `Del ${c.period.replace(' – ', ' al ')}`}</span>} />

      <ChipRow right={<VistaButton vista={vista} onChange={setVista} />}>
        {materialFilters.map((f) => <Chip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>{f.label}</Chip>)}
      </ChipRow>

      {vista.mode === 'cards' ? (
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${vista.perRow}, minmax(0, 1fr))` }}>
          {list.map((m) => {
            const a = actionOf(m)
            const added = !!solicitud[m.id]
            return (
              <div key={m.id} className="rounded-xl bg-surface border border-line shadow-card overflow-hidden flex flex-col hover:border-faint transition-colors">
                <button onClick={() => setOpenId(m.id)} className="relative block">
                  <MaterialArt art={m.art} size={vista.perRow >= 4 ? 88 : 110} className={cn('w-full border-b border-line-soft', vista.perRow >= 4 ? 'h-[134px]' : 'h-[170px]')} />
                  {added && <span className="absolute top-3 right-3 h-5 w-5 rounded-full bg-accent text-on-accent inline-flex items-center justify-center"><Check size={11} strokeWidth={3} /></span>}
                </button>
                <div className="p-[14px] flex flex-col">
                  <button onClick={() => setOpenId(m.id)} className="text-base font-semibold text-ink text-left hover:text-accent-deep">{m.name}</button>
                  <span className="text-xs text-faint mt-[3px] leading-4">{m.meta}</span>
                  <div className="mt-3.5 flex items-center justify-between">
                    <span className="text-xs text-muted">{m.limit}</span>
                    <button onClick={a.onClick} className={cn('text-sm font-semibold', a.tone === 'warn' ? 'text-warn' : a.tone === 'accent-deep' ? 'text-accent-deep' : 'text-accent')}>{a.label}</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <TableCard footer={`${list.length} materiales`}>
          {list.map((m, i) => {
            const a = actionOf(m)
            return (
              <Tr key={m.id} height={58} onClick={() => setOpenId(m.id)} last={i === list.length - 1}>
                <MaterialArt art={m.art} size={28} className="h-10 w-10 rounded-md border border-line-soft shrink-0" />
                <span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink">{m.name}</span><span className="text-xs text-faint">{m.meta}</span></span>
                <span className="w-[160px] text-md text-muted">{m.limit}</span>
                <button onClick={(e) => { e.stopPropagation(); a.onClick() }} className={cn('w-[90px] text-right text-sm font-semibold', a.tone === 'warn' ? 'text-warn' : a.tone === 'accent-deep' ? 'text-accent-deep' : 'text-accent')}>{a.label}</button>
                <ChevronRight size={14} className="text-faint" />
              </Tr>
            )
          })}
        </TableCard>
      )}

      {open && (
        <Drawer
          open
          onClose={() => setOpenId(null)}
          title={open.name}
          headerRight={<span className="text-sm text-muted mr-2">{list.indexOf(open) + 1} de {list.length}</span>}
          width={420}
          footer={
            open.action === 'Descargar' ? (
              <Button variant="primary" className="w-full h-10" onClick={() => notify(`Descargando ${open.name}`)}>Descargar ahora</Button>
            ) : open.action === 'En camino' ? (
              <span className="text-base text-warn font-medium w-full text-center">Solicitado el 4 de septiembre · llega en la próxima visita</span>
            ) : (
              <>
                <div className="h-10 rounded-md bg-surface border border-line flex items-center">
                  <button onClick={() => setQty(open.id, (solicitud[open.id] ?? 0) - 1)} className="w-9 h-full inline-flex items-center justify-center text-muted hover:text-ink"><Minus size={13} /></button>
                  <span className="w-7 text-center text-base font-semibold">{solicitud[open.id] ?? 0}</span>
                  <button onClick={() => setQty(open.id, (solicitud[open.id] ?? 0) + 1)} className="w-9 h-full inline-flex items-center justify-center text-muted hover:text-ink"><Plus size={13} /></button>
                </div>
                <Button variant={solicitud[open.id] ? 'primary' : 'secondary'} className="flex-1 h-10" icon={solicitud[open.id] ? <Check size={13} strokeWidth={2.5} /> : undefined} onClick={() => { const n = solicitud[open.id] ? 0 : 1; setQty(open.id, n); notify(n ? 'Añadido a la solicitud' : 'Quitado de la solicitud') }}>
                  {solicitud[open.id] ? 'Añadido a la solicitud' : 'Añadir a la solicitud'}
                </Button>
              </>
            )
          }
        >
          <MaterialArt art={open.art} size={110} className="h-[196px] rounded-xl border border-line" />
          <span className="label text-accent mt-6">{c.name}</span>
          <h2 className="mt-1.5 text-title font-semibold tracking-tight text-ink">{open.name}</h2>
          <p className="mt-2.5 text-base leading-[19px] text-ink-soft">{open.description}</p>
          <KeyValue className="mt-5" labelWidth={110} rows={open.specs.map((s) => ({ k: s.k, v: s.v }))} />
          <div className="mt-4 rounded-xl bg-accent-wash border border-accent-line p-4 flex gap-3">
            <Lightbulb size={15} className="text-accent shrink-0 mt-px" />
            <div className="flex flex-col"><span className="text-md font-semibold text-accent-deep">Dónde funciona mejor</span><span className="text-sm leading-4 text-[#6B3A25] mt-1">{open.tip}</span></div>
          </div>
        </Drawer>
      )}
    </Screen>
  )
}

function SolicitudButtonInline() {
  const [open, setOpen] = useState(false)
  const { solicitud } = useStore()
  const count = Object.values(solicitud).reduce((a, b) => a + b, 0)
  return (
    <>
      <Button size="lg" onClick={() => setOpen(true)}>Ver solicitud</Button>
      {open && <SolicitudPeek count={count} onClose={() => setOpen(false)} />}
    </>
  )
}

function SolicitudPeek({ onClose, count }: { onClose: () => void; count: number }) {
  const { solicitud, setQty } = useStore()
  const rows = Object.entries(solicitud)
  return (
    <Drawer open onClose={onClose} title="Tu solicitud de material" subtitle={`${count} unidades en total`} footer={<Button variant="primary" className="w-full h-9" onClick={onClose}>Seguir eligiendo</Button>}>
      <div className="rounded-xl bg-surface border border-line overflow-hidden">
        {rows.length === 0 && <div className="p-6 text-center text-base text-muted">Todavía no has marcado nada.</div>}
        {rows.map(([mid, qty], i) => {
          const m = materialsOf('otono').find((x) => x.id === mid)
          if (!m) return null
          return (
            <div key={mid} className={cn('h-[64px] px-3.5 flex items-center gap-3', i < rows.length - 1 && 'border-b border-line-soft')}>
              <MaterialArt art={m.art} size={32} className="h-11 w-11 rounded-md border border-line-soft" />
              <span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink truncate">{m.name}</span><span className="text-xs text-faint">{m.limit}</span></span>
              <div className="h-[30px] rounded-[7px] bg-surface border border-line flex items-center">
                <button onClick={() => setQty(mid, qty - 1)} className="w-8 h-full inline-flex items-center justify-center text-muted hover:text-ink"><Minus size={12} /></button>
                <span className="w-6 text-center text-base font-semibold">{qty}</span>
                <button onClick={() => setQty(mid, qty + 1)} className="w-8 h-full inline-flex items-center justify-center text-muted hover:text-ink"><Plus size={12} /></button>
              </div>
            </div>
          )
        })}
      </div>
    </Drawer>
  )
}
