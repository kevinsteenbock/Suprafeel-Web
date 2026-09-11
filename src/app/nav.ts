import {
  LayoutGrid, Sparkles, Search, GraduationCap, Presentation, UserRound,
  CalendarDays, MapPin,
  ClipboardList, KeyRound, Briefcase, Package, BookOpen, Bot, ScrollText,
} from 'lucide-react'
import type { ShellConfig } from './Shell'

export const farmaciaShell: ShellConfig = {
  workspace: { initials: 'FC', name: 'Farmacia Central', sub: 'Valencia · desde 2023' },
  sections: [
    {
      title: 'Catálogo',
      items: [
        { label: 'Todos los productos', to: '/farmacia/catalogo', icon: LayoutGrid },
        { label: 'Novedades', to: '/farmacia/novedades', icon: Sparkles, badge: 6 },
        { label: 'Consejo por síntomas', to: '/farmacia/consejo', icon: Search },
      ],
    },
    {
      title: 'Apoyo',
      items: [
        { label: 'Formación', to: '/farmacia/formacion', icon: GraduationCap, badge: 1, badgeTone: 'accent' },
        { label: 'Materiales PLV', to: '/farmacia/plv', icon: Presentation },
        { label: 'Mi comercial', to: '/farmacia/mi-comercial', icon: UserRound },
      ],
    },
  ],
  user: { initials: 'LV', name: 'Laura Vidal', role: 'Titular', settingsTo: '/farmacia/ajustes/perfil' },
}

export const comercialShell: ShellConfig = {
  workspace: { initials: 'ZL', name: 'Zona Levante', sub: '34 farmacias · Q3' },
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
  user: { initials: 'ÁF', name: 'Álvaro Ferrer', role: 'Comercial', settingsTo: '/comercial/ajustes' },
}

export const adminShell: ShellConfig = {
  workspace: { initials: 'SA', name: 'Suprafeel · Consola', sub: 'Producción · españa' },
  sections: [
    {
      title: 'Consola',
      items: [
        { label: 'Resumen', to: '/admin/resumen', icon: ClipboardList },
        { label: 'Cuentas y accesos', to: '/admin/cuentas', icon: KeyRound },
        { label: 'Comerciales', to: '/admin/comerciales', icon: Briefcase, badge: 6 },
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
  user: { initials: 'SA', name: 'Kevin Steenbock', role: 'Superadministrador', settingsTo: '/admin/resumen' },
}
