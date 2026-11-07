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
}

export const MATERIALES: Material[] = [
  { id: 'vinilo-medida', titulo: 'Vinilo a medida', descripcion: 'Para tu escaparate o mostrador: indica las medidas y lo preparamos para tu farmacia.', aMedida: true },
  { id: 'lineal', titulo: 'Lineal', descripcion: 'Material para el lineal de la farmacia.' },
  { id: 'expositor', titulo: 'Expositor de sobremesa', descripcion: 'Expositor para el mostrador.' },
  { id: 'catalogo-impreso', titulo: 'Catálogo Suprafeel 2026', descripcion: 'Míralo y descárgalo en digital, o pídelo impreso.', documento: SLUG_CATALOGO },
  { id: 'infografia', titulo: 'Tríptico-infografía Suprafeel 2026', descripcion: 'Infografía con toda la gama para tener a mano en la farmacia.', documento: SLUG_TRIPTICO },
]

export const materialPorId = (id?: string) => MATERIALES.find((m) => m.id === id)
