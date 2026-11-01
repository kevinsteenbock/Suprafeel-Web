// Instrucciones (system) y esquema JSON del consejo con Claude, por versiones.
// Cada consulta (sf_consulta.prompt_version) guarda la versión con la que empezó y la usa siempre: el system de una
// conversación no puede cambiar a mitad. Las consultas nuevas usan la versión activa de número más alto.
// Para cambiar el prompt: añadir una fila con versión nueva y activo = true. No editar el texto ni el esquema de una
// versión que ya tiene consultas. Mientras texto = "PROVISIONAL" o no haya esquema, POST /consejo responde 503.
// esquema_texto: JSON Schema de la respuesta COMO TEXTO, tal cual xano/consejo/schema.json. Es el que se manda. Hace falta
// porque Xano guarda los campos json con las claves reordenadas (por largo), y en las salidas estructuradas el orden de
// properties es el orden en que Claude escribe la respuesta. esquema: la misma copia en json, solo para leerla en Xano
// (se usa si esquema_texto está vacío). Objetos con additionalProperties: false y required; sin minimum, maximum,
// minLength ni maxLength; enum sí. campo_productos = clave de primer nivel con la lista de productos recomendados,
// campo_producto_id = clave del slug de la tabla products dentro de cada producto (y del enum del esquema),
// campo_derivar = ruta (con puntos) del booleano que dice si hay que derivar al médico (con xano/consejo/schema.json,
// derivar.necesario).
table sf_consejo_prompt {
  auth = false

  schema {
    int id
    timestamp created_at?=now
    int version
    text texto
    json esquema
    text esquema_texto?
    text modelo?="claude-opus-5-5"
    text esfuerzo?="medium"
    bool activo?=false
    text campo_productos?="productos"
    text campo_producto_id?="id"
    text campo_derivar?="derivar.necesario"
    text nota?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "version"}]}
  ]
}
