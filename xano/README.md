# Xano

Todo lo necesario para dar de alta el backend de Suprafeel Soft en Xano, sin tocar el front-end.

- **`PROMPT.md`** — el texto a pegar en una sesión de Claude Code con control de Chrome. Hace
  el trabajo dentro de Xano (instancia `suprafeel`, nada más) y al terminar rellena
  `HANDOFF.md`.
- **`seed/*.json`** — volcado exacto de `src/data/*.ts` (nada transcrito a mano; ver
  `scripts/dump-seed.mjs`). Es lo que se importa en cada tabla de Xano.
- **`HANDOFF.md`** — vacío hasta que el agente de Xano lo rellena. Cuando tenga contenido, es
  el punto de partida para conectar el front-end a la API real.

## Regenerar los seeds

Si `src/data/*.ts` cambia, vuelve a volcar el JSON:

```bash
npm run xano:seed
```
