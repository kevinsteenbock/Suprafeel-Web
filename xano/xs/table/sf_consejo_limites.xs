// Límites del consejo con Claude. Se lee la primera fila (id más bajo); sin filas valen los de serie.
// max_mensajes_dia: preguntas por usuario y día (hora de Madrid), admin aparte. max_caracteres: largo máximo de cada
// pregunta. max_turnos: preguntas por consulta. Al pasarse, 429 (o 400 si el mensaje es demasiado largo).
table sf_consejo_limites {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int max_mensajes_dia?=40
    int max_mensajes_dia_admin?=200
    int max_caracteres?=2000
    int max_turnos?=12
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
  ]
}
