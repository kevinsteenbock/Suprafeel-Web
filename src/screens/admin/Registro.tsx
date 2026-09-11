import { useState } from 'react'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useStore } from '@/app/store'
import { Toolbar, SearchField, PageHeader } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Chip, ChipRow } from '@/ui/Chip'
import { Badge } from '@/ui/Badge'
import { VistaButton, useVista } from '@/ui/Vista'
import { TableCard, THead, Th, Tr, Td, TdMain } from '@/ui/Table'
import { cn } from '@/lib/cn'

const log = [
  { q: 'Duerme mal, se despierta sobre las 3 y está cansada todo el día', f: 'Farmacia Central', when: 'hace 12 min', top: 'Melatonina Noche Retard · 94', rating: 'up', state: 'Resuelta' },
  { q: 'calambres por la noche, señor de 70', f: 'Farmacia Blasco Ibáñez', when: 'hace 40 min', top: 'Magnesio Complex · 91', rating: 'up', state: 'Resuelta' },
  { q: 'algo para la niebla mental de la quimio', f: 'Farmacia Montoro', when: 'hace 2 h', top: '—', rating: null, state: 'Sin respuesta' },
  { q: 'se me duermen las manos por la noche', f: 'Farmacia del Carmen', when: 'ayer', top: 'Magnesio Complex · 72', rating: 'down', state: 'Valorada mal' },
  { q: 'probiótico después de antibiótico, niño de 9', f: 'Farmacia Ruzafa Salud', when: 'ayer', top: 'Probiótico Flora · 88', rating: 'up', state: 'Resuelta' },
  { q: 'colesterol alto y toma sintrom', f: 'Farmacia Gran Vía Marqués', when: 'ayer', top: 'Omega 3 TG · 66 · aviso Sintrom', rating: null, state: 'Resuelta' },
  { q: 'vitaminas para opositores', f: 'Farmacia Aribau', when: 'hace 3 d', top: '—', rating: null, state: 'Sin respuesta' },
  { q: 'caída de pelo después del parto', f: 'Farmacia Torrent Guía', when: 'hace 3 d', top: 'Hierro Bisglicinato · 85', rating: 'up', state: 'Resuelta' },
]

export function Registro() {
  const { notify } = useStore()
  const [filter, setFilter] = useState('all')
  const { vista, setVista, resetVista } = useVista({ mode: 'list' })
  const list = log.filter((l) => filter === 'all' || (filter === 'ok' ? l.state === 'Resuelta' : filter === 'bad' ? l.state === 'Valorada mal' : l.state === 'Sin respuesta'))
  return (
    <Screen toolbar={<Toolbar title="Registro de consultas" right={<><SearchField placeholder="Buscar en las consultas" /><Button onClick={() => notify('Registro exportado · sin datos de pacientes')}>Exportar</Button></>} />}>
      <PageHeader title="Registro de consultas" subtitle="2.104 consultas este mes · guardadas sin nombre de paciente ni de quien las escribió" right={<span className="text-base text-muted">Se conservan 12 meses</span>} />
      <ChipRow right={<VistaButton vista={vista} onChange={setVista} onReset={resetVista} />}>
        {[['all', 'Todas', 2104], ['ok', 'Resueltas', 1831], ['bad', 'Valoradas mal', 46], ['none', 'Sin respuesta', 64]].map(([k, l, n]) => <Chip key={k as string} active={filter === k} count={n as number} countTone={k === 'none' ? 'danger' : 'neutral'} onClick={() => setFilter(k as string)}>{l}</Chip>)}
      </ChipRow>
      <TableCard footer={`${list.length} de 2.104 consultas · las últimas 48 h`}>
        <THead><Th className="flex-1">Lo que escribieron</Th><Th className="w-[160px]">Farmacia</Th><Th className="w-[80px]">Cuándo</Th><Th className="w-[210px]">Primera recomendación</Th><Th className="w-[60px]" align="center">Valor.</Th><Th className="w-[110px]" align="right">Estado</Th></THead>
        {list.map((l, i) => (
          <Tr key={l.q} onClick={() => notify('Detalle de la consulta')} last={i === list.length - 1}>
            <TdMain title={`«${l.q}»`} />
            <Td className="w-[160px]">{l.f}</Td>
            <Td className="w-[80px]">{l.when}</Td>
            <Td className={cn('w-[210px]', l.top === '—' && 'text-faint')}>{l.top}</Td>
            <div className="w-[60px] flex justify-center">{l.rating === 'up' ? <ThumbsUp size={14} className="text-ok" /> : l.rating === 'down' ? <ThumbsDown size={14} className="text-danger" /> : <span className="text-faint text-sm">—</span>}</div>
            <div className="w-[110px] flex justify-end"><Badge tone={l.state === 'Resuelta' ? 'ok' : l.state === 'Valorada mal' ? 'danger' : 'warn'}>{l.state}</Badge></div>
          </Tr>
        ))}
      </TableCard>
    </Screen>
  )
}
