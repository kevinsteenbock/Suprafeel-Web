import {
  LayoutGrid, Sparkles, Compass, GraduationCap, Presentation, UserRound, BadgePercent, Inbox, MapPinned, ScrollText,
  CalendarDays, MapPin, FileSpreadsheet,
  ClipboardList, KeyRound, Briefcase, Package,
} from 'lucide-react'
import type { ShellConfig } from './Shell'
import type { User } from './auth'
import { novedades as listaNovedades } from '@/data/novedades'
import { comercialesDe, iniciales, nombreDe, repsDe, TODOS_LOS_COMERCIALES, type Pharmacy } from '@/data/pharmacies'

/** Si no hay novedades, la chapa no se enseña (en vez de anunciar un 6 que no existe). */
const novedades = listaNovedades.length || undefined

export const farmaciaShell: ShellConfig = {
  // La tarjeta de arriba la rellena shellDe() con la farmacia de la sesión.
  workspace: { initials: '', name: 'Tu farmacia', sub: '' },
  sections: [
    {
      title: 'Catálogo',
      items: [
        { label: 'Todos los productos', to: '/farmacia/catalogo', icon: LayoutGrid },
        { label: 'Novedades', to: '/farmacia/novedades', icon: Sparkles, badge: novedades },
        { label: 'Recomendador', to: '/farmacia/recomendador', icon: Compass },
      ],
    },
    {
      title: 'Apoyo',
      items: [
        { label: 'Formación', to: '/farmacia/formacion', icon: GraduationCap },
        { label: 'Documentos y material', to: '/farmacia/material', icon: Presentation },
        { label: 'Promociones y ofertas', to: '/farmacia/promociones', icon: BadgePercent },
        { label: 'Mi comercial', to: '/farmacia/mi-comercial', icon: UserRound },
      ],
    },
  ],
  // Nombre e iniciales salen de la sesión (Shell); aquí solo el rol que se enseña debajo.
  user: { initials: '', name: 'Tu cuenta', role: 'Farmacia', settingsTo: '/farmacia/ajustes/perfil' },
}

export const comercialShell: ShellConfig = {
  // La tarjeta de arriba la rellena shellDe() con el comercial de la sesión y sus farmacias.
  workspace: { initials: '', name: 'Comercial', sub: '' },
  sections: [
    {
      title: 'Comercial',
      items: [
        { label: 'Hoy', to: '/comercial/hoy', icon: CalendarDays },
        { label: 'Mis farmacias', to: '/comercial/farmacias', icon: MapPin },
        { label: 'Catálogo', to: '/comercial/catalogo', icon: LayoutGrid },
        { label: 'Novedades', to: '/comercial/novedades', icon: Sparkles, badge: novedades },
        { label: 'Recomendador', to: '/comercial/recomendador', icon: Compass },
      ],
    },
    {
      title: 'Equipo',
      items: [
        { label: 'Formación', to: '/comercial/formacion', icon: GraduationCap },
        { label: 'Argumentarios de venta', to: '/comercial/argumentarios', icon: ScrollText },
        { label: 'Documentos y material', to: '/comercial/material', icon: Presentation },
        { label: 'Promociones y ofertas', to: '/comercial/promociones', icon: BadgePercent },
      ],
    },
  ],
  user: { initials: '', name: 'Tu cuenta', role: 'Comercial', settingsTo: '/comercial/ajustes' },
}

export const adminShell: ShellConfig = {
  workspace: { initials: 'SA', name: 'Suprafeel · Consola', sub: 'Producción · España' },
  sections: [
    {
      title: 'Consola',
      items: [
        { label: 'Resumen', to: '/admin/resumen', icon: ClipboardList },
        { label: 'Bandeja', to: '/admin/bandeja', icon: Inbox },
        { label: 'Zona de la semana', to: '/admin/zona', icon: MapPinned },
        { label: 'Subir Excel', to: '/admin/excel', icon: FileSpreadsheet },
        { label: 'Cuentas y accesos', to: '/admin/cuentas', icon: KeyRound },
        // La chapa la calcula shellDe() con los comerciales que salen de las farmacias.
        { label: 'Comerciales', to: '/admin/comerciales', icon: Briefcase },
      ],
    },
    {
      title: 'Contenido',
      items: [
        { label: 'Catálogo', to: '/admin/catalogo', icon: Package },
        { label: 'Formación', to: '/admin/formacion', icon: GraduationCap },
        { label: 'Argumentarios de venta', to: '/admin/argumentarios', icon: ScrollText },
        { label: 'Promociones y ofertas', to: '/admin/promociones', icon: BadgePercent },
      ],
    },
  ],
  user: { initials: '', name: 'Tu cuenta', role: 'Superadministrador', settingsTo: '/admin/resumen' },
}

const cuantas = (n: number) => (n === 1 ? '1 farmacia' : `${n} farmacias`)

/**
 * La barra lateral con los datos de la sesión: la tarjeta de arriba a la izquierda (comercial: su
 * nombre y cuántas farmacias lleva; farmacia: la suya) y las chapas que salen de contar datos reales.
 */
export function shellDe(config: ShellConfig, user: User | null, farmacias: Pharmacy[]): ShellConfig {
  if (!user) return config
  if (user.role === 'comercial') {
    const todas = user.rep_name === TODOS_LOS_COMERCIALES
    const reps = repsDe(todas ? '' : user.rep_name)
    const nombre = (reps.length === 1 ? reps[0] : '') || user.name
    const sub = todas ? `Todos los comerciales · ${cuantas(farmacias.length)}` : reps.length > 1 ? `${reps.length} comerciales · ${cuantas(farmacias.length)}` : cuantas(farmacias.length)
    return { ...config, workspace: { initials: iniciales(nombre), name: nombre, sub } }
  }
  if (user.role === 'farmacia') {
    const f = farmacias.find((p) => p.id === user.pharmacy_slug)
    const workspace = f
      ? { initials: f.code || iniciales(nombreDe(f)), name: nombreDe(f), sub: f.city }
      : { initials: iniciales(user.name), name: user.name, sub: 'Farmacia' }
    return { ...config, workspace }
  }
  const reps = comercialesDe(farmacias).length || undefined
  return {
    ...config,
    sections: config.sections.map((s) => ({
      ...s,
      items: s.items.map((it) => (it.to === '/admin/comerciales' ? { ...it, badge: reps } : it)),
    })),
  }
}
