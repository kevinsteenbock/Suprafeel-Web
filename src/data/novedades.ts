/**
 * Novedades: solo lo que Suprafeel vaya lanzando. Hoy no hay ninguna. Para publicar una, se añade aquí
 * con su imagen, su texto y su material, y la pantalla y la chapa del menú salen solas.
 */
export interface Novedad {
  id: string
  titulo: string
  texto: string
  /** Ruta dentro de `public/`, sin barra inicial. */
  imagen: string
  /** Producto del catálogo al que lleva, si lo hay. */
  producto?: string
  material?: { titulo: string; archivo: string }[]
}

export const novedades: Novedad[] = []
