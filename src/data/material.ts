import { SLUG_CATALOGO, SLUG_TRIPTICO } from './contenido'

/**
 * Material que se puede pedir. Para añadir uno: una fila aquí y su id en la lista de
 * xano/xs/api/material_solicitudes_post.xs. `imagen` es una ruta de `public/`; sin ella sale un icono.
 */
export interface Material {
  id: string
  titulo: string
  descripcion: string
  /** Documento que se puede ver en digital y cuya portada hace de imagen. */
  documento?: string
  imagen?: string
  /** Pide medidas, sitio y, si se quiere, una foto. */
  aMedida?: boolean
  /** Ya no se pide: se queda solo para dar nombre a solicitudes antiguas. */
  retirado?: boolean
}

export const MATERIALES: Material[] = [
  { id: 'expositor', titulo: 'Expositor de mesa', descripcion: 'Expositor para el mostrador. Indica cuántas unidades necesitas.' },
  { id: 'lineal', titulo: 'Lineal', descripcion: 'Material para el lineal de la farmacia.' },
  { id: 'vinilo-medida', titulo: 'Vinilo a medida', descripcion: 'Para tu escaparate o mostrador: indica las medidas y lo preparamos para tu farmacia.', aMedida: true },
  { id: 'catalogo-impreso', titulo: 'Catálogo físico', descripcion: 'El catálogo Suprafeel 2026 impreso, para tener en la farmacia.', documento: SLUG_CATALOGO },
  { id: 'infografia', titulo: 'Tríptico-infografía Suprafeel 2026', descripcion: 'Infografía con toda la gama.', documento: SLUG_TRIPTICO, retirado: true },
]

export const materialPorId = (id?: string) => MATERIALES.find((m) => m.id === id)
