/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base de la API de Xano. Sin ella se usa la del workspace Suprafeel (xano/HANDOFF.md). */
  readonly VITE_XANO_API?: string
}
