import { useState } from 'react'
import { Send, Paperclip } from 'lucide-react'
import { Screen } from '@/app/Shell'
import { useStore } from '@/app/store'
import { Toolbar, SearchField } from '@/ui/Page'
import { Button } from '@/ui/Button'
import { Avatar } from '@/ui/Avatar'
import { cn } from '@/lib/cn'

const threads = [
  { id: 'central', code: 'FC', name: 'Farmacia Central', last: 'Laura: ¿Traes muestras del colágeno el martes?', when: '10:42', unread: 1 },
  { id: 'central-team', code: 'SF', name: 'Equipo Zona Levante', last: 'Marta Ruiz: Os paso la ficha de la campaña de Navidad', when: 'ayer', unread: 0 },
  { id: 'ruzafa', code: 'RS', name: 'Farmacia Ruzafa Salud', last: 'Inés: Vale, me siento contigo con la app', when: 'ayer', unread: 0 },
  { id: 'central2', code: 'SA', name: 'Central Suprafeel', last: 'Kevin: Aprobada el alta de Farmacia San Jaume', when: 'lun', unread: 0 },
]
const initial = [
  { me: false, t: 'Hola Álvaro, el expositor de otoño ya está montado junto a la caja. Queda genial.', h: '9:58' },
  { me: true, t: 'Perfecto Laura. ¿Cómo va Jorge con la formación? Me gustaría hacerla con él el martes.', h: '10:12' },
  { me: false, t: 'Todavía no la ha empezado, mejor que se la enseñes tú. Y otra cosa: ¿traes muestras del colágeno el martes?', h: '10:42' },
]

export function Mensajes() {
  const { notify } = useStore()
  const [active, setActive] = useState(threads[0].id)
  const [msgs, setMsgs] = useState(initial)
  const [text, setText] = useState('')
  const send = () => {
    if (!text.trim()) return
    setMsgs((m) => [...m, { me: true, t: text.trim(), h: 'ahora' }])
    setText('')
  }
  const th = threads.find((t) => t.id === active)!
  return (
    <Screen padded={false} toolbar={<Toolbar title="Mensajes" right={<><SearchField placeholder="Buscar conversación" /><Button variant="primary" onClick={() => notify('Elige una farmacia para escribirle')}>Nuevo mensaje</Button></>} />}>
      <div className="flex-1 min-h-0 flex">
        <aside className="w-[300px] shrink-0 border-r border-line bg-canvas overflow-y-auto">
          {threads.map((t) => (
            <button key={t.id} onClick={() => setActive(t.id)} className={cn('w-full h-[68px] px-4 flex items-center gap-3 text-left border-b border-line-soft', active === t.id ? 'bg-accent-wash' : 'hover:bg-chrome/60')}>
              <Avatar initials={t.code} size={34} tone={t.code === 'SA' ? 'accent' : 'neutral'} rounded="full" />
              <span className="flex-1 min-w-0 flex flex-col"><span className="flex items-center justify-between"><span className="text-base font-semibold text-ink truncate">{t.name}</span><span className="text-xs text-faint">{t.when}</span></span><span className="text-sm text-muted truncate mt-[2px]">{t.last}</span></span>
              {t.unread > 0 && active !== t.id && <span className="h-[18px] min-w-[18px] rounded-full bg-accent text-on-accent text-[10.5px] font-semibold inline-flex items-center justify-center px-1">{t.unread}</span>}
            </button>
          ))}
        </aside>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="h-[52px] px-6 border-b border-line-soft flex items-center gap-3"><Avatar initials={th.code} size={28} tone="neutral" rounded="full" /><span className="text-base font-semibold text-ink">{th.name}</span><span className="text-sm text-faint">· Laura Vidal, titular</span></div>
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
            {msgs.map((m, i) => (
              <div key={i} className={cn('max-w-[62%] flex flex-col', m.me ? 'self-end items-end' : 'self-start')}>
                <span className={cn('px-3.5 py-2.5 rounded-xl text-base leading-[19px]', m.me ? 'bg-accent text-on-accent rounded-br-sm' : 'bg-surface border border-line text-ink rounded-bl-sm')}>{m.t}</span>
                <span className="text-[10.5px] text-faint mt-1">{m.h}</span>
              </div>
            ))}
          </div>
          <div className="px-6 pb-5 pt-2">
            <div className="field h-11 rounded-xl gap-2">
              <button onClick={() => notify('Adjunta una ficha o una foto')} className="text-faint hover:text-ink"><Paperclip size={15} /></button>
              <input className="flex-1 bg-transparent text-base" placeholder="Escribe a Farmacia Central…" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} />
              <Button variant="primary" size="sm" icon={<Send size={12} />} onClick={send}>Enviar</Button>
            </div>
          </div>
        </div>
      </div>
    </Screen>
  )
}
