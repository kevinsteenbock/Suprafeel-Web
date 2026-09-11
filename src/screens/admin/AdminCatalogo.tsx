import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router'
import { Plus, ArrowUpRight, ChevronRight, MoreHorizontal } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useStore } from '@/app/store'
import { products, euro, type Product } from '@/data/products'
import { Toolbar, SearchField, PageHeader } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Chip, ChipRow } from '@/ui/Chip'
import { Badge } from '@/ui/Badge'
import { Drawer } from '@/ui/Drawer'
import { ProductArt, Thumb, FileBadge } from '@/ui/ProductArt'
import { VistaButton, useVista, gridCols, visibleColumns } from '@/ui/Vista'
import { TableCard, THead, Th, Tr, Td, TdMain } from '@/ui/Table'
import { cn } from '@/lib/cn'

const columnOptions = [
  { key: 'cat', label: 'Categoría' },
  { key: 'pvp', label: 'PVP' },
  { key: 'margin', label: 'Margen' },
  { key: 'estado', label: 'Estado' },
  { key: 'updated', label: 'Actualizado' },
]

export function AdminCatalogo() {
  const navigate = useNavigate()
  const { notify } = useStore()
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState<Product | null>(null)
  const [tab, setTab] = useState('general')
  const { vista, setVista, resetVista } = useVista({ mode: 'list', perRow: 4, columns: columnOptions })
  const list = products.filter((p) => filter === 'all' || (filter === 'pub' ? p.status === 'Publicado' : filter === 'draft' ? p.status === 'Borrador' : filter === 'new' ? p.isNew : !p.pitch || p.composition.length < 2))
  const marginTone = (m: number) => (m === 0 ? 'text-faint' : m < 32 ? 'text-accent font-medium' : 'text-ink-soft')
  const cells: Record<string, { th: ReactNode; td: (p: Product, i: number) => ReactNode }> = {
    cat: { th: <Th key="h1" className="w-[120px]" align="right">Categoría</Th>, td: (p) => <Td key="c1" className="w-[120px]" align="right">{p.categoryLabel.split(' y ')[0]}</Td> },
    pvp: { th: <Th key="h2" className="w-[80px]" align="right">PVP</Th>, td: (p) => <Td key="c2" className="w-[80px] font-semibold text-ink" align="right">{p.pvp ? euro(p.pvp) : '—'}</Td> },
    margin: { th: <Th key="h3" className="w-[70px]" align="right">Margen</Th>, td: (p) => <Td key="c3" className={cn('w-[70px]', marginTone(p.margin))} align="right">{p.margin ? `${p.margin} %` : '—'}</Td> },
    estado: { th: <Th key="h4" className="w-[96px]" align="right">Estado</Th>, td: (p, i) => <div key="c4" className="w-[96px] flex justify-end"><Badge tone={p.status === 'Publicado' ? (i === 4 ? 'danger' : i === 5 ? 'warn' : 'ok') : 'warn'}>{p.status}</Badge></div> },
    updated: { th: <Th key="h5" className="w-[90px]" align="right">Actualizado</Th>, td: (p) => <Td key="c5" className="w-[90px]" align="right">{p.updated}</Td> },
  }
  const cols = visibleColumns(vista)

  return (
    <Screen toolbar={<Toolbar title="Catálogo" right={<><SearchField placeholder="Buscar producto, CN o EAN" /><Link to="/admin/catalogo/nuevo"><Button variant="primary" icon={<Plus size={13} strokeWidth={2.4} />}>Nuevo producto</Button></Link></>} />}>
      <PageHeader title="Catálogo" subtitle="48 referencias · 6 categorías · 3 en borrador · 4 sin ficha completa" right={<span className="text-base text-muted">Tarifa vigente desde el 3 de septiembre</span>} />
      <ChipRow right={<VistaButton vista={vista} onChange={setVista} onReset={resetVista} columns={columnOptions} />}>
        {[['all', 'Todas', 48], ['pub', 'Publicadas', 45], ['draft', 'Borradores', 3], ['new', 'Novedades', 6], ['incomplete', 'Sin ficha completa', 4]].map(([k, l, n]) => <Chip key={k as string} active={filter === k} count={n as number} onClick={() => setFilter(k as string)}>{l}</Chip>)}
      </ChipRow>

      {vista.mode === 'list' ? (
        <TableCard footer={`${list.length} de 48 referencias · 3 en borrador`} footerRight={<button onClick={() => notify('Tarifa exportada')}>Exportar tarifa</button>}>
          <THead><Th className="flex-1">Producto</Th>{cols.map((k) => cells[k].th)}</THead>
          {list.map((p, i) => (
            <Tr key={p.id} active={open?.id === p.id} onClick={() => { setOpen(p); setTab('general') }} last={i === list.length - 1}>
              <TdMain title={p.name} meta={p.status === 'Borrador' ? `Sin CN asignado · ${p.format}` : `CN ${p.cn} · ${p.format}`} avatar={<Thumb code={p.code} tone={i < 2 ? 'accent' : 'neutral'} />} />
              {cols.map((k) => cells[k].td(p, i))}
            </Tr>
          ))}
        </TableCard>
      ) : (
        <div className="grid gap-4" style={gridCols(vista)}>
          {list.map((p) => (
            <button key={p.id} onClick={() => { setOpen(p); setTab('general') }} className="rounded-xl bg-surface border border-line shadow-card overflow-hidden text-left hover:border-faint">
              <ProductArt art={p.art} size={88} className="h-[140px] border-b border-line-soft" />
              <div className="p-3.5 flex flex-col"><div className="flex items-center justify-between gap-2"><span className="text-base font-semibold text-ink truncate">{p.name}</span><Badge tone={p.status === 'Publicado' ? 'ok' : 'warn'}>{p.status}</Badge></div><span className="text-xs text-faint mt-1">{p.pvp ? `${euro(p.pvp)} · ${p.margin} %` : 'Sin precio'}</span></div>
            </button>
          ))}
        </div>
      )}

      {open && (
        <Drawer
          open
          onClose={() => setOpen(null)}
          title={<span className="label-faint">Vista rápida</span>}
          width={372}
          bodyClass="p-0"
          footer={<div className="flex flex-col w-full gap-2"><div className="flex gap-2"><Button variant="primary" className="flex-1 h-9" iconRight={<ChevronRight size={13} />} onClick={() => navigate(`/admin/catalogo/${open.id}`)}>Abrir ficha</Button><Button className="h-9 px-5" onClick={() => navigate(`/admin/catalogo/${open.id}/editar`)}>Editar</Button><Button className="h-9 w-9 px-0" onClick={() => notify('Duplicar · Despublicar · Eliminar')}><MoreHorizontal size={14} /></Button></div></div>}
        >
          <ProductArt art={open.art} size={96} filled className="h-[130px] bg-chrome" />
          <nav className="h-[42px] px-5 gap-5 border-b border-line flex items-end">
            {[['general', 'General'], ['linked', 'Vinculado'], ['activity', 'Actividad']].map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} className={cn('h-[41px] pb-[2px] flex items-center gap-1.5 text-md font-medium border-b-2 -mb-px', tab === k ? 'text-ink font-semibold border-accent' : 'text-muted border-transparent')}>{l}{k === 'linked' && <span className="h-4 min-w-4 px-1 rounded-full bg-chrome-deep text-[10px] font-semibold inline-flex items-center justify-center">4</span>}</button>
            ))}
          </nav>
          <div className="p-5 flex flex-col">
            {tab === 'general' && (
              <>
                <div className="flex items-center gap-2"><Badge tone={open.status === 'Publicado' ? 'ok' : 'warn'}>{open.status}</Badge><span className="text-sm text-muted">{open.categoryLabel.split(' y ')[0]}</span></div>
                <h2 className="mt-3 text-title font-semibold tracking-tight text-ink">{open.name}</h2>
                <span className="mt-1 text-sm text-muted">CN {open.cn} · EAN {open.ean} · {open.format}</span>
                <div className="mt-5 flex items-end gap-6"><div className="flex flex-col"><span className="label">PVP</span><span className="mt-1 text-display font-semibold tracking-tight leading-none">{open.pvp ? euro(open.pvp) : '—'}</span></div><div className="flex flex-col text-sm pb-1"><span className="text-muted">PVF {open.pvf ? euro(open.pvf) : '—'}</span><span className="text-ok font-semibold mt-1">Margen {open.margin || '—'} %</span></div></div>
                <div className="mt-5 pt-4 border-t border-line-soft flex flex-col gap-2 text-base">
                  {[['Formato', `${open.format} · 800 mg`], ['Composición', open.composition.map((c) => c.name.split(' ')[0]).join(' · ')], ['Laboratorio', 'Suprafeel Labs · Alicante'], ['Alta', '14 feb 2024'], ['Actualizado', `${open.updated} 2025 · ${open.updatedBy}`]].map(([k, v]) => <div key={k} className="flex gap-3"><span className="w-[110px] text-sm text-muted shrink-0">{k}</span><span className="text-ink">{v}</span></div>)}
                  <div className="flex gap-3"><span className="w-[110px] text-sm text-muted shrink-0">Página pública</span><a className="text-accent font-medium inline-flex items-center gap-1" href="#" onClick={(e) => { e.preventDefault(); notify('suprafeel.com/producto/' + open.id) }}>Ver en la web <ArrowUpRight size={12} /></a></div>
                </div>
                <div className="mt-4 rounded-lg bg-chrome border border-line p-3.5 flex flex-col"><span className="label-faint">Argumentario de mostrador</span><p className="mt-2 text-base leading-[19px] text-ink">{open.pitch || 'Sin argumentario todavía.'}</p></div>
                <div className="mt-4 pt-4 border-t border-line-soft grid grid-cols-3 gap-3">{[['3', 'Materiales PLV'], [open.hasCourse ? '1' : '0', 'Curso vinculado'], [String(open.consultations30d), 'Consultas · 30 d']].map(([n, l]) => <div key={l} className="flex flex-col"><span className="text-title font-semibold tracking-tight">{n}</span><span className="text-xs text-muted">{l}</span></div>)}</div>
              </>
            )}
            {tab === 'linked' && (
              <div className="flex flex-col gap-2">
                {[{ k: 'PDF' as const, n: 'Folleto ' + open.name.split(' ')[0], m: 'Otoño 2025 · 156 solicitudes' }, { k: 'PNG' as const, n: 'Stopper de lineal otoño', m: 'Otoño 2025 · 88 solicitudes' }, { k: 'CUR' as const, n: (open.courseId ? 'Curso · ' : 'Sin curso · ') + open.categoryLabel, m: '18 min · 94 completados' }, { k: 'DOC' as const, n: 'Regla del chat inteligente', m: 'Insomnio · adulto sin medicación' }].map((x) => (
                  <div key={x.n} className="h-[54px] rounded-lg bg-surface border border-line px-3 flex items-center gap-3"><FileBadge kind={x.k} /><span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink truncate">{x.n}</span><span className="text-xs text-faint">{x.m}</span></span><ChevronRight size={14} className="text-faint" /></div>
                ))}
              </div>
            )}
            {tab === 'activity' && (
              <div className="flex flex-col gap-3.5">{[['Argumentario reescrito', '3 sep · Kevin S.'], ['PVP 16,90 € → 17,50 €', '12 ago · Kevin S.'], ['Vinculado al curso de magnesio', '2 jun · Kevin S.'], ['Publicado por primera vez', '14 feb 2024 · Kevin S.']].map(([t, m]) => <div key={t} className="flex gap-3"><span className="mt-1.5 h-2 w-2 rounded-full bg-line shrink-0" /><div className="flex flex-col"><span className="text-base text-ink">{t}</span><span className="text-xs text-faint">{m}</span></div></div>)}</div>
            )}
          </div>
          <span className="px-5 pb-4 text-xs text-faint">Ficha completa · visible para las 412 farmacias</span>
        </Drawer>
      )}
    </Screen>
  )
}
