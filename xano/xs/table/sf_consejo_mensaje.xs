// Registro de cada pregunta mandada a Claude (también las que fallan), para el límite diario y el coste.
// Se apunta antes de llamar (estado = enviado) y se completa al volver: ok | rechazo | cortada | error.
// Las filas con estado error (Claude no respondió o dio error HTTP) no cuentan para el límite diario.
// error = tipo y mensaje de error de Anthropic, nunca la clave. consulta = null si la pregunta no llegó a guardarse.
table sf_consejo_mensaje {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int user
    text rol
    int consulta?
    text estado?="enviado"
    int http?
    text stop_reason?
    text categoria?
    text modelo_servido?
    int tokens_entrada?=0
    int tokens_salida?=0
    int cache_escritura?=0
    int cache_lectura?=0
    decimal coste_usd?=0
    int ms?=0
    text error?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree", field: [{name: "user"}, {name: "created_at", op: "desc"}]}
    {type: "btree", field: [{name: "created_at", op: "desc"}]}
  ]
}
