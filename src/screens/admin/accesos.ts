import type { Usuario } from '@/app/datos'
import { nombreDeRep, repsDe, type Pharmacy } from '@/data/pharmacies'

/**
 * Cuentas sacadas de lo que sirve Xano (useDatos): quién tiene acceso a qué. Todo se calcula con
 * las listas que se le pasan; aquí no hay datos.
 */

/** «Sábado, 31 de octubre»: la fecha de hoy, calculada. */
export function fechaDeHoy(d: Date = new Date()): string {
  const t = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
  return t.charAt(0).toUpperCase() + t.slice(1)
}

/** «1 farmacia» / «216 farmacias» */
export const plural = (n: number, uno: string, varios: string) => `${n.toLocaleString('es-ES')} ${n === 1 ? uno : varios}`

/** Para buscar sin que importen mayúsculas ni tildes. */
export const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

/** Fecha de alta de una cuenta: «31 oct 2026» («—» si Xano no la trae). */
export function fechaAlta(ms: number): string {
  if (!ms) return '—'
  return new Date(ms).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '')
}

/** Cuentas de farmacia agrupadas por el slug de su farmacia. */
export function accesosPorFarmacia(usuarios: Usuario[]): Map<string, Usuario[]> {
  const m = new Map<string, Usuario[]>()
  for (const u of usuarios) {
    if (u.role !== 'farmacia' || !u.pharmacy_slug) continue
    m.set(u.pharmacy_slug, [...(m.get(u.pharmacy_slug) ?? []), u])
  }
  return m
}

/** Cuentas de comercial agrupadas por su rep_name (el mismo texto que Pharmacy.rep). */
export function accesosPorComercial(usuarios: Usuario[]): Map<string, Usuario[]> {
  const m = new Map<string, Usuario[]>()
  for (const u of usuarios) {
    if (u.role !== 'comercial') continue
    for (const r of repsDe(u.rep_name)) m.set(r, [...(m.get(r) ?? []), u])
  }
  return m
}

export const ROL_LABEL: Record<Usuario['role'], string> = { farmacia: 'Farmacia', comercial: 'Comercial', admin: 'Administrador' }

/** A qué está atada una cuenta, para leerlo en una celda. */
export function ataduraDe(u: Usuario, farmacias: Pharmacy[]): string {
  if (u.role === 'farmacia') return farmacias.find((p) => p.id === u.pharmacy_slug)?.name ?? (u.pharmacy_slug ? `Farmacia «${u.pharmacy_slug}» (no está en la lista)` : 'Sin farmacia')
  if (u.role === 'comercial') return nombreDeRep(u.rep_name) || 'Sin comercial'
  return 'Toda la consola'
}
