// Consultas al consejo con Claude: una fila por conversación.
// mensajes = el array messages tal cual se manda a Anthropic (solo se añade, nunca se edita): cada turno de assistant
// lleva su content completo, con los bloques thinking (firma incluida) y fallback. Nunca sale por la API.
// historial = lo legible [{pregunta, respuesta, fecha}], con los productos ya comprobados contra products.
// ultima = la última respuesta ya leída. productos = slugs recomendados en toda la consulta. derivo = si alguna
// respuesta dijo que había que derivar. Tokens y coste_usd son acumulados. valoracion: -1, 0 o 1 (la pone el dueño).
table sf_consulta {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    timestamp updated_at?=now
    int user
    text rol
    int prompt_version
    json mensajes
    json ultima?
    json historial?
    int turnos?=0
    int tokens_entrada?=0
    int tokens_salida?=0
    int cache_escritura?=0
    int cache_lectura?=0
    decimal coste_usd?=0
    text modelo_servido?
    int valoracion?=0
    text comentario?
    text primera_frase?
    text[] productos?
    bool derivo?=false
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "user"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}
