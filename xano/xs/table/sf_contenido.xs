// Contenido para farmacias que no vive en el repositorio (es público): fichas de formación, recomendador,
// campañas y lista de documentos. Una fila por clave. Solo se lee con sesión (GET /contenido, GET /documentos/{slug}).
// Las rutas de archivo de `documentos` son de archivos privados y nunca salen tal cual: se firman al pedirlas.
table sf_contenido {
  auth = false

  schema {
    int id
    timestamp created_at?=now {
      visibility = "private"
    }

    text clave filters=trim
    json valor?
  }

  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "btree|unique", field: [{name: "clave", op: "asc"}]}
  ]
}
