import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import { Plus, Check, X, ChevronRight, Sparkles, AlertTriangle, RotateCcw } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useStore } from '@/app/store'
import { symptoms as allSymptoms, rules as allRules, unanswered as allUnanswered, sources, type Symptom, type Rule } from '@/data/chat'
import { Toolbar, SearchField, PageHeader } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Chip, ChipRow } from '@/ui/Chip'
import { Badge } from '@/ui/Badge'
import { Drawer } from '@/ui/Drawer'
import { Field, Input, Textarea, Select } from '@/ui/Field'
import { Toggle } from '@/ui/Toggle'
import { Thumb, FileBadge, ProductArt } from '@/ui/ProductArt'
import { VistaButton, useVista } from '@/ui/Vista'
import { TableCard, THead, Th, Tr, Td, TdMain, Bar } from '@/ui/Table'
import { cn } from '@/lib/cn'

const tabs = [
  { key: 'sintomas', label: 'Síntomas', count: 142 },
  { key: 'reglas', label: 'Reglas', count: 96 },
  { key: 'fuentes', label: 'Fuentes', count: 24 },
  { key: 'pruebalo', label: 'Pruébalo' },
  { key: 'sin-respuesta', label: 'Sin respuesta', count: 64, danger: true },
]
const sub: Record<string, string> = {
  sintomas: 'Lo que la farmacia escribe y lo que le contestamos · 142 síntomas · 2.104 consultas este mes',
  reglas: 'Cada regla dice qué recomendar y, sobre todo, por qué · 96 reglas activas',
  fuentes: 'Los documentos de los que sale cada respuesta · si no está aquí, el chat no lo puede decir',
  pruebalo: 'Escribe como escribiría la farmacia y mira qué le sale · nada de esto queda registrado',
  'sin-respuesta': 'Consultas reales que no supimos contestar · de aquí sale casi todo el entrenamiento',
}
const cta: Record<string, string> = { sintomas: 'Nuevo síntoma', reglas: 'Nueva regla', fuentes: 'Subir fuente', pruebalo: 'Vaciar la prueba', 'sin-respuesta': 'Crear regla' }

export function Chat() {
  const { tab = 'sintomas' } = useParams()
  const navigate = useNavigate()
  const { notify } = useStore()
  const [symptom, setSymptom] = useState<Symptom | null>(null)
  const [rule, setRule] = useState<Rule | null>(null)
  const [teach, setTeach] = useState<string | null>(null)
  const [newRule, setNewRule] = useState(false)
  const { vista, setVista, resetVista } = useVista({ mode: 'list' })
  if (!tabs.some((t) => t.key === tab)) return <Navigate to="/admin/chat/sintomas" replace />

  const onCta = () => {
    if (tab === 'sintomas') setTeach('nuevo')
    else if (tab === 'reglas' || tab === 'sin-respuesta') setNewRule(true)
    else if (tab === 'fuentes') notify('Sube un PDF o pega un enlace')
    else notify('Prueba vaciada')
  }

  return (
    <Screen toolbar={<Toolbar title="Chat inteligente" right={<><SearchField placeholder="Buscar síntoma o regla" /><Button variant="primary" icon={tab === 'pruebalo' ? <RotateCcw size={12} /> : <Plus size={13} strokeWidth={2.4} />} onClick={onCta}>{cta[tab]}</Button></>} />}>
      <PageHeader
        title="Chat inteligente"
        subtitle={sub[tab]}
        right={
          <div className="flex items-center gap-[22px]">
            <div className="flex flex-col items-end"><span className="text-[17px] font-semibold tracking-tight text-ink leading-6">87 %</span><span className="text-xs text-faint">consultas resueltas</span></div>
            <span className="w-px h-[34px] bg-line" />
            <div className="flex flex-col items-end"><span className="text-[17px] font-semibold tracking-tight text-accent leading-6">64</span><span className="text-xs text-faint">sin respuesta esta semana</span></div>
          </div>
        }
      />
      <ChipRow right={<VistaButton vista={vista} onChange={setVista} onReset={resetVista} />}>
        {tabs.map((t) => <Chip key={t.key} active={tab === t.key} count={t.count} countTone={t.danger ? 'danger' : 'neutral'} onClick={() => navigate(`/admin/chat/${t.key}`)}>{t.label}</Chip>)}
      </ChipRow>

      {tab === 'sintomas' && <Sintomas onOpen={setSymptom} onTeach={() => setTeach('niebla')} />}
      {tab === 'reglas' && <Reglas onOpen={setRule} />}
      {tab === 'fuentes' && <Fuentes />}
      {tab === 'pruebalo' && <Pruebalo />}
      {tab === 'sin-respuesta' && <SinRespuesta onTeach={setTeach} />}

      {symptom && <SymptomDrawer s={symptom} onClose={() => setSymptom(null)} />}
      {rule && <RuleDrawer r={rule} onClose={() => setRule(null)} />}
      {teach && <TeachDrawer id={teach} onClose={() => setTeach(null)} />}
      {newRule && <RuleDrawer r={{ id: 'nueva', name: 'Nueva regla', conditions: 'Sin condiciones todavía', products: [], used: null, useful: null, state: 'Borrador', notice: '' }} onClose={() => setNewRule(false)} isNew />}
    </Screen>
  )
}

function Sintomas({ onOpen, onTeach }: { onOpen: (s: Symptom) => void; onTeach: () => void }) {
  const { notify } = useStore()
  return (
    <TableCard footer="9 de 142 síntomas · ordenados por consultas de los últimos 30 días" footerRight={<button onClick={() => notify('Vocabulario exportado')}>Exportar el vocabulario</button>}>
      <THead><Th className="flex-1">Síntoma</Th><Th className="w-[292px]">Cómo lo dicen</Th><Th className="w-[72px]" align="right">Consultas</Th><Th className="w-[52px]" align="right">Reglas</Th><Th className="w-[92px]">Acierto</Th><Th className="w-[92px]" align="right">Estado</Th></THead>
      {allSymptoms.map((s, i) => (
        <Tr key={s.id} tone={s.state === 'Sin regla' ? 'danger' : undefined} onClick={() => (s.state === 'Sin regla' ? onTeach() : onOpen(s))} last={i === allSymptoms.length - 1}>
          <TdMain title={s.name} meta={s.category} metaTone={s.detected ? 'danger' : 'faint'} />
          <div className="w-[292px] flex items-center gap-[5px] overflow-hidden">
            {s.expressions.slice(0, 2).map((e) => <span key={e.text} className={cn('h-[19px] px-2 rounded-full border border-line-soft text-[10.5px] text-ink-soft inline-flex items-center whitespace-nowrap', s.detected ? 'bg-surface' : 'bg-chrome')}>{e.text.length > 22 ? e.text.slice(0, 20) + '…' : e.text}</span>)}
            <span className="text-[10.5px] text-faint">+{Math.max(0, s.expressions.length - 2 + s.pending.length)}</span>
          </div>
          <Td className="w-[72px]" align="right">{s.consultations}</Td>
          <Td className="w-[52px]" align="right">{s.rules}</Td>
          <div className="w-[92px] flex items-center gap-2">{s.accuracy === null ? <span className="text-sm text-faint">—</span> : <><Bar value={s.accuracy} tone={s.accuracy >= 80 ? 'ok' : 'warn'} /><span className="text-sm text-muted">{s.accuracy} %</span></>}</div>
          <div className="w-[92px] flex justify-end"><Badge tone={s.state === 'Entrenado' ? 'ok' : s.state === 'Flojo' ? 'warn' : 'solid-danger'}>{s.state}</Badge></div>
        </Tr>
      ))}
    </TableCard>
  )
}

function Reglas({ onOpen }: { onOpen: (r: Rule) => void }) {
  const { notify } = useStore()
  return (
    <TableCard footer="8 de 96 reglas · cuando dos reglas encajan, gana la que tiene más condiciones" footerRight={<button onClick={() => notify('Las reglas se ordenan por número de condiciones y luego por acierto')}>Ver cómo se ordenan</button>}>
      <THead><Th className="flex-1">Cuándo se activa</Th><Th className="w-[168px]">Qué recomienda</Th><Th className="w-[76px]" align="right">Se usó</Th><Th className="w-[96px]">Le sirvió</Th><Th className="w-[92px]" align="right">Estado</Th></THead>
      {allRules.map((r, i) => (
        <Tr key={r.id} height={58} onClick={() => onOpen(r)} last={i === allRules.length - 1}>
          <div className="flex-1 min-w-0 flex flex-col">
            <span className="flex items-center gap-2 text-base font-medium text-ink truncate">{r.name}{r.derive && <Badge size="sm" tone="danger">Deriva</Badge>}</span>
            <span className={cn('text-xs mt-[2px] truncate', r.warn ? 'text-warn' : 'text-faint')}>{r.conditions}</span>
          </div>
          <div className="w-[168px] flex items-center gap-[5px]">{r.products.length === 0 ? <span className="text-sm text-faint">Sin producto</span> : <>{r.products.slice(0, 3).map((p) => <Thumb key={p.code + p.name} code={p.code} tone={p.tone === 'sand' ? 'sand' : p.tone === 'ok' ? 'ok' : p.tone === 'violet' ? 'violet' : 'accent'} />)}{r.extra && <span className="text-xs text-faint ml-0.5">+{r.extra}</span>}</>}</div>
          <Td className="w-[76px]" align="right">{r.used ?? '—'}</Td>
          <div className="w-[96px] flex items-center gap-2">{r.useful === null ? <span className="text-sm text-faint">—</span> : <><Bar value={r.useful} width={50} tone={r.useful >= 80 ? 'ok' : 'warn'} /><span className="text-sm text-muted">{r.useful} %</span></>}</div>
          <div className="w-[92px] flex justify-end"><Badge tone={r.state === 'Activa' ? 'ok' : 'warn'}>{r.state}</Badge></div>
        </Tr>
      ))}
    </TableCard>
  )
}

function Fuentes() {
  const { notify } = useStore()
  return (
    <TableCard footer="6 de 24 fuentes · 1,2 GB · todas revisadas por la Dra. Sanz" footerRight={<button onClick={() => notify('Sube un PDF o pega un enlace')}>Subir fuente</button>}>
      <THead><Th className="flex-1">Fuente</Th><Th className="w-[110px]" align="right">Usada en reglas</Th><Th className="w-[100px]" align="right">Actualizada</Th><Th className="w-[90px]" align="right">Estado</Th></THead>
      {sources.map((f, i) => (
        <Tr key={f.name} onClick={() => notify(`Abriendo «${f.name}»`)} last={i === sources.length - 1}>
          <TdMain title={f.name} meta={f.meta} avatar={<FileBadge kind={f.kind} />} />
          <Td className="w-[110px] font-semibold text-ink" align="right">{f.used}</Td>
          <Td className="w-[100px]" align="right">{f.updated}</Td>
          <div className="w-[90px] flex justify-end"><Badge tone="ok">Revisada</Badge></div>
        </Tr>
      ))}
    </TableCard>
  )
}

function Pruebalo() {
  const { notify } = useStore()
  const [q, setQ] = useState('Señora de 62 años que lleva tres semanas sin dormir bien, se despierta a las 4 y toma Sintrom')
  const [state, setState] = useState<'idle' | 'thinking' | 'done'>('done')
  const [verdict, setVerdict] = useState<null | 'ok' | 'fix'>(null)
  const run = () => { setState('thinking'); setVerdict(null); window.setTimeout(() => setState('done'), 900) }
  const res = [
    { art: 'bottle' as const, name: 'Melatonina 1,9 mg retard', score: 94, why: 'Se despierta de madrugada y no vuelve a dormirse: la forma retard suelta melatonina toda la noche. No interfiere con el Sintrom.', dose: '1 comprimido 30 min antes de acostarse' },
    { art: 'jar' as const, name: 'Magnesio bisglicinato 300 mg', score: 81, why: 'A los 62 el magnesio suele andar justo y eso da despertares. Se puede tomar junto con la melatonina.', dose: '1 cápsula por la noche' },
    { art: 'sachet' as const, name: 'Glicina 1 g', score: 63, why: 'Si no quiere melatonina. Baja un poco la temperatura corporal y ayuda a coger el sueño.', dose: '1 sobre antes de acostarse' },
  ]
  return (
    <div className="flex gap-[18px]">
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="rounded-xl bg-surface border border-accent shadow-focus p-3.5 flex flex-col">
          <textarea rows={2} className="w-full bg-transparent text-[14px] leading-[19px] text-ink resize-none" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="mt-3 flex items-center gap-1.5 flex-wrap">
            <span className="label-faint mr-0.5">He entendido</span>
            {[['Insomnio', 'accent'], ['62 años', 'n'], ['mujer', 'n'], ['toma Sintrom', 'danger']].map(([l, t]) => <span key={l} className={cn('h-5 px-[9px] rounded-full text-xs inline-flex items-center', t === 'accent' ? 'bg-accent-wash text-accent-deep font-medium' : t === 'danger' ? 'bg-danger-wash text-danger font-medium' : 'bg-chrome border border-line-soft text-ink-soft')}>{l}</span>)}
            <Button variant="primary" className="ml-auto" onClick={run} disabled={state === 'thinking'}>{state === 'thinking' ? 'Pensando…' : 'Probar otra vez'}</Button>
          </div>
        </div>
        <span className="label-faint mt-[18px]">Lo que le sale a la farmacia</span>
        {state === 'thinking' ? (
          <div className="mt-2.5 rounded-xl border border-dashed border-line bg-chrome/60 h-[300px] flex flex-col items-center justify-center gap-2 text-muted"><Sparkles size={20} className="text-accent animate-pulse" /><span className="text-base">Cruzando 142 síntomas y 96 reglas…</span></div>
        ) : (
          <div className="mt-2.5 rounded-xl bg-surface border border-line shadow-card overflow-hidden flex flex-col">
            <div className="px-3.5 py-3 bg-danger-wash border-b border-danger-line flex items-center gap-2.5"><AlertTriangle size={15} className="text-danger shrink-0" /><div className="flex flex-col"><span className="text-md font-semibold text-danger">Toma Sintrom: cuidado con lo que le ofreces</span><span className="text-sm text-[#7E2323]">Hemos quitado de la lista todo lo que lleve vitamina K, ginkgo o jengibre.</span></div></div>
            {res.map((r, i) => (
              <div key={r.name} className={cn('px-3.5 py-3 flex gap-3', i < res.length - 1 && 'border-b border-line-soft')}>
                <ProductArt art={r.art} size={30} className="h-[52px] w-[52px] rounded-lg shrink-0" />
                <div className="flex-1 min-w-0 flex flex-col"><div className="flex items-center gap-2"><span className="flex-1 text-[13.5px] font-semibold text-ink">{r.name}</span><span className={cn('text-sm font-semibold', r.score >= 80 ? 'text-ok' : 'text-warn')}>encaja {r.score} %</span></div><span className="mt-[3px] text-sm leading-4 text-ink-soft">{r.why}</span><span className="mt-1 text-xs text-faint">{r.dose}</span></div>
              </div>
            ))}
            <div className="h-[52px] px-3.5 bg-chrome border-t border-line flex items-center justify-between"><span className="text-sm text-muted">Y también: «tres semanas ya es mucho, que lo comente en la próxima revisión».</span><span className="text-sm text-faint">respondido en 1,2 s</span></div>
          </div>
        )}
      </div>
      <aside className="w-[336px] shrink-0 flex flex-col gap-3">
        <div className="rounded-xl bg-surface border border-line shadow-card overflow-hidden">
          <div className="h-9 px-3.5 bg-chrome border-b border-line flex items-center"><span className="label">Por qué ha salido esto</span></div>
          <div className="p-3.5 flex flex-col">
            <span className="label-faint">Síntoma detectado</span>
            <div className="mt-1.5 flex items-center justify-between"><span className="text-md font-medium text-ink">Insomnio de mantenimiento</span><span className="text-sm text-ok">94 %</span></div>
            <span className="text-xs text-faint mt-[3px]">por «se despierta a las 4» y «sin dormir bien»</span>
            <div className="h-px bg-line-soft my-3" />
            <span className="label-faint">Regla que ha ganado</span>
            <span className="mt-1.5 text-md font-medium text-accent">Insomnio · adulto sin medicación</span>
            <span className="text-xs text-muted mt-[3px] leading-[15px]">Tiene 3 condiciones y todas encajan. Gana a la regla genérica de insomnio.</span>
            <div className="h-px bg-line-soft my-3" />
            <span className="label-faint">Lo que he descartado</span>
            {[['Valeriana + pasiflora Noche', 'choca con el Sintrom'], ['Ginkgo Memoria', 'anticoagulante · nunca con Sintrom']].map(([t, m]) => <div key={t} className="mt-2 flex items-start gap-2"><span className="mt-[2px] h-3.5 w-3.5 rounded-full bg-danger-wash text-danger inline-flex items-center justify-center"><X size={8} strokeWidth={3.5} /></span><div className="flex flex-col"><span className="text-sm text-ink-soft">{t}</span><span className="text-[10.5px] text-faint">{m}</span></div></div>)}
            <div className="h-px bg-line-soft my-3" />
            <span className="label-faint">De dónde sale</span>
            {[['PDF', 'Ficha técnica Melatonina retard'], ['DOC', 'Interacciones con anticoagulantes']].map(([k, t]) => <div key={t} className="mt-2 flex items-center gap-2"><FileBadge kind={k as 'PDF' | 'DOC'} /><span className="text-sm text-ink-soft">{t}</span></div>)}
          </div>
        </div>
        <div className="rounded-xl bg-surface border border-line shadow-card p-3.5 flex flex-col">
          <span className="text-md font-semibold text-ink">¿Contestarías tú lo mismo?</span>
          <span className="text-xs text-muted mt-[3px] leading-[15px]">Lo que marques aquí entra directo al entrenamiento.</span>
          <div className="mt-3 flex gap-2">
            <button onClick={() => { setVerdict('ok'); notify('Respuesta validada · refuerza la regla') }} className={cn('flex-1 h-8 rounded-md border inline-flex items-center justify-center gap-1.5 text-md font-semibold', verdict === 'ok' ? 'bg-ok text-white border-ok' : 'bg-ok-wash text-ok border-[#CBD9CC]')}><Check size={13} strokeWidth={2.5} />Está bien</button>
            <button onClick={() => { setVerdict('fix'); notify('Abre la regla para corregirla') }} className={cn('flex-1 h-8 rounded-md border inline-flex items-center justify-center gap-1.5 text-md font-semibold', verdict === 'fix' ? 'bg-ink text-white border-ink' : 'bg-surface text-ink border-line')}><RotateCcw size={12} />Corregir</button>
          </div>
          <span className="mt-2.5 text-xs text-faint">Al corregir puedes quitar un producto, meter otro o reescribir el porqué.</span>
        </div>
      </aside>
    </div>
  )
}

function SinRespuesta({ onTeach }: { onTeach: (id: string) => void }) {
  const { notify } = useStore()
  const [gone, setGone] = useState<string[]>([])
  const list = allUnanswered.filter((u) => !gone.includes(u.id))
  return (
    <TableCard footer={`${list.length} de 64 · agrupadas por lo que querían decir, no por las palabras exactas`} footerRight={<button onClick={() => { setGone(list.map((l) => l.id)); notify('Todo marcado como visto') }}>Marcar todo como visto</button>}>
      <THead><Th className="flex-1">Lo que escribieron</Th><Th className="w-[150px]">Farmacia</Th><Th className="w-[74px]">Cuándo</Th><Th className="w-[186px]">Qué pasó</Th><Th className="w-[104px]" align="right">Arreglarlo</Th></THead>
      {list.map((u, i) => (
        <Tr key={u.id} active={u.hot} onClick={() => (u.action === 'Descartar' ? setGone((g) => [...g, u.id]) : onTeach(u.id))} last={i === list.length - 1}>
          <TdMain title={u.text} meta={u.meta} metaTone={u.hot ? 'accent' : 'faint'} />
          <Td className="w-[150px]">{u.pharmacy}</Td>
          <Td className="w-[74px]">{u.when}</Td>
          <div className="w-[186px]"><Badge tone={u.tone === 'danger' ? 'danger' : u.tone === 'warn' ? 'warn' : 'neutral'}>{u.what}</Badge></div>
          <div className="w-[104px] flex justify-end">{u.hot ? <Button variant="primary" size="sm">Enseñarle</Button> : <span className={cn('text-sm font-medium', u.action === 'Descartar' ? 'text-muted' : 'text-accent')}>{u.action}</span>}</div>
        </Tr>
      ))}
    </TableCard>
  )
}

function SymptomDrawer({ s, onClose }: { s: Symptom; onClose: () => void }) {
  const { notify } = useStore()
  const [tab, setTab] = useState('dicen')
  const [expr, setExpr] = useState(s.expressions)
  const [pending, setPending] = useState(s.pending)
  const [draft, setDraft] = useState('')
  const [showAll, setShowAll] = useState(false)
  const add = () => { if (!draft.trim()) return; setExpr((e) => [{ text: draft.trim(), count: 0 }, ...e]); setDraft(''); notify('Expresión añadida') }
  const approve = (t: string) => { const p = pending.find((x) => x.text === t)!; setPending((ps) => ps.filter((x) => x.text !== t)); setExpr((e) => [...e, { text: t, count: parseInt(p.meta) || 0 }]); notify('Aprobada · ya cuenta para el síntoma') }
  const shown = showAll ? expr : expr.slice(0, 5)
  return (
    <Drawer open onClose={onClose} title={s.name} badge={<Badge tone={s.state === 'Entrenado' ? 'ok' : 'warn'}>{s.state}</Badge>} subtitle={`${s.category} · ${s.consultations} consultas en 30 días${s.accuracy ? ` · ${s.accuracy} % de acierto` : ''}`} width={496}
      tabs={[{ key: 'dicen', label: 'Cómo lo dicen' }, { key: 'rec', label: `Qué recomienda · ${s.rules}` }, { key: 'hist', label: 'Historial' }]} activeTab={tab} onTab={setTab}
      footer={<><button className="text-md font-medium text-danger" onClick={() => notify('Pide confirmación antes de borrar')}>Borrar síntoma</button><div className="flex gap-2"><Button size="lg" onClick={() => notify('Abre Pruébalo con este síntoma')}>Probarlo</Button><Button variant="primary" size="lg" onClick={() => { notify('Síntoma guardado'); onClose() }}>Guardar</Button></div></>}
    >
      {tab === 'dicen' && (
        <>
          <div className="field is-focus h-[34px] pr-1.5 gap-2"><input className="flex-1 bg-transparent text-base" placeholder="Añade otra forma de decirlo…" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} /><Button variant="primary" size="sm" onClick={add}>Añadir</Button></div>
          <span className="mt-1.5 text-xs text-faint">Escríbelo tal cual lo diría un cliente en el mostrador, no en médico.</span>
          <div className="mt-[18px] flex items-baseline justify-between"><span className="label-faint">Expresiones activas · {expr.length}</span><span className="text-xs text-faint">veces escritas</span></div>
          <div className="mt-2 rounded-lg bg-surface border border-line overflow-hidden">
            {shown.map((e) => <div key={e.text} className="h-[38px] px-3 flex items-center gap-2.5 border-b border-line-soft"><span className="flex-1 text-md text-ink truncate">{e.text}</span><span className="w-11 text-right text-sm text-muted">{e.count}</span><button onClick={() => setExpr((xs) => xs.filter((x) => x !== e))} className="text-faint hover:text-danger"><X size={13} /></button></div>)}
            {expr.length > 5 && <button onClick={() => setShowAll((v) => !v)} className="h-[38px] px-3 w-full text-left text-md font-medium text-accent hover:bg-canvas">{showAll ? 'Ver menos' : `Ver las ${expr.length - 5} restantes`}</button>}
          </div>
          {pending.length > 0 && (
            <>
              <div className="mt-5 flex items-center gap-2"><span className="label-faint">Lo ha aprendido solo</span><Badge size="sm" tone="accent">{pending.length} por aprobar</Badge></div>
              <div className="mt-2 rounded-lg bg-accent-wash border border-accent-line overflow-hidden">
                {pending.map((p, i) => <div key={p.text} className={cn('h-[46px] px-3 flex items-center gap-2.5', i < pending.length - 1 && 'border-b border-[#E3C7BA]')}><span className="flex-1 min-w-0 flex flex-col"><span className="text-md text-ink truncate">{p.text}</span><span className={cn('text-[10.5px]', p.danger ? 'text-danger' : 'text-accent-deep')}>{p.meta}</span></span><button onClick={() => approve(p.text)} className="h-[26px] w-[26px] rounded-[7px] bg-ok text-white inline-flex items-center justify-center"><Check size={13} strokeWidth={3} /></button><button onClick={() => { setPending((ps) => ps.filter((x) => x !== p)); notify('Descartada') }} className="h-[26px] w-[26px] rounded-[7px] bg-surface border border-line text-muted inline-flex items-center justify-center"><X size={12} strokeWidth={2.4} /></button></div>)}
              </div>
            </>
          )}
        </>
      )}
      {tab === 'rec' && <div className="flex flex-col gap-2">{allRules.filter((r) => r.name.toLowerCase().includes(s.name.split(' ')[0].toLowerCase())).map((r) => <div key={r.id} className="rounded-lg bg-surface border border-line px-3.5 py-3 flex items-center gap-3"><span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink truncate">{r.name}</span><span className="text-xs text-faint">{r.products.length ? r.products.map((p) => p.name.split(' ')[0]).join(' · ') : 'Deriva al médico'}</span></span><Badge tone={r.state === 'Activa' ? 'ok' : 'warn'}>{r.state}</Badge><ChevronRight size={14} className="text-faint" /></div>)}<button onClick={() => notify('Nueva regla para ' + s.name)} className="h-11 rounded-lg border border-dashed border-line bg-chrome text-md font-medium text-ink-soft">+ Nueva regla para este síntoma</button></div>}
      {tab === 'hist' && <div className="flex flex-col gap-3.5">{[['Aprobadas 2 expresiones nuevas', 'ayer · Kevin S.'], ['Acierto sube del 91 % al 96 %', 'hace 5 d · automático'], ['Regla «ya toma lorazepam» creada', '12 ago · Dra. Sanz'], ['Síntoma creado', '3 feb 2025 · Kevin S.']].map(([t, m]) => <div key={t} className="flex gap-3"><span className="mt-1.5 h-2 w-2 rounded-full bg-line shrink-0" /><div className="flex flex-col"><span className="text-base text-ink">{t}</span><span className="text-xs text-faint">{m}</span></div></div>)}</div>}
    </Drawer>
  )
}

function RuleDrawer({ r, onClose, isNew }: { r: Rule; onClose: () => void; isNew?: boolean }) {
  const { notify } = useStore()
  const [tab, setTab] = useState(isNew ? 'when' : 'what')
  const [prods, setProds] = useState(r.products)
  const [paused, setPaused] = useState(false)
  const canPublish = prods.length > 0 && prods.every((p) => p.why.trim().length > 0)
  return (
    <Drawer open onClose={onClose} title={r.name} badge={!isNew && <Badge tone={paused ? 'neutral' : r.state === 'Activa' ? 'ok' : 'warn'}>{paused ? 'Pausada' : r.state}</Badge>} subtitle={isNew ? 'Empieza por decir cuándo se activa' : r.used ? `Se usó ${r.used} veces · le sirvió al ${r.useful} %` : 'Aún no se ha usado'} width={496}
      tabs={[{ key: 'when', label: 'Cuándo se activa' }, { key: 'what', label: `Qué recomienda · ${prods.length}` }, { key: 'warn', label: 'Avisos · 2' }, { key: 'src', label: 'Fuentes' }]} activeTab={tab} onTab={setTab}
      footer={<>{!isNew ? <button className="text-md font-medium text-muted" onClick={() => { setPaused((p) => !p); notify(paused ? 'Regla reactivada' : 'Regla pausada') }}>{paused ? 'Reactivar regla' : 'Pausar regla'}</button> : <span className="text-sm text-muted">{canPublish ? 'Lista para publicar' : 'Sin «por qué» no se publica'}</span>}<div className="flex gap-2"><Button size="lg" onClick={() => notify('Abre Pruébalo con esta regla')}>Probarla</Button><Button variant="primary" size="lg" disabled={isNew && !canPublish} onClick={() => { notify(isNew ? 'Regla creada como borrador' : 'Regla guardada'); onClose() }}>{isNew ? 'Crear regla' : 'Guardar'}</Button></div></>}
    >
      {tab === 'when' && (
        <div className="flex flex-col gap-4">
          <Field label="Síntoma principal" required><Select value={isNew ? 'Elige un síntoma…' : r.name.split(' · ')[0]} muted={isNew} /></Field>
          <Field label="Condiciones" hint="Cuantas más condiciones, más prioridad tiene la regla sobre las genéricas."><div className="flex flex-col gap-2">{(isNew ? ['+ Añadir condición'] : r.conditions.split(' + ').map((c) => c.replace(/^\w/, (m) => m.toUpperCase()))).map((c) => <div key={c} className={cn('h-9 rounded-md border px-3 flex items-center text-base', c.startsWith('+') ? 'border-dashed border-line text-accent font-medium bg-chrome' : 'border-line bg-surface text-ink')}>{c}{!c.startsWith('+') && <button className="ml-auto text-faint hover:text-danger" onClick={() => notify('Condición quitada')}><X size={13} /></button>}</div>)}</div></Field>
          <div className="flex items-center justify-between pt-3 border-t border-line-soft"><div className="flex flex-col"><span className="text-base font-medium text-ink">Solo deriva, no recomienda</span><span className="text-xs text-faint">Para casos que tienen que pasar por el médico</span></div><Toggle on={!!r.derive} onChange={() => notify('Cambiado')} /></div>
        </div>
      )}
      {tab === 'what' && (
        <>
          <div className="flex items-baseline justify-between"><span className="label-faint">En este orden</span><span className="text-xs text-faint">arrastra para cambiarlo</span></div>
          <div className="mt-2 flex flex-col gap-2">
            {prods.map((p, i) => (
              <div key={p.code + i} className="rounded-lg bg-surface border border-line p-[11px] flex gap-3">
                <ProductArt art={i === 0 ? 'bottle' : i === 1 ? 'jar' : 'dropper'} size={26} className="h-[54px] w-[54px] rounded-lg shrink-0" />
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-center gap-2"><span className="flex-1 text-base font-semibold text-ink truncate">{p.name}</span><Badge size="sm" tone={i === 0 ? 'accent' : 'neutral'}>{p.tag}</Badge><button onClick={() => setProds((ps) => ps.filter((_, j) => j !== i))} className="text-faint hover:text-danger"><X size={13} /></button></div>
                  {p.dose && <span className="text-xs text-muted mt-[2px]">{p.dose}</span>}
                  <div className={cn('mt-2 rounded-[7px] border p-2 flex flex-col', p.why ? 'bg-chrome border-line-soft' : 'bg-chrome border-dashed border-line')}>
                    <span className="text-[9.5px] font-semibold tracking-[0.06em] text-faint uppercase">Por qué este</span>
                    <textarea rows={2} className="mt-1 w-full bg-transparent text-sm leading-[15px] text-ink-soft resize-none" placeholder="Escríbelo tú. Sin esto la regla no se puede publicar." value={p.why} onChange={(e) => setProds((ps) => ps.map((x, j) => (j === i ? { ...x, why: e.target.value } : x)))} />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => { setProds((ps) => [...ps, { code: 'GLI', tone: 'ok', name: 'Glicina 1 g', dose: '1 sobre antes de acostarse', why: '', tag: 'ALTERNATIVA' }]); notify('Producto añadido · escribe el porqué') }} className="h-[42px] rounded-lg border border-dashed border-line bg-chrome flex items-center justify-center gap-2 text-md font-medium text-ink-soft hover:bg-chrome-deep/50"><Plus size={13} />Añadir otro producto del catálogo</button>
          </div>
          {r.notice && <div className="mt-3.5 rounded-lg bg-warn-wash border border-warn-line px-3 py-2.5 flex items-center gap-2.5"><AlertTriangle size={14} className="text-warn shrink-0" /><div className="flex flex-col"><span className="text-sm font-semibold text-[#7A5A18]">Se enseña siempre con la recomendación</span><span className="text-xs text-[#7A5A18] leading-[14px]">{r.notice}</span></div></div>}
        </>
      )}
      {tab === 'warn' && <div className="flex flex-col gap-2.5">{[['Anticoagulantes (Sintrom, apixabán)', 'Quita valeriana, ginkgo y jengibre. Avisa arriba del todo.', 'danger'], ['Ya toma hipnóticos', 'No recomienda melatonina. Manda hablar con el médico.', 'warn']].map(([t, d, tone]) => <div key={t} className={cn('rounded-lg border p-3.5 flex flex-col', tone === 'danger' ? 'bg-danger-wash border-danger-line' : 'bg-warn-wash border-warn-line')}><span className={cn('text-base font-semibold', tone === 'danger' ? 'text-danger' : 'text-[#7A5A18]')}>{t}</span><span className="text-sm mt-1 text-ink-soft">{d}</span></div>)}<button onClick={() => notify('Nuevo aviso')} className="h-10 rounded-lg border border-dashed border-line bg-chrome text-md font-medium text-ink-soft">+ Añadir aviso</button></div>}
      {tab === 'src' && <div className="flex flex-col gap-2">{sources.slice(0, 3).map((f) => <div key={f.name} className="h-[52px] rounded-lg bg-surface border border-line px-3 flex items-center gap-3"><FileBadge kind={f.kind} /><span className="flex-1 min-w-0 flex flex-col"><span className="text-base font-medium text-ink truncate">{f.name}</span><span className="text-xs text-faint">{f.meta}</span></span><button onClick={() => notify('Fuente desvinculada')} className="text-faint hover:text-danger"><X size={13} /></button></div>)}<button onClick={() => notify('Elige una fuente de la biblioteca')} className="h-10 rounded-lg border border-dashed border-line bg-chrome text-md font-medium text-ink-soft">+ Vincular una fuente</button></div>}
    </Drawer>
  )
}

function TeachDrawer({ id, onClose }: { id: string; onClose: () => void }) {
  const { notify } = useStore()
  const u = allUnanswered.find((x) => x.id === id)
  const [tab, setTab] = useState('prop')
  const [name, setName] = useState(id === 'nuevo' ? '' : id === 'niebla' ? 'Niebla mental' : id === 'nino' ? 'Falta de apetito infantil' : id === 'embarazo' ? 'Cansancio en embarazo' : 'Nuevo síntoma')
  const [why2, setWhy2] = useState('')
  const isNew = id === 'nuevo'
  return (
    <Drawer open onClose={onClose} title={isNew ? 'Nuevo síntoma' : 'Enséñale a contestar esto'} subtitle={isNew ? 'Empieza por cómo lo llamamos y cómo lo dice la gente' : `${u?.meta.replace('y ', '').replace(' más parecidas este mes', '').replace(' más parecidas', '') ?? '64 consultas'} sin respuesta dicen lo mismo`} width={496}
      tabs={isNew ? undefined : [{ key: 'prop', label: 'Mi propuesta' }, { key: 'all', label: 'Las 64 consultas' }]} activeTab={tab} onTab={setTab}
      footer={<><button className="text-md font-medium text-muted" onClick={() => { notify('Descartado · no es cosa nuestra'); onClose() }}>No es cosa nuestra</button><div className="flex gap-2"><Button size="lg" onClick={() => notify('Abre Pruébalo con esta propuesta')}>Probarla antes</Button><Button variant="primary" size="lg" disabled={!name.trim() || (!isNew && !why2.trim())} onClick={() => { notify(isNew ? `Síntoma «${name}» creado` : `Regla creada para «${name}» · 64 consultas ya tienen respuesta`); onClose() }}>{isNew ? 'Crear síntoma' : 'Crear la regla'}</Button></div></>}
    >
      {tab === 'all' && !isNew ? (
        <div className="flex flex-col gap-1.5">{['algo para la niebla mental de la quimio', 'no me concentro desde el tratamiento', 'voy espesa todo el día', 'se me olvidan las cosas, es por la quimio', 'algo para la cabeza después de la quimio', 'estoy como en una nube'].map((t, i) => <div key={t} className="h-10 rounded-md bg-surface border border-line px-3 flex items-center gap-3 text-md text-ink"><span className="flex-1 truncate">«{t}»</span><span className="text-xs text-faint">{[12, 9, 8, 7, 6, 5][i]} veces</span></div>)}<span className="text-xs text-faint mt-1.5">… y 58 más agrupadas por intención</span></div>
      ) : (
        <>
          {!isNew && u && <div className="rounded-lg bg-chrome border-l-[3px] border-accent px-3 py-2.5 flex flex-col"><span className="text-md leading-[17px] text-ink">{u.text}</span><span className="text-[10.5px] text-faint mt-[3px]">{u.pharmacy} · {u.when}</span></div>}
          <div className={cn('flex items-center gap-2', isNew ? '' : 'mt-4')}><span className="h-[17px] w-[17px] rounded-full bg-accent text-on-accent text-[10px] font-bold inline-flex items-center justify-center">1</span><span className="label-faint">Cómo lo llamamos</span></div>
          <div className="mt-2 field is-focus gap-2"><input className="flex-1 bg-transparent text-base" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej.: Niebla mental" /><Badge size="sm" tone="accent">Síntoma nuevo</Badge></div>
          <div className="mt-2 flex items-center gap-[5px] flex-wrap"><span className="text-[10.5px] text-faint mr-0.5">{isNew ? 'expresiones' : 'he juntado'}</span>{(isNew ? ['+ añade cómo lo dice la gente'] : ['niebla mental', 'voy espesa', 'no me concentro']).map((e) => <span key={e} className="h-[19px] px-2 rounded-full bg-chrome border border-line-soft text-[10.5px] text-ink-soft inline-flex items-center">{e}</span>)}{!isNew && <span className="text-[10.5px] text-faint">+2</span>}</div>
          {!isNew && (
            <>
              <div className="mt-[18px] flex items-center gap-2"><span className="h-[17px] w-[17px] rounded-full bg-accent text-on-accent text-[10px] font-bold inline-flex items-center justify-center">2</span><span className="flex-1 label-faint">Qué contestamos</span><span className="text-[10.5px] text-faint">sugerencia mía, cámbiala</span></div>
              <div className="mt-2 rounded-lg bg-surface border border-line p-[11px] flex gap-3"><ProductArt art="bottle" size={22} className="h-[46px] w-[46px] rounded-lg" /><div className="flex-1 flex flex-col"><span className="text-base font-semibold text-ink">Omega 3 DHA alta concentración</span><div className="mt-1.5 rounded-[7px] bg-chrome border border-line-soft p-2 flex flex-col"><span className="text-[9.5px] font-semibold tracking-[0.06em] text-faint uppercase">Por qué este</span><span className="mt-1 text-sm leading-[15px] text-ink-soft">El DHA es estructura del cerebro. Se usa cuando cuesta concentrarse y no hay nada que tratar.</span></div></div></div>
              <div className="mt-2 rounded-lg bg-surface border border-line p-[11px] flex gap-3"><ProductArt art="sachet" size={22} className="h-[46px] w-[46px] rounded-lg" /><div className="flex-1 flex flex-col"><span className="text-base font-semibold text-ink">Complejo B activado</span><div className={cn('mt-1.5 rounded-[7px] border p-2 flex flex-col', why2 ? 'bg-chrome border-line-soft' : 'bg-chrome border-dashed border-line')}><span className="text-[9.5px] font-semibold tracking-[0.06em] text-faint uppercase">Por qué este</span><textarea rows={2} value={why2} onChange={(e) => setWhy2(e.target.value)} placeholder="Escríbelo tú. Sin esto la regla no se puede publicar." className="mt-1 w-full bg-transparent text-sm leading-[15px] text-ink-soft resize-none" /></div></div></div>
              <div className="mt-[18px] flex items-center gap-2"><span className="h-[17px] w-[17px] rounded-full bg-accent text-on-accent text-[10px] font-bold inline-flex items-center justify-center">3</span><span className="label-faint">Lo que hay que avisar</span></div>
              <div className="mt-2 rounded-lg bg-danger-wash border border-danger-line px-3 py-2.5 flex items-center gap-2.5"><AlertTriangle size={15} className="text-danger shrink-0" /><div className="flex flex-col"><span className="text-sm font-medium text-[#7E2323] leading-[15px]">«Si está en tratamiento oncológico, que lo hable con su oncólogo antes de tomar nada.»</span><span className="text-[10.5px] text-danger mt-[3px]">Sale siempre, arriba del todo · no se puede quitar</span></div></div>
            </>
          )}
          {isNew && <Textarea className="mt-4" rows={3} placeholder="Escribe una expresión por línea: «me cuesta concentrarme», «voy espesa»…" onChange={() => {}} />}
        </>
      )}
    </Drawer>
  )
}
