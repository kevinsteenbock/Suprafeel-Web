import {
  LayoutGrid, Sparkles, Search, GraduationCap, Presentation, UserRound,
  CalendarDays, MapPin,
  ClipboardList, KeyRound, Briefcase, Package, BookOpen, Bot, ScrollText,
} from 'lucide-react'
import type { ShellConfig } from './Shell'
import type { User } from './auth'
import { filterProducts } from '@/data/products'
import { filterCourses } from '@/data/courses'
import { comercialesDe, iniciales, nombreDe, type Pharmacy } from '@/data/pharmacies'

/** Si no hay novedades, la chapa no se enseña (en vez de anunciar un 6 que no existe). */
const novedades = filterProducts('new').length || undefined
/** Cursos empezados y sin acabar (la chapa de Formación); sin ninguno, sin chapa. */
const cursosAMedias = filterCourses('progress').length || undefined

export const farmaciaShell: ShellConfig = {
  // La tarjeta de arriba la rellena shellDe() con la farmacia de la sesión.
  workspace: { initials: '', name: 'Tu farmacia', sub: '' },
  sections: [
    {
      title: 'Catálogo',
      items: [
        { label: 'Todos los productos', to: '/farmacia/catalogo', icon: LayoutGrid },
        { label: 'Novedades', to: '/farmacia/novedades', icon: Sparkles, badge: novedades },
        { label: 'Consejo por síntomas', to: '/farmacia/consejo', icon: Search },
      ],
    },
    {
      title: 'Apoyo',
      items: [
        { label: 'Formación', to: '/farmacia/formacion', icon: GraduationCap, badge: cursosAMedias, badgeTone: 'accent' },
        { label: 'Materiales PLV', to: '/farmacia/plv', icon: Presentation },
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
        { label: 'Consejo por síntomas', to: '/comercial/consejo', icon: Search },
      ],
    },
    {
      title: 'Equipo',
      items: [
        { label: 'Formación', to: '/comercial/formacion', icon: GraduationCap },
        { label: 'Materiales PLV', to: '/comercial/plv', icon: Presentation },
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
        { label: 'Cuentas y accesos', to: '/admin/cuentas', icon: KeyRound },
        // La chapa la calcula shellDe() con los comerciales que salen de las farmacias.
        { label: 'Comerciales', to: '/admin/comerciales', icon: Briefcase },
      ],
    },
    {
      title: 'Contenido',
      items: [
        { label: 'Catálogo', to: '/admin/catalogo', icon: Package },
        { label: 'Cursos', to: '/admin/cursos', icon: BookOpen },
        { label: 'Materiales PLV', to: '/admin/plv', icon: Presentation },
        { label: 'Chat inteligente', to: '/admin/chat', icon: Bot },
        { label: 'Registro de consultas', to: '/admin/registro', icon: ScrollText },
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
    const nombre = user.rep_name?.trim() || user.name
    return { ...config, workspace: { initials: iniciales(nombre), name: nombre, sub: cuantas(farmacias.length) } }
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
