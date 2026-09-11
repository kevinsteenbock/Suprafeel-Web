import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Bookmark, ChevronRight, Search } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useBase, useStore } from '@/app/store'
import { catalogFilters, filterProducts, euro, type Product } from '@/data/products'
import { Toolbar, SearchField, PageHeader } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Chip, ChipRow } from '@/ui/Chip'
import { Tag } from '@/ui/Badge'
import { Select } from '@/ui/Field'
import { VistaButton, useVista, gridCols, visibleColumns } from '@/ui/Vista'
import { ProductArt, Thumb } from '@/ui/ProductArt'
import { TableCard, THead, Th, Tr, Td, TdMain } from '@/ui/Table'
import { ProductPeek } from './ProductPeek'
import { cn } from '@/lib/cn'

export function MiListaButton() {
  const base = useBase()
  const { miLista } = useStore()
  return (
    <Link to={`${base}/mi-lista`}>
      <Button variant="primary" icon={<Bookmark size={13} />}>Mi lista · {miLista.length}</Button>
    </Link>
  )
}

const columnOptions = [
  { key: 'cat', label: 'Categoría' },
  { key: 'cn', label: 'Código nacional' },
  { key: 'price', label: 'PVP' },
  { key: 'tag', label: 'Etiqueta' },
]

export function Catalogo({ initialFilter = 'all' }: { initialFilter?: string }) {
  const base = useBase()
  const { miLista, toggleLista } = useStore()
  const [filter, setFilter] = useState(initialFilter)
  const [q, setQ] = useState('')
  const [peek, setPeek] = useState<Product | null>(null)
  const { vista, setVista, resetVista } = useVista({ mode: 'cards', perRow: 4, columns: columnOptions })
  const list = filterProducts(filter).filter((p) => !q || (p.name + p.cn).toLowerCase().includes(q.toLowerCase()))
  const isComercial = base === '/comercial'
  const label = (p: Product) => (isComercial && p.tag === 'MÁS VENDIDO' ? 'MÁS CONSULTADO' : p.tag)
  const tagTone = (t?: string) => (t === 'NOVEDAD' ? 'accent' : t === 'MÁS VENDIDO' || t === 'MÁS CONSULTADO' ? 'dark' : 'neutral')
  const big = vista.perRow === 2 || vista.perRow === 3

  const cells: Record<string, { th: ReactNode; td: (p: Product) => ReactNode }> = {
    cat: { th: <Th key="h-cat" className="w-[150px]">Categoría</Th>, td: (p) => <Td key="cat" className="w-[150px]">{p.categoryLabel}</Td> },
    cn: { th: <Th key="h-cn" className="w-[92px]">CN</Th>, td: (p) => <Td key="cn" className="w-[92px] font-mono text-xs">{p.cn}</Td> },
    price: { th: <Th key="h-price" className="w-[84px]" align="right">PVP</Th>, td: (p) => <Td key="price" className="w-[84px] font-semibold text-ink" align="right">{euro(p.pvp)}</Td> },
    tag: { th: <Th key="h-tag" className="w-[120px]" align="right">Etiqueta</Th>, td: (p) => <div key="tag" className="w-[120px] flex justify-end">{label(p) && <Tag tone={tagTone(label(p))}>{label(p)}</Tag>}</div> },
  }
  const cols = visibleColumns(vista)

  return (
    <Screen
      toolbar={
        <Toolbar
          title={initialFilter === 'new' ? 'Novedades' : 'Catálogo'}
          right={
            <>
              <div className="h-7 w-[208px] rounded-[7px] bg-surface border border-line px-[10px] flex items-center gap-[7px]">
                <Search size={13} className="text-faint shrink-0" strokeWidth={2} />
                <input className="flex-1 min-w-0 bg-transparent text-md" placeholder="Buscar producto o CN" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <MiListaButton />
            </>
          }
        />
      }
    >
      <PageHeader
        title={initialFilter === 'new' ? 'Novedades del catálogo' : 'Catálogo Suprafeel'}
        subtitle={initialFilter === 'new' ? '6 referencias nuevas desde julio · las ves antes que nadie' : '48 referencias · tarifa y fichas actualizadas el 3 de septiembre'}
      />

      <ChipRow
        right={
          <>
            <span className="text-md text-muted">Ordenar por</span>
            <Select value="Novedad" size="sm" className="w-[92px]" />
            <VistaButton vista={vista} onChange={setVista} onReset={resetVista} columns={columnOptions} extra={{ key: 'tags', label: 'Ver las etiquetas' }} />
          </>
        }
      >
        {catalogFilters.map((f) => (
          <Chip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
            {isComercial && f.key === 'best' ? 'Más consultados' : f.label}
          </Chip>
        ))}
      </ChipRow>

      {list.length === 0 && <div className="text-base text-muted py-10 text-center">Nada que encaje con «{q}».</div>}

      {vista.mode === 'cards' ? (
        <div className="grid gap-4" style={gridCols(vista)}>
          {list.map((p) => {
            const saved = miLista.includes(p.id)
            return (
              <div key={p.id} className="rounded-xl bg-surface border border-line shadow-card overflow-hidden flex flex-col hover:border-faint transition-colors">
                <button onClick={() => setPeek(p)} className="relative block text-left">
                  <ProductArt art={p.art} size={big ? 120 : 96} className={cn('w-full border-b border-line-soft', big ? 'h-[200px]' : 'h-[166px]')} />
                  {label(p) && vista.extras.tags !== false && <Tag tone={tagTone(label(p))} className="absolute top-3 left-3">{label(p)}</Tag>}
                </button>
                <div className="p-[14px] pt-3 flex flex-col">
                  <button onClick={() => setPeek(p)} className="text-base font-semibold text-ink hover:text-accent-deep truncate text-left">{p.name}</button>
                  <span className="text-xs text-faint mt-[3px]">{p.format} · CN {p.cn}</span>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-base font-semibold text-ink">PVP {euro(p.pvp)}</span>
                    <button onClick={() => toggleLista(p.id)} aria-label="Guardar en Mi lista" className={cn('h-6 w-6 -mr-1 rounded-md inline-flex items-center justify-center hover:bg-chrome', saved ? 'text-accent' : 'text-faint')}>
                      <Bookmark size={15} fill={saved ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <TableCard footer={`${list.length} de 48 referencias`} footerRight="Exportar tarifa">
          <THead>
            <Th className="flex-1">Producto</Th>
            {cols.map((k) => cells[k].th)}
            <Th className="w-[60px]" align="right"> </Th>
          </THead>
          {list.map((p, i) => (
            <Tr key={p.id} onClick={() => setPeek(p)} last={i === list.length - 1}>
              <TdMain title={p.name} meta={p.format} avatar={<Thumb code={p.code} tone={i % 3 === 0 ? 'accent' : 'neutral'} />} />
              {cols.map((k) => cells[k].td(p))}
              <div className="w-[60px] flex justify-end items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); toggleLista(p.id) }} className={cn(miLista.includes(p.id) ? 'text-accent' : 'text-faint')}>
                  <Bookmark size={14} fill={miLista.includes(p.id) ? 'currentColor' : 'none'} />
                </button>
                <ChevronRight size={14} className="text-faint" />
              </div>
            </Tr>
          ))}
        </TableCard>
      )}

      <ProductPeek product={peek} onClose={() => setPeek(null)} />
    </Screen>
  )
}

export { SearchField }
