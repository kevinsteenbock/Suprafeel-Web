import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Bookmark, ChevronRight } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useBase, useStore } from '@/app/store'
import { catalogFilters, filterProducts, euro, type Product } from '@/data/products'
import { Toolbar, SearchField, PageHeader } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Chip, ChipRow } from '@/ui/Chip'
import { Tag } from '@/ui/Badge'
import { Select } from '@/ui/Field'
import { VistaButton, useVista } from '@/ui/Vista'
import { ProductArt, Thumb } from '@/ui/ProductArt'
import { TableCard, THead, Th, Tr, Td, TdMain } from '@/ui/Table'
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

export function Catalogo({ initialFilter = 'all' }: { initialFilter?: string }) {
  const base = useBase()
  const navigate = useNavigate()
  const { miLista, toggleLista } = useStore()
  const [filter, setFilter] = useState(initialFilter)
  const [q, setQ] = useState('')
  const { vista, setVista } = useVista({ mode: 'cards', perRow: 4 })
  const list = filterProducts(filter).filter((p) => !q || (p.name + p.cn).toLowerCase().includes(q.toLowerCase()))
  const tagTone = (t?: Product['tag']) => (t === 'NOVEDAD' ? 'accent' : t === 'MÁS VENDIDO' || t === 'MÁS CONSULTADO' ? 'dark' : 'neutral')
  const isComercial = base === '/comercial'

  return (
    <Screen
      toolbar={
        <Toolbar
          title={initialFilter === 'new' ? 'Novedades' : 'Catálogo'}
          right={
            <>
              <div className="h-7 w-[208px] rounded-[7px] bg-surface border border-line px-[10px] flex items-center gap-[7px]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#96938C" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
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
            <VistaButton vista={vista} onChange={setVista} columns={[{ key: 'cn', label: 'Código nacional' }, { key: 'price', label: 'PVP' }]} />
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
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${vista.perRow}, minmax(0, 1fr))` }}>
          {list.map((p) => {
            const saved = miLista.includes(p.id)
            const tag = isComercial && p.tag === 'MÁS VENDIDO' ? 'MÁS CONSULTADO' : p.tag
            return (
              <div key={p.id} className="rounded-xl bg-surface border border-line shadow-card overflow-hidden flex flex-col hover:border-faint transition-colors">
                <Link to={`${base}/catalogo/${p.id}`} className="relative block">
                  <ProductArt art={p.art} size={vista.perRow >= 4 ? 96 : 120} className={cn('w-full border-b border-line-soft', vista.perRow >= 4 ? 'h-[166px]' : 'h-[200px]')} />
                  {tag && <Tag tone={tagTone(tag)} className="absolute top-3 left-3">{tag}</Tag>}
                </Link>
                <div className="p-[14px] pt-3 flex flex-col">
                  <Link to={`${base}/catalogo/${p.id}`} className="text-base font-semibold text-ink hover:text-accent-deep truncate">{p.name}</Link>
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
            <Th className="w-[150px]">Categoría</Th>
            {vista.columns.cn !== false && <Th className="w-[92px]">CN</Th>}
            {vista.columns.price !== false && <Th className="w-[84px]" align="right">PVP</Th>}
            <Th className="w-[120px]" align="right">Etiqueta</Th>
            <Th className="w-[60px]" align="right"> </Th>
          </THead>
          {list.map((p, i) => (
            <Tr key={p.id} onClick={() => navigate(`${base}/catalogo/${p.id}`)} last={i === list.length - 1}>
              <TdMain title={p.name} meta={p.format} avatar={<Thumb code={p.code} tone={i % 3 === 0 ? 'accent' : 'neutral'} />} />
              <Td className="w-[150px]">{p.categoryLabel}</Td>
              {vista.columns.cn !== false && <Td className="w-[92px] font-mono text-xs">{p.cn}</Td>}
              {vista.columns.price !== false && <Td className="w-[84px] font-semibold text-ink" align="right">{euro(p.pvp)}</Td>}
              <div className="w-[120px] flex justify-end">{p.tag && <Tag tone={tagTone(p.tag)}>{p.tag}</Tag>}</div>
              <div className="w-[60px] flex justify-end items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); toggleLista(p.id) }} className={cn(miLista.includes(p.id) ? 'text-accent' : 'text-faint')}><Bookmark size={14} fill={miLista.includes(p.id) ? 'currentColor' : 'none'} /></button>
                <ChevronRight size={14} className="text-faint" />
              </div>
            </Tr>
          ))}
        </TableCard>
      )}
    </Screen>
  )
}

export { SearchField }
